"use client";

import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Layers,
  Settings2,
  Lock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Gallery } from "@/types";
import { formatDateShort } from "@/lib/utils";

interface GalleryCardProps {
  gallery: Gallery;
  onDelete?: (id: string) => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ gallery, onDelete }) => {
  const isDelivered = gallery.status === "delivered";
  const isLocked = Boolean(gallery.selection_locked_at);
  const totalPhotos = gallery.total_photos || gallery.photos?.length || 0;
  const selectedCount =
    gallery.selected_photos_count ??
    gallery.photos?.filter((p) => p.is_selected)?.length ??
    0;
  const limit = gallery.photo_limit || 1;
  const progressPercent = Math.min(Math.round((selectedCount / limit) * 100), 100);

  return (
    <div className="group bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-emerald-500/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 font-sans">
      {/* Imagem de Capa com Badges Bento */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-black/80">
        <img
          src={gallery.cover_image_key || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
          alt={gallery.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-black/40 pointer-events-none" />

        {/* Badges Superiores */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
          {isDelivered ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-medium backdrop-blur-md shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Entregue</span>
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-black text-[11px] font-semibold backdrop-blur-md shadow-md shadow-amber-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Seleção Travada</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/90 text-white text-[11px] font-medium backdrop-blur-md shadow-md shadow-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Em Seleção</span>
            </span>
          )}
        </div>

        {/* PIN de Acesso */}
        {gallery.access_pin && (
          <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-zinc-300 font-mono z-10 border border-white/15">
            PIN: {gallery.access_pin}
          </div>
        )}

        {/* Título sobre a imagem */}
        <div className="absolute bottom-3.5 left-4 right-4 text-white z-10">
          <h3 className="text-xl font-medium truncate text-white drop-shadow-sm">
            {gallery.title}
          </h3>
        </div>
      </div>

      {/* Detalhes da Galeria */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-200">{gallery.client_name}</span>
            {gallery.event_date && (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {formatDateShort(gallery.event_date)}
              </span>
            )}
          </div>

          {/* Progresso de Fotos com Barra Elegante */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>{totalPhotos} fotos</span>
              </span>

              <span className={`font-medium ${selectedCount > limit ? "text-amber-400" : "text-emerald-400"}`}>
                {selectedCount} / {gallery.photo_limit} {selectedCount > limit ? `(+${selectedCount - limit} extras)` : "escolhidas"}
              </span>
            </div>

            {/* Barra de Progresso Glass */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedCount > limit ? "bg-amber-400" : "bg-emerald-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação Bento */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {!isDelivered ? (
              <Link
                href={`/galleries/${gallery.id}/selections`}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all duration-200 active:scale-[0.98]"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Lightroom</span>
              </Link>
            ) : gallery.google_drive_url ? (
              <a
                href={gallery.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-medium transition-all duration-200 border border-emerald-500/30 active:scale-[0.98]"
              >
                <span>Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}

            <Link
              href={`/galleries/${gallery.id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all duration-200 active:scale-[0.98]"
            >
              <Settings2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Gerenciar</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/gallery/${gallery.slug}`}
              target="_blank"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white text-xs font-medium transition-colors border border-white/5"
            >
              <span>Ver como Cliente</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(gallery.id);
                }}
                className="relative z-20 p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 active:scale-[0.95] cursor-pointer shrink-0"
                title="Excluir galeria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

