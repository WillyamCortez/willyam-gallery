"use client";

import React from "react";
import {
  FolderKanban,
  Sparkles,
  CheckCircle2,
  Heart,
  Camera,
  PartyPopper,
  Palette,
  User,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";

export type GalleryCategory =
  | "all"
  | "selection"
  | "delivered"
  | "casamentos"
  | "ensaios"
  | "eventos";

interface DashboardSidebarProps {
  currentCategory: GalleryCategory;
  onSelectCategory: (category: GalleryCategory) => void;
  counts: {
    all: number;
    selection: number;
    delivered: number;
    [key: string]: number;
  };
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentCategory,
  onSelectCategory,
  counts,
}) => {
  const primaryFilters: { id: GalleryCategory; label: string; icon: any; count?: number }[] = [
    { id: "all", label: "Todas as Coleções", icon: FolderKanban, count: counts.all },
    { id: "selection", label: "Em Seleção", icon: Heart, count: counts.selection },
    { id: "delivered", label: "Entregues", icon: CheckCircle2, count: counts.delivered },
  ];

  const categoryFilters: { id: GalleryCategory; label: string; icon: any }[] = [
    { id: "casamentos", label: "Casamentos", icon: Sparkles },
    { id: "ensaios", label: "Ensaios", icon: Camera },
    { id: "eventos", label: "Eventos", icon: PartyPopper },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
      {/* Card de Perfil Bento Box */}
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-md">
            <img
              src="/img/ellipse2.png"
              alt="Foto de perfil Willyam Cortez"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">
              Willyam Cortez
            </h3>
            <p className="text-zinc-400 text-xs truncate">@willyampcortez</p>
          </div>
        </div>
      </div>

      {/* Navegação e Filtros Bento */}
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-xl flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Seção 1: Status */}
          <div>
            <span className="text-[11px] text-zinc-400 font-medium px-3 block mb-2">
              Status das Galerias
            </span>
            <nav className="flex flex-col gap-1">
              {primaryFilters.map((item) => {
                const Icon = item.icon;
                const isActive = currentCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectCategory(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {typeof item.count === "number" && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Seção 2: Categorias Temáticas */}
          <div>
            <span className="text-[11px] text-zinc-400 font-medium px-3 block mb-2">
              Segmentos & Estilos
            </span>
            <nav className="flex flex-col gap-1">
              {categoryFilters.map((item) => {
                const Icon = item.icon;
                const isActive = currentCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectCategory(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar: Redes Sociais */}
        <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between px-2">
          <span className="text-[11px] text-zinc-400">Social</span>
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com/willyampcortez"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Instagram @willyampcortez"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://facebook.com/willyam.cortez.2025"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
