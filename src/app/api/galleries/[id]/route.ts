import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { deleteR2GalleryFolder, getPresignedViewUrl } from "@/lib/r2/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = params.id;

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseUrl = rawUrl?.trim().replace(/^["']|["']$/g, "");

    if (
      supabaseUrl &&
      !supabaseUrl.includes("your-project")
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

      // 1. Gera as URLs assinadas de visualização para cada foto vinda do Cloudflare R2
      const photosWithUrls = await Promise.all(
        (data.photos || []).map(async (photo: any) => {
          let preview_url = photo.preview_url;
          if (!preview_url && photo.r2_key) {
            try {
              preview_url = await getPresignedViewUrl(photo.r2_key, 86400);
            } catch (err) {
              console.warn("Erro ao gerar URL para foto:", photo.r2_key, err);
            }
          }
          return {
            ...photo,
            preview_url: preview_url || null,
            thumbnail_url: preview_url || null,
            download_url: preview_url || null,
          };
        })
      );

      // Ordena fotos por order_index
      photosWithUrls.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

      // Ordena seções por order_index
      const sortedSections = (data.sections || []).sort(
        (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );

      // 2. Resolve URL de capa
      let coverUrl = data.cover_image_key;
      if (coverUrl && !coverUrl.startsWith("http")) {
        try {
          coverUrl = await getPresignedViewUrl(coverUrl, 86400);
        } catch (e) {}
      } else if (!coverUrl && photosWithUrls.length > 0 && photosWithUrls[0].preview_url) {
        coverUrl = photosWithUrls[0].preview_url;
      }

      return NextResponse.json({
        gallery: {
          ...data,
          cover_image_key: coverUrl,
          sections: sortedSections,
          photos: photosWithUrls,
        },
      });
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

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseUrl = rawUrl?.trim().replace(/^["']|["']$/g, "");

    if (
      supabaseUrl &&
      !supabaseUrl.includes("your-project")
    ) {
      const supabase = createClientServer();
      const checkIsUUID = (val: any) =>
        typeof val === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      let query = supabase
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
        });

      if (checkIsUUID(galleryId)) {
        query = query.eq("id", galleryId);
      } else {
        query = query.eq("slug", galleryId);
      }

      const { data, error } = await query.select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Sincroniza seções no Supabase se enviadas
      if (body.sections && Array.isArray(body.sections)) {
        for (const sec of body.sections) {
          if (sec.id && checkIsUUID(sec.id)) {
            await supabase
              .from("sections")
              .upsert({
                id: sec.id,
                gallery_id: data.id,
                name: sec.name,
                order_index: typeof sec.order_index === "number" ? sec.order_index : 0,
              });
          } else if (sec.name) {
            await supabase
              .from("sections")
              .insert({
                gallery_id: data.id,
                name: sec.name,
                order_index: typeof sec.order_index === "number" ? sec.order_index : 0,
              });
          }
        }
      }

      const { data: updatedSections } = await supabase
        .from("sections")
        .select("*")
        .eq("gallery_id", data.id)
        .order("order_index", { ascending: true });

      return NextResponse.json({
        success: true,
        gallery: { ...data, sections: updatedSections || [] },
      });
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
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseUrl = rawUrl?.trim().replace(/^["']|["']$/g, "");

    if (
      supabaseUrl &&
      !supabaseUrl.includes("your-project")
    ) {
      const supabase = createClientServer();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(galleryId);

      let query = supabase.from("galleries").delete();
      if (isUUID) {
        query = query.eq("id", galleryId);
      } else {
        query = query.eq("slug", galleryId);
      }

      const { error } = await query;

      if (error) {
        console.error("Erro ao excluir galeria do Supabase:", error);
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
