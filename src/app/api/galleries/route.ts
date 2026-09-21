import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
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

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
    ) {
      const supabase = createClientServer();

      // Busca fotógrafo existente no banco
      const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
      let photographerId = profiles?.[0]?.id;

      const galleryPayload: any = {
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

      if (photographerId) {
        galleryPayload.photographer_id = photographerId;
      }

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
      if (sections && sections.length > 0) {
        const sectionsData = sections.map((secName: string, index: number) => ({
          gallery_id: gallery.id,
          name: secName.trim(),
          order_index: index,
        }));

        await supabase.from("sections").insert(sectionsData);
      }

      return NextResponse.json({ success: true, gallery });
    }

    // Retorno de fallback mock
    return NextResponse.json({
      success: true,
      gallery: {
        id: `mock-${Date.now()}`,
        title,
        slug,
        client_name: clientName,
        status,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar galeria:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
