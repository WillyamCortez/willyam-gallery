import { Photo, Gallery } from "@/types";

export function getBaseFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export function formatForLightroomComma(photos: Photo[]): string {
  return photos.map((p) => p.original_filename).join(", ");
}

export function formatForLightroomBaseComma(photos: Photo[]): string {
  return photos.map((p) => getBaseFilename(p.original_filename)).join(", ");
}

export function formatForLightroomQuotes(photos: Photo[]): string {
  return photos.map((p) => `"${getBaseFilename(p.original_filename)}"`).join(" ");
}

export function generateSelectionReportText(
  gallery: Gallery,
  selectedPhotos: Photo[]
): string {
  const total = selectedPhotos.length;
  const limit = gallery.photo_limit;
  const extras = Math.max(0, total - limit);
  const extraTotal = extras * gallery.extra_photo_price;

  let report = `=======================================================\n`;
  report += `RELATÓRIO DE SELEÇÃO DE FOTOS — ${gallery.title.toUpperCase()}\n`;
  report += `=======================================================\n\n`;
  report += `Cliente: ${gallery.client_name}\n`;
  if (gallery.client_email) report += `E-mail: ${gallery.client_email}\n`;
  if (gallery.client_phone) report += `Telefone: ${gallery.client_phone}\n`;
  if (gallery.event_date) report += `Data do Ensaio/Evento: ${gallery.event_date}\n`;
  report += `Data da Finalização: ${new Date().toLocaleDateString("pt-BR")}\n\n`;

  report += `-------------------------------------------------------\n`;
  report += `RESUMO CONTRATUAL:\n`;
  report += `-------------------------------------------------------\n`;
  report += `Fotos Inclusas no Pacote: ${limit}\n`;
  report += `Fotos Selecionadas pelo Cliente: ${total}\n`;
  report += `Fotos Excedentes: ${extras}\n`;
  report += `Valor unitário da foto extra: R$ ${gallery.extra_photo_price.toFixed(2)}\n`;
  report += `Total Adicional a Cobrar: R$ ${extraTotal.toFixed(2)}\n\n`;

  report += `-------------------------------------------------------\n`;
  report += `STRING PARA COPIAR E COLAR NO LIGHTROOM:\n`;
  report += `-------------------------------------------------------\n`;
  report += `${formatForLightroomComma(selectedPhotos)}\n\n`;

  report += `-------------------------------------------------------\n`;
  report += `DETALHAMENTO DAS FOTOS ESCOLHIDAS:\n`;
  report += `-------------------------------------------------------\n`;

  if (selectedPhotos.length === 0) {
    report += `Nenhuma foto selecionada.\n`;
  } else {
    selectedPhotos.forEach((photo, index) => {
      report += `${(index + 1).toString().padStart(2, "0")}. Arquivo: ${photo.original_filename}\n`;
    });
  }

  report += `\n=======================================================\n`;
  report += `Gerado por Willyam Cortez Fotografia\n`;
  return report;
}

export function generateSelectionCSV(selectedPhotos: Photo[]): string {
  const headers = ["Index", "Arquivo", "Nome Base"];
  const rows = selectedPhotos.map((photo, index) => {
    return [
      index + 1,
      `"${photo.original_filename}"`,
      `"${getBaseFilename(photo.original_filename)}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
