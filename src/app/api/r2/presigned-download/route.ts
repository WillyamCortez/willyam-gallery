import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/r2/client";

export async function POST(request: NextRequest) {
  try {
    const { key, filename } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Chave R2 (key) é obrigatória." },
        { status: 400 }
      );
    }

    const downloadFilename = filename || key.split("/").pop() || "foto.jpg";

    const downloadUrl = await getPresignedDownloadUrl(
      key,
      downloadFilename,
      1800 // Válido por 30 minutos
    );

    return NextResponse.json({
      downloadUrl,
      filename: downloadFilename,
    });
  } catch (error: any) {
    console.error("Erro ao gerar presigned download URL:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar download URL" },
      { status: 500 }
    );
  }
}
