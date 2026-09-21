import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Camera,
  Layers,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Download,
} from "lucide-react";
import { mockGalleries } from "@/lib/mock-data";

export default function HomePage() {
  const selectionGallery = mockGalleries[0];
  const deliveredGallery = mockGalleries[1];

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans selection:bg-accent-gold/30">
      {/* Top Navbar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img
            src="/img/logo.png"
            alt="Willyam Cortez"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black hover:bg-surface-200 text-sm font-medium transition-all shadow-md active:scale-[0.98] transition-transform duration-200 ease-out"
          >
            <span>Painel do Fotógrafo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-sans text-accent-gold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma Profissional de Entrega e Aprovação de Fotos</span>
        </div>

        <h1 className="font-sans text-balance text-4xl sm:text-6xl md:text-7xl font-normal tracking-wide text-white leading-tight mb-6">
          A elegância editorial de suas fotografias no mais alto padrão.
        </h1>

        <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed mb-10 font-light">
          Galerias com proteção por marca d'água dinâmica sobre Cloudflare R2, contador inteligente de fotos excedentes, 1-clique para filtro do Adobe Lightroom e entrega de alta fidelidade.
        </p>

        {/* CTAs de Demonstração Rápida */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/gallery/mariana-e-rodrigo"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-black hover:bg-surface-200 text-sm font-medium transition-all shadow-lg active:scale-[0.98] transition-transform duration-200 ease-out"
          >
            <Camera className="w-4 h-4" />
            <span>Testar Modo Seleção (PIN: 1234)</span>
          </Link>

          <Link
            href="/gallery/camila-gestante"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/15"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Ver Modo Entrega Final</span>
          </Link>
        </div>
      </section>

      {/* Grid de Demonstração das Duas Jornadas */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-10">
          <h2 className="font-sans text-balance text-3xl text-white font-normal mb-2">
            Duas Jornadas Especializadas por Coleção
          </h2>
          <p className="text-xs text-white/50">
            Fluxo Completo do Ensaio à Entrega Definitiva
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Modo Seleção */}
          <div className="bg-surface-900 border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-white/30 transition-all shadow-xl group">
            <div className="relative aspect-16/9 w-full bg-black">
              <img
                src={selectionGallery.cover_image_key || ""}
                alt="Modo Seleção"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold">
                1. Modo Seleção & Aprovação
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-sans text-balance text-2xl font-medium">{selectionGallery.title}</h3>
                <p className="text-xs text-white/70">PIN de Demonstração: 1234</p>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5 text-xs text-white/70">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                  <span>Marca d'água dinâmica sobreposta via Cloudflare Worker</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Contador de fotos contratadas com cálculo de excedentes (R$)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Campo de comentários/retoques por foto com atalhos de teclado ('F', 'C')</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/gallery/mariana-e-rodrigo"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent-gold hover:text-yellow-400 transition-colors"
                >
                  <span>Abrir Galeria do Cliente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/galleries/gal-wedding/selections"
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Ver no Lightroom
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Modo Entrega Final */}
          <div className="bg-surface-900 border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-white/30 transition-all shadow-xl group">
            <div className="relative aspect-16/9 w-full bg-black">
              <img
                src={deliveredGallery.cover_image_key || ""}
                alt="Modo Entrega Final"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-emerald-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold">
                2. Modo Entrega Final
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-sans text-balance text-2xl font-medium">{deliveredGallery.title}</h3>
                <p className="text-xs text-white/70">Acesso Livre — Alta Resolução</p>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5 text-xs text-white/70">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Visual ultralimpo sem marcas d'água</span>
                </div>
                <div className="flex items-start gap-2">
                  <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Botão de destaque direto para o álbum no Google Drive</span>
                </div>
                <div className="flex items-start gap-2">
                  <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Download individual seguro em alta resolução via Cloudflare R2</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/gallery/camila-gestante"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Abrir Galeria Final</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/dashboard"
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Acessar Painel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 text-center text-xs text-white/40 font-sans">
        <p>© {new Date().getFullYear()} Willyam Cortez — Galerias Fotográficas Profissionais</p>
      </footer>
    </div>
  );
}
