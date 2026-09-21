"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
} from "lucide-react";
import { Photo, GalleryStatus, WatermarkType } from "@/types";
import { WatermarkOverlay } from "./WatermarkOverlay";

interface LightboxModalProps {
  photos: Photo[];
  activePhotoId: string | null;
  onClose: () => void;
  selectionsMap: Record<string, boolean>;
  galleryStatus: GalleryStatus;
  isLocked: boolean;
  watermarkType?: WatermarkType;
  watermarkText?: string | null;
  onToggleSelect: (photoId: string) => void;
  onDownloadSingle?: (photo: Photo) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  activePhotoId,
  onClose,
  selectionsMap,
  galleryStatus,
  isLocked,
  watermarkType,
  watermarkText,
  onToggleSelect,
  onDownloadSingle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const isSelectionMode = galleryStatus === "selection";

  useEffect(() => {
    if (activePhotoId) {
      const idx = photos.findIndex((p) => p.id === activePhotoId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [activePhotoId, photos]);

  const currentPhoto = photos[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 < photos.length ? prev + 1 : 0));
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "f" && isSelectionMode && !isLocked && currentPhoto) {
        onToggleSelect(currentPhoto.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose, onToggleSelect, isSelectionMode, isLocked, currentPhoto]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) handlePrev();
    if (deltaX < -50) handleNext();
    touchStartX.current = null;
  };

  if (!currentPhoto) return null;

  const isSelected = Boolean(selectionsMap[currentPhoto.id]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#09090B] text-white flex flex-col select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between z-30 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 font-sans">
            {currentIndex + 1} de {photos.length}
          </span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="text-xs text-white/90 font-medium font-sans truncate max-w-[200px] sm:max-w-md">
            {currentPhoto.original_filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <button
              disabled={isLocked}
              onClick={() => onToggleSelect(currentPhoto.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-3.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? "bg-rose-600 text-white shadow-md scale-105"
                  : "bg-white/10 hover:bg-white/20 text-white/90"
              } ${isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              title="Atalho: Tecla 'F'"
            >
              <Heart className={`w-3.5 h-3.5 ${isSelected ? "fill-white" : ""}`} />
              <span className="hidden sm:inline">
                {isSelected ? "Selecionada" : "Selecionar (F)"}
              </span>
            </button>
          )}
          {!isSelectionMode && onDownloadSingle && (
            <button
              onClick={() => onDownloadSingle(currentPhoto)}
              className="inline-flex items-center gap-2 px-3.5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition-all"
              title="Baixar foto em alta resolução"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all ml-2"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
        <button
          onClick={handlePrev}
          className="absolute left-4 z-30 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-md transition-all border border-white/10"
          title="Anterior (Seta Esquerda)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative max-w-full max-h-[82vh] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative max-w-full max-h-[82vh] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl"
            >
              <img
                src={currentPhoto.preview_url || currentPhoto.thumbnail_url}
                alt={currentPhoto.original_filename}
                className="max-w-full max-h-[82vh] object-contain rounded-xl select-none"
                draggable={false}
              />
              {isSelectionMode && (
                <WatermarkOverlay
                  type={watermarkType}
                  text={watermarkText || "PROVA — WILLYAM CORTEZ"}
                  opacity={0.32}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          onClick={handleNext}
          className="absolute right-4 z-30 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-md transition-all border border-white/10"
          title="Próxima (Seta Direita)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="h-10 px-6 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 font-sans z-30 bg-black/40">
        <div className="hidden sm:flex items-center gap-4">
          <span>
            <strong className="text-white/70">← →</strong> Navegar
          </span>
          <span>
            <strong className="text-white/70">F</strong> Favoritar
          </span>
          <span>
            <strong className="text-white/70">Esc</strong> Fechar
          </span>
        </div>
        <div>
          <span>Willyam Cortez Fotografia</span>
        </div>
      </div>
    </div>
  );
};
