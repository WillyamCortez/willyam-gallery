-- ==============================================================================
-- SEED DATA: DADOS DE DEMONSTRAÇÃO PARA DESENVOLVIMENTO
-- ==============================================================================

-- Inserir Perfil Demo (UUID fictício correspondente a um usuário auth)
INSERT INTO public.profiles (
    id, full_name, studio_name, email, phone, watermark_type, watermark_text, watermark_opacity, pix_key
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Willyam Cortez',
    'Willyam Cortez Fotografia',
    'willyamdepaivacortez02@gmail.com',
    '+55 (53) 99998-3022',
    'grid',
    'WILLYAM CORTEZ © PROVA',
    0.35,
    'willyamdepaivacortez02@gmail.com'
) ON CONFLICT (id) DO NOTHING;

-- Inserir Galeria em Modo de Seleção (Casamento Mariana & Rodrigo)
INSERT INTO public.galleries (
    id, photographer_id, title, slug, description, cover_image_key, client_name, client_email,
    access_pin, status, photo_limit, extra_photo_price, google_drive_url, event_date
) VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Mariana & Rodrigo — Wedding Day',
    'mariana-e-rodrigo',
    'Uma celebração inesquecível ao entardecer no campo. Selecione as suas 25 fotos favoritas para o álbum.',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
    'Mariana Silva & Rodrigo Santos',
    'mariana.silva@email.com',
    '1234',
    'selection',
    25,
    18.00,
    'https://drive.google.com/drive/folders/demo-folder-mariana-rodrigo',
    '2026-05-18'
) ON CONFLICT (id) DO NOTHING;

-- Inserir Galeria em Modo de Entrega Final (Ensaio Gestante Camila)
INSERT INTO public.galleries (
    id, photographer_id, title, slug, description, cover_image_key, client_name, client_email,
    access_pin, status, photo_limit, extra_photo_price, google_drive_url, event_date
) VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Camila & Lucca — Esperando Lucca',
    'camila-gestante',
    'A doçura e a luz da espera do Lucca. Suas fotos tratadas em alta resolução estão prontas!',
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=2000&q=80',
    'Camila Duarte',
    'camila.duarte@email.com',
    '',
    'delivered',
    30,
    15.00,
    'https://drive.google.com/drive/folders/demo-drive-camila-gestante',
    '2026-06-12'
) ON CONFLICT (id) DO NOTHING;

-- Inserir Seções da Galeria Mariana & Rodrigo
INSERT INTO public.sections (id, gallery_id, name, order_index) VALUES
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Making Of', 0),
('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380d55', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Cerimônia', 1),
('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380d66', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Ensaio dos Noivos', 2),
('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380d77', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Recepção & Festa', 3)
ON CONFLICT (id) DO NOTHING;
