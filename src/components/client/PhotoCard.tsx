"use client";

import React, { useState } from "react";
import { Heart, Maximize2, Download } from "lucide-react";
import { Photo, GalleryStatus, WatermarkType } from "@/types";
import { WatermarkOverlay } from "./WatermarkOverlay";

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  galleryStatus: GalleryStatus;
  isLocked: boolean;
  watermarkType?: WatermarkType;
  watermarkText?: string | null;
  onToggleSelect: (photoId: string) => void;
  onOpenLightbox: (photo: Photo) => void;
  onDownloadSingle?: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isSelected,
  galleryStatus,
  isLocked,
  watermarkType = "grid",
  watermarkText,
  onToggleSelect,
  onOpenLightbox,
  onDownloadSingle,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isSelectionMode = galleryStatus === "selection";

  return (
    <div
      className="group relative mb-4 break-inside-avoid rounded-xl overflow-hidden bg-surface-100 transition-all duration-300 select-none shadow-2xs hover:shadow-md"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative w-full overflow-hidden cursor-pointer"
        onClick={() => onOpenLightbox(photo)}
      >
        <img
          src={photo.thumbnail_url || photo.preview_url}
          alt={photo.original_filename}
          loading="lazy"
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] ${
            isLoaded ? "opacity-100 filter-none" : "opacity-0 blur-sm"
          }`}
        />
        {!isLoaded && (
          <div
            className="w-full bg-surface-200 animate-pulse"
            style={{
              aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : "3/2",
            }}
          />
        )}
        {isSelectionMode && (
          <WatermarkOverlay
            type={watermarkType}
            text={watermarkText || "PROVA — WILLYAM CORTEZ"}
            opacity={0.3}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute bottom-2.5 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="text-[11px] font-sans text-white/90 font-medium drop-shadow-md">
            {photo.original_filename}
          </span>
        </div>
      </div>
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
        {!isSelectionMode && onDownloadSingle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadSingle(photo);
            }}
            title="Baixar foto original em alta resolução"
            className="p-2 rounded-full bg-black/40 text-white/90 hover:bg-black/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(photo);
          }}
          title="Ver em tela cheia"
          className="p-2 rounded-full bg-black/40 text-white/90 hover:bg-black/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        {isSelectionMode && (
          <button
            disabled={isLocked}
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) onToggleSelect(photo.id);
            }}
            title={
              isLocked
                ? "Seleção travada"
                : isSelected
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
            }
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isSelected
                ? "bg-rose-600 text-white shadow-md scale-105"
                : "bg-black/40 text-white/80 hover:bg-rose-600 hover:text-white opacity-0 group-hover:opacity-100"
            } ${isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer active:scale-[0.98] transition-transform duration-200 ease-out"}`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isSelected ? "fill-white text-white" : ""
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
