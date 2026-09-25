import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { deleteR2Object } from "@/lib/r2/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      galleryId,
      sectionId,
      r2Key,
      originalFilename,
      width,
      height,
      aspectRatio,
      orderIndex,
    } = body;

    if (!galleryId || !r2Key || !originalFilename) {
      return NextResponse.json(
        { error: "galleryId, r2Key e originalFilename são obrigatórios." },
        { status: 400 }
      );
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseUrl = rawUrl?.trim().replace(/^["']|["']$/g, "");

    if (
      supabaseUrl &&
      !supabaseUrl.includes("your-project")
    ) {
      const supabase = createClientServer();

      const isUUID = (val: any) =>
        typeof val === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      // 1. Resolve o ID real da galeria (se foi passado um slug)
      let realGalleryId = galleryId;
      if (!isUUID(galleryId)) {
        const { data: g } = await supabase
          .from("galleries")
          .select("id")
          .eq("slug", galleryId)
          .maybeSingle();
        if (g?.id) {
          realGalleryId = g.id;
        }
      }

      // 2. Valida se section_id é um UUID válido e realmente existe na tabela sections
      let realSectionId: string | null = null;
      if (sectionId && isUUID(sectionId)) {
        const { data: sec } = await supabase
          .from("sections")
          .select("id")
          .eq("id", sectionId)
          .maybeSingle();
        if (sec?.id) {
          realSectionId = sec.id;
        }
      }

      // 3. Garante que order_index esteja no range válido de INTEGER do PostgreSQL (-2147483648 a 2147483647)
      const safeOrderIndex =
        typeof orderIndex === "number" && !isNaN(orderIndex)
          ? Math.floor(Math.abs(orderIndex)) % 2147483647
          : 0;

      const { data, error } = await supabase
        .from("photos")
        .insert({
          gallery_id: realGalleryId,
          section_id: realSectionId,
          r2_key: r2Key,
          original_filename: originalFilename,
          width: width || 2400,
          height: height || 1600,
          aspect_ratio: aspectRatio || 1.5,
          order_index: safeOrderIndex,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar foto no Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, photo: data });
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: `photo-${Date.now()}`,
        gallery_id: galleryId,
        r2_key: r2Key,
        original_filename: originalFilename,
      },
    });
  } catch (error: any) {
    console.error("Erro na rota de criação de foto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
