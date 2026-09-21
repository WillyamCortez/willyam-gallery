"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Copy,
  Check,
  FileText,
  Download,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { Gallery, Photo } from "@/types";
import {
  formatForLightroomComma,
  formatForLightroomBaseComma,
  formatForLightroomQuotes,
  generateSelectionReportText,
  generateSelectionCSV,
} from "@/lib/lightroom";
import { formatCurrency } from "@/lib/utils";

interface LightroomExportModalProps {
  gallery: Gallery;
  selectedPhotos: Photo[];
  isOpen: boolean;
  onClose: () => void;
}

export const LightroomExportModal: React.FC<LightroomExportModalProps> = ({
  gallery,
  selectedPhotos,
  isOpen,
  onClose,
}) => {
  const [formatType, setFormatType] = useState<"comma" | "baseComma" | "quotes">("comma");
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const total = selectedPhotos.length;
  const limit = gallery.photo_limit;
  const extras = Math.max(0, total - limit);
  const extraTotal = extras * gallery.extra_photo_price;

  let exportString = "";
  if (formatType === "comma") {
    exportString = formatForLightroomComma(selectedPhotos);
  } else if (formatType === "baseComma") {
    exportString = formatForLightroomBaseComma(selectedPhotos);
  } else {
    exportString = formatForLightroomQuotes(selectedPhotos);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(exportString);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleDownloadTxtReport = () => {
    const content = generateSelectionReportText(gallery, selectedPhotos);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Relatorio-Selecao-${gallery.slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const content = generateSelectionCSV(selectedPhotos);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Selecao-Fotos-${gallery.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-surface-950 border border-white/15 text-white rounded-2xl shadow-2xl p-6 sm:p-8 my-8"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans text-balance text-2xl text-white font-normal">
              Exportar para Lightroom / Capture One
            </h2>
            <p className="text-xs text-white/60 font-sans">
              {gallery.title} — {selectedPhotos.length} fotos escolhidas
            </p>
          </div>
        </div>

        {/* Resumo de Seleção */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-900 border border-white/10 rounded p-4 mb-6 text-center font-sans">
          <div>
            <span className="text-[10px] text-white/50 block">Selecionadas</span>
            <strong className="text-lg text-white font-semibold">{total}</strong>
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">Inclusas</span>
            <span className="text-lg text-white/90">{limit}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">Excedentes</span>
            <span className={`text-lg font-semibold ${extras > 0 ? "text-accent-gold" : "text-white/60"}`}>
              {extras}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">A Cobrar</span>
            <span className="text-lg text-accent-gold font-semibold">
              {formatCurrency(extraTotal)}
            </span>
          </div>
        </div>

        {/* Seleção do Formato */}
        <div className="mb-4">
          <label className="block text-[11px] text-white/70 mb-2 font-sans">
            Formato da String de Filtro:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFormatType("comma")}
              className={`px-3 py-3.5 rounded-full text-xs font-sans transition-colors ${
                formatType === "comma"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-surface-900 text-white/70 hover:text-white border border-white/10"
              }`}
            >
              Com extensão (DSC_0001.jpg, DSC_0002.jpg)
            </button>
            <button
              onClick={() => setFormatType("baseComma")}
              className={`px-3 py-3.5 rounded-full text-xs font-sans transition-colors ${
                formatType === "baseComma"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-surface-900 text-white/70 hover:text-white border border-white/10"
              }`}
            >
              Sem extensão (DSC_0001, DSC_0002)
            </button>
            <button
              onClick={() => setFormatType("quotes")}
              className={`px-3 py-3.5 rounded-full text-xs font-sans transition-colors ${
                formatType === "quotes"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-surface-900 text-white/70 hover:text-white border border-white/10"
              }`}
            >
              Aspas duplas ("DSC_0001" "DSC_0002")
            </button>
          </div>
        </div>

        {/* Caixa de Texto com a String Gerada */}
        <div className="relative mb-6">
          <textarea
            readOnly
            value={exportString || "Nenhuma foto selecionada até o momento."}
            rows={4}
            className="w-full p-4 bg-black/80 border border-white/15 rounded text-xs text-amber-100/90 font-mono focus:outline-hidden resize-none leading-relaxed select-all"
          />
          <button
            onClick={handleCopy}
            disabled={total === 0}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black font-semibold text-xs hover:bg-surface-200 transition-all shadow-md active:scale-[0.98] transition-transform duration-200 ease-out disabled:opacity-40"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Instrução Rápida */}
        <div className="p-3 bg-white/5 border border-white/10 rounded text-[11px] text-white/70 leading-relaxed font-sans mb-6 flex items-start gap-2">
          <Info className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
          <span>
            <strong>Dica no Lightroom Classic:</strong> Abra a pasta do ensaio no módulo Biblioteca (G), aperte <strong>\</strong> para abrir a barra de filtros, selecione <strong>Texto &gt; Nome do Arquivo &gt; Contém</strong> e cole o texto copiado acima para filtrar instantaneamente todas as fotos escolhidas pelo cliente.
          </span>
        </div>

        {/* Botões de Download de Relatório TXT / CSV */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxtReport}
              disabled={total === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-white/20 hover:bg-white/10 text-white text-xs font-medium transition-colors disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar Relatório Completo (.txt)</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={total === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-white/20 hover:bg-white/10 text-white text-xs font-medium transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Tabela (.csv)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-sans"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
