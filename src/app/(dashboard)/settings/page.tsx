"use client";

import React, { useState } from "react";
import { mockPhotographer } from "@/lib/mock-data";
import { PhotographerProfile } from "@/types";
import { WatermarkConfigurator } from "@/components/dashboard/WatermarkConfigurator";
import { Shield, User, Mail, DollarSign, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<PhotographerProfile>(mockPhotographer);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleWatermarkSave = (config: any) => {
    setProfile((prev) => ({
      ...prev,
      watermark_type: config.type,
      watermark_text: config.text,
      watermark_opacity: config.opacity,
      watermark_url: config.logoUrl,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl sm:text-4xl text-white font-normal">
          Configurações do Estúdio
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Personalize sua marca d'água dinâmica, dados de contato e dados para recebimento de fotos extras.
        </p>
      </div>

      {/* 1. Marca d'Água Dinâmica */}
      <section className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="pb-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl text-white font-medium">Marca d'Água Dinâmica</h2>
            <p className="text-xs text-zinc-400">
              Aplicada automaticamente nas galerias em modo de aprovação de fotos.
            </p>
          </div>
        </div>

        <WatermarkConfigurator
          initialType={profile.watermark_type}
          initialText={profile.watermark_text}
          initialOpacity={profile.watermark_opacity}
          initialLogoUrl={profile.watermark_url}
          onSave={handleWatermarkSave}
        />
      </section>

      {/* 2. Dados do Perfil & Chave PIX */}
      <section className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="pb-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl text-white font-medium">Dados do Fotógrafo & Faturamento</h2>
            <p className="text-xs text-zinc-400">
              Informações exibidas no rodapé das galerias e para recebimento de excedentes.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                Nome Completo / Fotógrafo
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                Nome do Estúdio / Marca
              </label>
              <input
                type="text"
                value={profile.studio_name || ""}
                onChange={(e) => setProfile((p) => ({ ...p, studio_name: e.target.value }))}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                E-mail para Notificações de Seleção
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                WhatsApp de Contato
              </label>
              <input
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                Chave PIX para Cobrança de Fotos Extras
              </label>
              <input
                type="text"
                value={profile.pix_key || ""}
                onChange={(e) => setProfile((p) => ({ ...p, pix_key: e.target.value }))}
                placeholder="sua-chave-pix@email.com"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-hidden focus:border-emerald-500 font-mono transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Perfil Atualizado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados do Estúdio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

