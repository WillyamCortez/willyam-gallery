"use client";

import React from "react";
import { Photo, GalleryStatus, WatermarkType } from "@/types";
import { PhotoCard } from "./PhotoCard";
import { Heart } from "lucide-react";

interface MasonryGridProps {
  photos: Photo[];
  selectionsMap: Record<string, boolean>;
  galleryStatus: GalleryStatus;
  isLocked: boolean;
  watermarkType?: WatermarkType;
  watermarkText?: string | null;
  onToggleSelect: (photoId: string) => void;
  onOpenLightbox: (photo: Photo) => void;
  onDownloadSingle?: (photo: Photo) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  photos,
  selectionsMap,
  galleryStatus,
  isLocked,
  watermarkType,
  watermarkText,
  onToggleSelect,
  onOpenLightbox,
  onDownloadSingle,
}) => {
  if (photos.length === 0) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center max-w-md mx-auto text-foreground/60">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mb-4 text-foreground/40">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="font-sans text-balance text-xl text-foreground font-medium mb-1">
          Nenhuma foto encontrada
        </h3>
        <p className="text-xs text-foreground/60 leading-relaxed font-sans">
          Não há fotos selecionadas nesta seção ou nenhum item corresponde ao filtro atual.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isSelected={Boolean(selectionsMap[photo.id])}
            galleryStatus={galleryStatus}
            isLocked={isLocked}
            watermarkType={watermarkType}
            watermarkText={watermarkText}
            onToggleSelect={onToggleSelect}
            onOpenLightbox={onOpenLightbox}
            onDownloadSingle={onDownloadSingle}
          />
        ))}
      </div>
    </div>
  );
};
