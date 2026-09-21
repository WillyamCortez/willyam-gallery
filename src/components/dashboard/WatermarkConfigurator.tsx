"use client";

import React, { useState } from "react";
import { WatermarkType } from "@/types";
import { WatermarkOverlay } from "@/components/client/WatermarkOverlay";
import { ShieldCheck, Eye, Sliders, Image as ImageIcon, Save, Check } from "lucide-react";

interface WatermarkConfiguratorProps {
  initialType?: WatermarkType;
  initialText?: string | null;
  initialOpacity?: number;
  initialLogoUrl?: string | null;
  onSave: (config: {
    type: WatermarkType;
    text: string;
    opacity: number;
    logoUrl: string | null;
  }) => void;
}

export const WatermarkConfigurator: React.FC<WatermarkConfiguratorProps> = ({
  initialType = "grid",
  initialText = "WILLYAM CORTEZ — PROVA",
  initialOpacity = 0.3,
  initialLogoUrl = null,
  onSave,
}) => {
  const [type, setType] = useState<WatermarkType>(initialType);
  const [text, setText] = useState(initialText || "WILLYAM CORTEZ — PROVA");
  const [opacity, setOpacity] = useState(initialOpacity);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type, text, opacity, logoUrl });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Controles de Configuração */}
      <form onSubmit={handleSave} className="lg:col-span-6 space-y-6">
        {/* Estilo da Marca d'Água */}
        <div>
          <label className="block text-xs text-zinc-300 mb-2 font-medium">
            Estilo de Aplicação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("grid")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                type === "grid"
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10"
                  : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/20"
              }`}
            >
              <h5 className="text-sm font-semibold mb-1 text-white">Repetição em Grid</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Padrão diagonal repetido sutilmente sobre toda a imagem. Máxima proteção contra prints.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setType("center")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                type === "center"
                  ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10"
                  : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/20"
              }`}
            >
              <h5 className="text-sm font-semibold mb-1 text-white">Centralizada Translúcida</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Emblema ou logotipo posicionado no centro com moldura e transparência suave.
              </p>
            </button>
          </div>
        </div>

        {/* Texto da Marca d'Água */}
        <div>
          <label className="block text-xs text-zinc-300 mb-2 font-medium">
            Texto da Marca d'Água
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: WILLYAM CORTEZ — PROVA DE FOTOS"
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Controle de Opacidade */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-zinc-300 font-medium">
              Opacidade da Proteção
            </label>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.65"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
            <span>Sutil (10%)</span>
            <span>Equilibrado (30%)</span>
            <span>Intenso (65%)</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Configurações Salvas!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configuração</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview em Tempo Real */}
      <div className="lg:col-span-6 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-xs text-zinc-400 font-medium">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Prévia em Tempo Real (Como o Cliente Vê)</span>
        </div>

        <div className="relative aspect-3/2 w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl select-none">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
            alt="Demo Preview"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Marca d'água interativa */}
          <WatermarkOverlay
            type={type}
            text={text}
            opacity={opacity}
            logoUrl={logoUrl}
          />

          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-zinc-300 font-mono z-20 border border-white/10">
            Modo: {type} | Opacidade: {Math.round(opacity * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

