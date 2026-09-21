import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { photoId, isSelected } = await request.json();
    const galleryId = params.id;

    if (!photoId) {
      return NextResponse.json({ error: "photoId é obrigatório" }, { status: 400 });
    }

    // Em produção, persistiria na tabela `selections` do Supabase
    // const supabase = createClientServer();
    // await supabase.from('selections').upsert({ gallery_id: galleryId, photo_id: photoId, is_selected: isSelected, updated_at: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      galleryId,
      photoId,
      isSelected,
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
