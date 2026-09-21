"use client";

import React from "react";
import { GallerySection } from "@/types";
import { Heart, FolderOpen, ExternalLink } from "lucide-react";

interface SectionTabsProps {
  sections: GallerySection[];
  activeSectionId: string | null;
  onSelectSection: (sectionId: string | null) => void;
  showOnlySelected: boolean;
  onToggleShowOnlySelected: () => void;
  totalPhotosCount: number;
  selectedCount: number;
  googleDriveUrl?: string | null;
  isDelivered?: boolean;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  showOnlySelected,
  onToggleShowOnlySelected,
  totalPhotosCount,
  selectedCount,
  googleDriveUrl,
  isDelivered = false,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-surface-200 py-3.5 px-4 sm:px-8 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Abas de Seções */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              if (showOnlySelected) onToggleShowOnlySelected();
              onSelectSection(null);
            }}
            className={`px-4 py-3 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeSectionId === null && !showOnlySelected
                ? "bg-foreground text-background shadow-xs"
                : "text-foreground/70 hover:text-foreground hover:bg-surface-100"
            }`}
          >
            Todas ({totalPhotosCount})
          </button>

          {sections.map((section) => {
            const isActive = activeSectionId === section.id && !showOnlySelected;
            return (
              <button
                key={section.id}
                onClick={() => {
                  if (showOnlySelected) onToggleShowOnlySelected();
                  onSelectSection(section.id);
                }}
                className={`px-4 py-3 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-foreground text-background shadow-xs"
                    : "text-foreground/70 hover:text-foreground hover:bg-surface-100"
                }`}
              >
                {section.name}
              </button>
            );
          })}
        </div>

        {/* Ações à Direita: Filtro de Selecionadas & Google Drive */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Filtro: Apenas Selecionadas */}
          <button
            onClick={onToggleShowOnlySelected}
            className={`inline-flex items-center gap-2 px-3.5 py-3.5 rounded-full text-xs font-medium transition-all ${
              showOnlySelected
                ? "bg-rose-50 border border-rose-200 text-rose-700 shadow-xs"
                : "bg-surface-100 hover:bg-surface-200 text-foreground/80"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                showOnlySelected ? "fill-rose-500 text-rose-500" : "text-foreground/60"
              }`}
            />
            <span>Escolhidas ({selectedCount})</span>
          </button>

          {/* Botão de Destaque Google Drive (Modo Entrega Final) */}
          {isDelivered && googleDriveUrl && (
            <a
              href={googleDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium tracking-wide shadow-sm transition-all hover:scale-105 active:scale-[0.98] transition-transform duration-200 ease-out"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Abrir Álbum no Google Drive</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
