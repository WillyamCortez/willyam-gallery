import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { deleteR2GalleryFolder } from "@/lib/r2/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = params.id;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
    ) {
      const supabase = createClientServer();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(galleryId);

      let query = supabase.from("galleries").select(`
        *,
        sections (*),
        photos (*)
      `);

      if (isUUID) {
        query = query.eq("id", galleryId);
      } else {
        query = query.eq("slug", galleryId);
      }

      const { data, error } = await query.single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ gallery: data });
    }

    return NextResponse.json({ gallery: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = params.id;
    const body = await request.json();

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
    ) {
      const supabase = createClientServer();
      const { data, error } = await supabase
        .from("galleries")
        .update({
          title: body.title,
          status: body.status,
          photo_limit: body.photo_limit,
          extra_photo_price: body.extra_photo_price,
          access_pin: body.access_pin,
          google_drive_url: body.google_drive_url,
          selection_locked_at: body.selection_locked_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", galleryId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, gallery: data });
    }

    return NextResponse.json({ success: true, gallery: body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = params.id;
    let deletedR2Count = 0;

    // 1. Exclui IMEDIATAMENTE todos os arquivos físicos da galeria no Cloudflare R2
    try {
      if (process.env.R2_ACCOUNT_ID && !process.env.R2_ACCOUNT_ID.includes("dummy")) {
        const r2Result = await deleteR2GalleryFolder(galleryId);
        deletedR2Count = r2Result.deletedCount;
      }
    } catch (r2Err) {
      console.error(`Erro ao limpar fotos do Cloudflare R2 para a galeria ${galleryId}:`, r2Err);
      // Não interrompe para permitir a exclusão do banco de dados caso o bucket já esteja limpo
    }

    // 2. Exclui a galeria e registros relacionados no Supabase (CASCADE exclui photos, sections e selections)
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
    ) {
      const supabase = createClientServer();
      const { error } = await supabase.from("galleries").delete().eq("id", galleryId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Galeria e fotos no Cloudflare R2 excluídas com sucesso",
      deletedR2Photos: deletedR2Count,
    });
  } catch (error: any) {
    console.error("Erro na rota de exclusão de galeria:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
