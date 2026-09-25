"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Shield, CheckCircle2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function NewGalleryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [accessPin, setAccessPin] = useState("");
  const [photoLimit, setPhotoLimit] = useState(20);
  const [extraPhotoPrice, setExtraPhotoPrice] = useState(15.0);
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [initialSections, setInitialSections] = useState("Making Of, Cerimônia, Ensaio dos Noivos, Recepção");
  const [isDelivered, setIsDelivered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const sectionsArray = initialSections
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          clientName,
          clientEmail,
          clientPhone,
          eventDate,
          accessPin,
          photoLimit,
          extraPhotoPrice,
          googleDriveUrl,
          sections: sectionsArray,
          status: isDelivered ? "delivered" : "selection",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar galeria");
      }

      // Salva no localStorage para sincronia imediata (modo local/fallback)
      if (data.gallery && typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("willyam_galleries");
          const list = saved ? JSON.parse(saved) : [];
          localStorage.setItem("willyam_galleries", JSON.stringify([data.gallery, ...list]));
        } catch (e) {}
      }

      // Redireciona diretamente para a tela de upload e edição da nova galeria
      const targetId = data.gallery?.id || data.gallery?.slug || slug;
      router.push(`/galleries/${targetId}/edit`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao criar galeria");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-sans text-balance text-3xl text-white font-normal">Criar Nova Galeria</h1>
          <p className="text-xs text-white/60">
            Cadastre os dados do ensaio, escolha aprovação ou entrega direta já paga.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsDelivered(false)}
          className={`p-4 rounded-lg text-left transition-all border ${
            !isDelivered
              ? "bg-blue-500/20 border-blue-400 text-blue-200"
              : "bg-black/40 border-white/10 text-white/50 hover:text-white"
          }`}
        >
          <span className="block text-sm font-semibold">Aprovação e Seleção</span>
          <span className="block text-xs opacity-70 mt-1">Cliente escolhe fotos, comenta e finaliza</span>
        </button>
        <button
          type="button"
          onClick={() => setIsDelivered(true)}
          className={`p-4 rounded-lg text-left transition-all border ${
            isDelivered
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
              : "bg-black/40 border-white/10 text-white/50 hover:text-white"
          }`}
        >
          <span className="block text-sm font-semibold">Entrega Direta Já Paga</span>
          <span className="block text-xs opacity-70 mt-1">Visão bonita, download livre e acesso ao Drive</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-900 border border-white/10 rounded-lg p-6 sm:p-8 space-y-6">
        {/* Informações Principais */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-accent-gold pb-2 border-b border-white/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Dados da Coleção</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/70 mb-1">
                Título do Ensaio / Evento *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Mariana & Rodrigo — Casamento"
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                URL da Galeria (Slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-black/40 border border-r-0 border-white/15 rounded-l text-xs text-white/40">
                  /gallery/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="mariana-e-rodrigo"
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-r text-xs text-white focus:outline-hidden focus:border-accent-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                Data do Ensaio / Evento
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-white/70 mb-1">
                Descrição ou Mensagem de Boas-Vindas
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Uma celebração inesquecível ao entardecer no campo..."
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-semibold text-accent-gold pb-2 border-b border-white/10">
            Cliente & Contato
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Mariana Silva"
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                E-mail do Cliente
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="mariana@email.com"
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>
          </div>
        </div>

        {/* Regras de Aprovação & Segurança */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-semibold text-accent-gold pb-2 border-b border-white/10 flex items-center gap-2">
            {isDelivered ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            <span>{isDelivered ? "Entrega Direta" : "Regras de Seleção & Entrega"}</span>
          </h3>

          {!isDelivered ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/70 mb-1">
                  Fotos Inclusas no Pacote
                </label>
                <input
                  type="number"
                  min={1}
                  value={photoLimit}
                  onChange={(e) => setPhotoLimit(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">
                  Valor da Foto Extra (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  min={0}
                  value={extraPhotoPrice}
                  onChange={(e) => setExtraPhotoPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">
                  PIN de Proteção (4 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  placeholder="1234 (opcional)"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-sm text-white focus:outline-hidden focus:border-accent-gold font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-white/70 mb-1">
                  Seções Iniciais (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={initialSections}
                  onChange={(e) => setInitialSections(e.target.value)}
                  placeholder="Making Of, Cerimônia, Festa"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/60 leading-relaxed">
              Galeria já paga: sem seleção, sem marca dágua, sem limite. Cliente visualiza, baixa em alta e abre o Drive.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Link da Pasta no Google Drive {isDelivered ? "*" : "(Para Entrega Final)"}
              </label>
              <input
                type="url"
                required={isDelivered}
                value={googleDriveUrl}
                onChange={(e) => setGoogleDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-4 py-3.5 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            {isDelivered && (
              <div>
                <label className="block text-xs text-white/70 mb-1">
                  Seções Iniciais (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={initialSections}
                  onChange={(e) => setInitialSections(e.target.value)}
                  placeholder="Melhores Momentos, Família, Festa"
                  className="w-full px-4 py-3.5 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
                />
              </div>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Botão de Envio */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-3.5 rounded text-xs text-white/60 hover:text-white"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-surface-200 transition-all shadow-md active:scale-[0.98] transition-transform duration-200 ease-out cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Salvando no Supabase..."
                : isDelivered
                ? "Criar Entrega Direta & Ir para Upload"
                : "Criar Galeria & Ir para Upload"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
