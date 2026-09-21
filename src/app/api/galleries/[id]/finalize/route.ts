import { NextRequest, NextResponse } from "next/server";
import { mockGalleries } from "@/lib/mock-data";
import { Resend } from "resend";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { clientName, clientEmail, selectedPhotoIds } = await request.json();
    const galleryId = params.id;

    const gallery = mockGalleries.find((g) => g.id === galleryId || g.slug === galleryId);
    const totalSelected = selectedPhotoIds?.length || 0;
    const photoLimit = gallery?.photo_limit || 20;
    const extraCount = Math.max(0, totalSelected - photoLimit);
    const extraPrice = gallery?.extra_photo_price || 15.0;
    const totalExtraAmount = extraCount * extraPrice;

    // Disparo de e-mail transacional via Resend se RESEND_API_KEY estiver configurada
    const resendApiKey = process.env.RESEND_API_KEY;
    const photographerEmail =
      process.env.PHOTOGRAPHER_NOTIFICATION_EMAIL || "contato@willyamcortez.com.br";

    if (resendApiKey && !resendApiKey.includes("your_resend")) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "Willyam Cortez <notificacoes@willyamcortez.com.br>",
          to: photographerEmail,
          subject: `✨ Seleção Finalizada: ${gallery?.title || "Galeria"} (${totalSelected} fotos)`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
              <h2 style="font-family: serif; color: #111;">Seleção de Fotos Finalizada!</h2>
              <p>O cliente <strong>${clientName}</strong> (${clientEmail}) acabou de finalizar e travar a seleção do ensaio <strong>${gallery?.title}</strong>.</p>
              
              <div style="background: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Total de Fotos Escolhidas:</strong> ${totalSelected}</p>
                <p style="margin: 5px 0;"><strong>Fotos Inclusas no Pacote:</strong> ${photoLimit}</p>
                <p style="margin: 5px 0;"><strong>Fotos Extras:</strong> ${extraCount}</p>
                ${extraCount > 0 ? `<p style="margin: 5px 0; color: #b45309;"><strong>Valor Adicional das Fotos Extras:</strong> R$ ${totalExtraAmount.toFixed(2)}</p>` : ""}
              </div>

              <p>Acesse o painel para exportar os nomes dos arquivos diretamente para a busca do Lightroom:</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/galleries/${galleryId}/selections" style="background: #111; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Ver Seleção no Painel</a></p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Falha no disparo do email Resend:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seleção finalizada e travada com sucesso!",
      locked_at: new Date().toISOString(),
      summary: {
        totalSelected,
        photoLimit,
        extraCount,
        totalExtraAmount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
