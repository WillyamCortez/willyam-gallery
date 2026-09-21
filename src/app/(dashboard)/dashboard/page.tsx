"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockGalleries } from "@/lib/mock-data";
import { GalleryCard } from "@/components/dashboard/GalleryCard";
import { DashboardSidebar, GalleryCategory } from "@/components/dashboard/DashboardSidebar";
import {
  Camera,
  Sparkles,
  CheckCircle2,
  Lock,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function PhotographerDashboardPage() {
  const [galleries, setGalleries] = useState(mockGalleries);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<GalleryCategory>("all");
  const [galleryToDelete, setGalleryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carrega galerias reais do Supabase
  React.useEffect(() => {
    async function loadGalleries() {
      try {
        const res = await fetch("/api/galleries");
        if (res.ok) {
          const data = await res.json();
          if (data?.galleries && data.galleries.length > 0) {
            setGalleries(data.galleries);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar galerias do Supabase, usando mocks:", err);
      }
    }
    loadGalleries();
  }, []);

  const totalGalleries = galleries.length;
  const inSelection = galleries.filter((g) => g.status === "selection" && !g.selection_locked_at).length;
  const lockedSelection = galleries.filter((g) => g.selection_locked_at && g.status !== "delivered").length;
  const delivered = galleries.filter((g) => g.status === "delivered").length;

  const counts = {
    all: totalGalleries,
    selection: inSelection + lockedSelection,
    delivered: delivered,
  };

  const confirmDeleteGallery = async () => {
    if (!galleryToDelete) return;
    const targetId = galleryToDelete;
    
    // Atualização otimista imediata na interface (remove instantaneamente)
    setGalleries((prev) => prev.filter((g) => g.id !== targetId));
    setGalleryToDelete(null);

    try {
      await fetch(`/api/galleries/${targetId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Background API delete warning:", e);
    }
  };

  const filteredGalleries = galleries.filter((g) => {
    // Filtragem por status ou categoria
    if (currentCategory === "selection" && g.status !== "selection") return false;
    if (currentCategory === "delivered" && g.status !== "delivered") return false;
    
    // Filtros por tags/título temático
    if (
      currentCategory !== "all" &&
      currentCategory !== "selection" &&
      currentCategory !== "delivered"
    ) {
      const matchTag =
        g.title.toLowerCase().includes(currentCategory) ||
        (g as any).category?.toLowerCase() === currentCategory;
      if (!matchTag) return false;
    }

    // Filtragem por busca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchClient = g.client_name.toLowerCase().includes(q);
      return matchTitle || matchClient;
    }

    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-sans">
      {/* Sidebar Bento de Perfil & Filtros */}
      <DashboardSidebar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        counts={counts}
      />

      {/* Conteúdo Principal do Dashboard Bento */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Barra de Busca e Filtros Rápidos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ensaio ou cliente..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-white/10 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 backdrop-blur-xl transition-colors"
            />
          </div>

          <div className="text-xs text-zinc-400 self-end sm:self-center">
            Exibindo <strong className="text-white">{filteredGalleries.length}</strong> {filteredGalleries.length === 1 ? "coleção" : "coleções"}
          </div>
        </div>

        {/* Widgets Bento de Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs">Coleções</span>
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-semibold text-white">{totalGalleries}</span>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-xs text-zinc-400">Em Seleção</span>
              <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-semibold text-blue-400">{inSelection}</span>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs text-zinc-400">Aguardando</span>
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-semibold text-amber-400">{lockedSelection}</span>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs text-zinc-400">Entregues</span>
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-2xl font-semibold text-emerald-400">{delivered}</span>
          </div>
        </div>

        {/* Grid de Galerias Bento */}
        {filteredGalleries.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <Camera className="w-12 h-12 text-zinc-600 mb-3" />
            <h3 className="text-xl text-white font-medium mb-1">Nenhum ensaio nesta categoria</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Nenhuma galeria encontrada para os filtros atuais. Crie uma nova galeria para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGalleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onDelete={(id) => setGalleryToDelete(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {galleryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Excluir Galeria?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tem certeza de que deseja excluir esta galeria? Esta ação removerá as fotos e seleções associadas.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGalleryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteGallery}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-md shadow-rose-600/20 active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Excluindo..." : "Excluir Galeria"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

