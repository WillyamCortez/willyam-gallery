-- ==============================================================================
-- SCHEMA INICIAL: PLATAFORMA DE GALERIA FOTOGRÁFICA PROFISSIONAL (PIXIESET STYLE)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Perfis de Fotógrafos
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    studio_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    watermark_url TEXT,
    watermark_type TEXT DEFAULT 'grid' CHECK (watermark_type IN ('grid', 'center', 'text')),
    watermark_text TEXT,
    watermark_opacity NUMERIC(3,2) DEFAULT 0.35 CHECK (watermark_opacity >= 0.05 AND watermark_opacity <= 1.00),
    pix_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Galerias / Coleções
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_key TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    access_pin TEXT, -- PIN de 4 a 6 dígitos (ou NULL se for aberta)
    status TEXT NOT NULL DEFAULT 'selection' CHECK (status IN ('selection', 'delivered')),
    photo_limit INTEGER NOT NULL DEFAULT 20,
    extra_photo_price NUMERIC(10,2) NOT NULL DEFAULT 15.00,
    google_drive_url TEXT, -- Link da pasta no Google Drive para entrega final
    selection_locked_at TIMESTAMPTZ, -- Quando travada, cliente não pode mais alterar seleção
    event_date DATE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Seções/Abas da Galeria (ex: "Making Of", "Cerimônia", "Ensaio")
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Fotos
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    r2_key TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    blurhash TEXT,
    aspect_ratio NUMERIC(5,4),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Seleções (Aprovação Unificada por Galeria)
CREATE TABLE IF NOT EXISTS public.selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_gallery_photo_selection UNIQUE (gallery_id, photo_id)
);

-- Índices para alta performance de consulta
CREATE INDEX IF NOT EXISTS idx_galleries_slug ON public.galleries(slug);
CREATE INDEX IF NOT EXISTS idx_galleries_photographer ON public.galleries(photographer_id);
CREATE INDEX IF NOT EXISTS idx_sections_gallery ON public.sections(gallery_id, order_index);
CREATE INDEX IF NOT EXISTS idx_photos_gallery ON public.photos(gallery_id, order_index);
CREATE INDEX IF NOT EXISTS idx_photos_section ON public.photos(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_selections_gallery ON public.selections(gallery_id);
CREATE INDEX IF NOT EXISTS idx_selections_photo ON public.selections(photo_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;

-- Profiles: Fotógrafo gerencia apenas seu perfil
CREATE POLICY "Fotógrafo visualiza seu perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Fotógrafo atualiza seu perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Galleries:
-- 1. Fotógrafo tem controle total sobre suas galerias
CREATE POLICY "Fotógrafo gerencia suas galerias"
    ON public.galleries FOR ALL
    USING (auth.uid() = photographer_id);

-- 2. Leitura pública de galeria por slug/id (para clientes acessarem a página)
CREATE POLICY "Leitura pública de galerias"
    ON public.galleries FOR SELECT
    USING (TRUE);

-- Sections:
CREATE POLICY "Fotógrafo gerencia seções"
    ON public.sections FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.galleries
        WHERE galleries.id = sections.gallery_id
        AND galleries.photographer_id = auth.uid()
    ));

CREATE POLICY "Leitura pública de seções"
    ON public.sections FOR SELECT
    USING (TRUE);

-- Photos:
CREATE POLICY "Fotógrafo gerencia fotos"
    ON public.photos FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.galleries
        WHERE galleries.id = photos.gallery_id
        AND galleries.photographer_id = auth.uid()
    ));

CREATE POLICY "Leitura pública de fotos"
    ON public.photos FOR SELECT
    USING (TRUE);

-- Selections:
-- 1. Fotógrafo tem leitura e gerenciamento total das seleções
CREATE POLICY "Fotógrafo gerencia seleções"
    ON public.selections FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.galleries
        WHERE galleries.id = selections.gallery_id
        AND galleries.photographer_id = auth.uid()
    ));

-- 2. Leitura pública de seleções da galeria
CREATE POLICY "Leitura pública de seleções"
    ON public.selections FOR SELECT
    USING (TRUE);

-- 3. Clientes podem inserir ou atualizar seleções apenas se a galeria NÃO estiver travada
CREATE POLICY "Cliente atualiza seleções em galeria destravada"
    ON public.selections FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.galleries
        WHERE galleries.id = selections.gallery_id
        AND galleries.selection_locked_at IS NULL
        AND galleries.status = 'selection'
    ));

CREATE POLICY "Cliente modifica seleções em galeria destravada"
    ON public.selections FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.galleries
        WHERE galleries.id = selections.gallery_id
        AND galleries.selection_locked_at IS NULL
        AND galleries.status = 'selection'
    ));

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Trigger para criar automaticamente o perfil ao criar um novo usuário no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, studio_name)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Fotógrafo'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'studio_name', 'Estúdio Fotográfico')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar coluna updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_galleries_updated_at
    BEFORE UPDATE ON public.galleries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_selections_updated_at
    BEFORE UPDATE ON public.selections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: Validação segura de PIN da galeria
CREATE OR REPLACE FUNCTION public.verify_gallery_pin(
    gallery_slug TEXT,
    pin_input TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    correct_pin TEXT;
BEGIN
    SELECT access_pin INTO correct_pin
    FROM public.galleries
    WHERE slug = gallery_slug;

    IF correct_pin IS NULL OR correct_pin = '' THEN
        RETURN TRUE; -- Galeria aberta sem PIN
    END IF;

    RETURN correct_pin = pin_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
