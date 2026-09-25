import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseUrl = rawUrl?.trim().replace(/^["']|["']$/g, "");
    if (
      supabaseUrl &&
      !supabaseUrl.includes("your-project")
    ) {
      const supabase = createClientServer();
      const { data, error } = await supabase
        .from("galleries")
        .select(`
          *,
          sections (*),
          photos (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar galerias do Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ galleries: data || [] });
    }

    return NextResponse.json({ galleries: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      clientName,
      clientEmail,
      clientPhone,
      accessPin,
      photoLimit,
      extraPhotoPrice,
      googleDriveUrl,
      eventDate,
      sections = [],
      status = "selection",
    } = body;

    if (!title || !slug || !clientName) {
      return NextResponse.json(
        { error: "Título, slug e nome do cliente são obrigatórios." },
        { status: 400 }
      );
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseUrl = rawUrl?.trim().replace(/^["']|["']$/g, "");
    const isSupabaseConfigured = Boolean(
      supabaseUrl && !supabaseUrl.includes("your-project")
    );

    if (isSupabaseConfigured) {
      const supabase = createClientServer();

      let photographerId: string | undefined = undefined;

      // 1. Tenta obter o ID do fotógrafo através do usuário autenticado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          photographerId = user.id;
          // Garantir que a tabela profiles possua um registro para este usuário
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from("profiles").insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Fotógrafo",
              email: user.email || "contato@estudio.com",
            });
          }
        }
      } catch (authErr) {
        console.warn("Usuário autenticado não encontrado:", authErr);
      }

      // 2. Caso não esteja autenticado via Supabase Auth, busca um perfil existente
      if (!photographerId) {
        const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
        photographerId = profiles?.[0]?.id;
      }

      // 3. Se a tabela profiles estiver vazia, cria um perfil padrão para não violar a NOT NULL constraint
      if (!photographerId) {
        const defaultProfileId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
        const { data: insertedProfile } = await supabase
          .from("profiles")
          .upsert(
            {
              id: defaultProfileId,
              full_name: "Willyam Cortez",
              studio_name: "Willyam Cortez Fotografia",
              email: "willyamdepaivacortez02@gmail.com",
              phone: "+55 (53) 99998-3022",
              pix_key: "willyamdepaivacortez02@gmail.com",
            },
            { onConflict: "id" }
          )
          .select("id")
          .maybeSingle();

        photographerId = insertedProfile?.id || defaultProfileId;
      }

      const galleryPayload: any = {
        photographer_id: photographerId,
        title,
        slug,
        description: description || null,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        access_pin: accessPin || null,
        photo_limit: photoLimit || 20,
        extra_photo_price: extraPhotoPrice || 15.0,
        google_drive_url: googleDriveUrl || null,
        event_date: eventDate || null,
        status,
      };

      // 1. Cria a galeria
      const { data: gallery, error: galleryError } = await supabase
        .from("galleries")
        .insert(galleryPayload)
        .select()
        .single();

      if (galleryError) {
        return NextResponse.json({ error: galleryError.message }, { status: 500 });
      }

      // 2. Se houver seções iniciais, cadastra na tabela sections
      let createdSections: any[] = [];
      if (sections && sections.length > 0) {
        const sectionsData = sections.map((secName: string, index: number) => ({
          gallery_id: gallery.id,
          name: typeof secName === "string" ? secName.trim() : (secName as any).name || "Seção",
          order_index: index,
        }));

        const { data: insertedSections } = await supabase
          .from("sections")
          .insert(sectionsData)
          .select();

        createdSections = insertedSections || [];
      }

      return NextResponse.json({
        success: true,
        gallery: {
          ...gallery,
          sections: createdSections,
          photos: [],
        },
      });
    }

    // Retorno de fallback mock completo
    const createdSections = (sections || []).map((sec: string, index: number) => ({
      id: `sec-${Date.now()}-${index}`,
      name: sec.trim(),
      order_index: index,
    }));

    return NextResponse.json({
      success: true,
      gallery: {
        id: `mock-${Date.now()}`,
        title,
        slug,
        description: description || null,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        access_pin: accessPin || null,
        photo_limit: photoLimit || 20,
        extra_photo_price: extraPhotoPrice || 15.0,
        google_drive_url: googleDriveUrl || null,
        event_date: eventDate || null,
        status,
        sections: createdSections,
        photos: [],
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar galeria:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
