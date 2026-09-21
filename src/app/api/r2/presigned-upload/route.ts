import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl, buildPhotoR2Key } from "@/lib/r2/client";

export async function POST(request: NextRequest) {
  try {
    const { galleryId, filename, contentType } = await request.json();

    if (!galleryId || !filename) {
      return NextResponse.json(
        { error: "galleryId e filename são obrigatórios." },
        { status: 400 }
      );
    }

    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const r2Key = buildPhotoR2Key(galleryId, photoId, filename);

    const { uploadUrl, key } = await getPresignedUploadUrl(
      r2Key,
      contentType || "image/jpeg",
      3600 // Expira em 1 hora
    );

    return NextResponse.json({
      uploadUrl,
      key,
      photoId,
    });
  } catch (error: any) {
    console.error("Erro ao gerar presigned upload URL:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar upload URL" },
      { status: 500 }
    );
  }
}
