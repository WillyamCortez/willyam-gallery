"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockGalleries } from "@/lib/mock-data";
import { Photo, GallerySection, Gallery } from "@/types";
import { LightroomExportModal } from "@/components/dashboard/LightroomExportModal";
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function GallerySelectionsReviewPage() {
  const params = useParams();
  const galleryId = params?.id as string;

  const getStaticGallery = () => {
    return (
      mockGalleries.find((g) => g.id === galleryId || g.slug === galleryId) ||
      ({
        id: galleryId,
        photographer_id: "",
        title: "Galeria",
        slug: galleryId,
        client_name: "",
        status: "selection",
        photo_limit: 20,
        extra_photo_price: 15,
        sections: [] as GallerySection[],
        photos: [] as Photo[],
      } as Gallery)
    );
  };

  const [gallery, setGallery] = useState(getStaticGallery);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("willyam_galleries");
      if (saved) {
        const list = JSON.parse(saved);
        const found = list.find((g: any) => g.id === galleryId || g.slug === galleryId);
        if (found) setGallery(found);
      }
    } catch (e) {}

    async function load() {
      try {
        const res = await fetch(`/api/galleries/${galleryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.gallery) setGallery(data.gallery);
        }
      } catch (e) {}
    }
    load();
  }, [galleryId]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const selectedPhotos = useMemo(() => {
    return (gallery.photos as Photo[])?.filter((p: Photo) => p.is_selected) || [];
  }, [gallery.photos]);

  const totalSelected = selectedPhotos.length;
  const limit = gallery.photo_limit;
  const extraCount = Math.max(0, totalSelected - limit);
  const extraTotalAmount = extraCount * gallery.extra_photo_price;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-sans text-balance text-3xl text-white font-normal">
              Seleção do Cliente: {gallery.title}
            </h1>
            <p className="text-xs text-white/60">
              Cliente: {gallery.client_name} ({gallery.client_email || "Sem e-mail"})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-accent-gold hover:bg-yellow-500 text-black font-semibold text-xs transition-all shadow-md active:scale-[0.98] transition-transform duration-200 ease-out cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Exportar para Lightroom / Relatório</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-900 border border-white/10 rounded-lg p-5">
          <span className="text-xs text-white/50 block mb-1">
            Total Escolhidas
          </span>
          <span className="text-2xl font-bold text-white font-sans text-balance">{totalSelected} fotos</span>
        </div>
        <div className="bg-surface-900 border border-white/10 rounded-lg p-5">
          <span className="text-xs text-white/50 block mb-1">
            Inclusas no Pacote
          </span>
          <span className="text-2xl font-bold text-white/80 font-sans text-balance">{limit} fotos</span>
        </div>
        <div className="bg-surface-900 border border-white/10 rounded-lg p-5">
          <span className="text-xs text-white/50 block mb-1">
            Fotos Extras
          </span>
          <span className={`text-2xl font-bold font-sans text-balance ${extraCount > 0 ? "text-accent-gold" : "text-emerald-400"}`}>
            +{extraCount} fotos
          </span>
        </div>
        <div className="bg-surface-900 border border-white/10 rounded-lg p-5">
          <span className="text-xs text-white/50 block mb-1">
            Valor Extra a Cobrar
          </span>
          <span className="text-2xl font-bold text-accent-gold font-sans text-balance">
            {formatCurrency(extraTotalAmount)}
          </span>
        </div>
      </div>
      {selectedPhotos.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-surface-900 border border-white/10 rounded-lg">
          <CheckCircle2 className="w-10 h-10 text-white/30 mb-3" />
          <h3 className="font-sans text-balance text-xl text-white mb-1">Nenhuma foto selecionada</h3>
          <p className="text-xs text-white/50 max-w-sm">
            O cliente ainda não selecionou nenhuma foto nesta coleção.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {selectedPhotos.map((photo: Photo, index: number) => (
            <div
              key={photo.id}
              className="bg-surface-900 border border-white/10 rounded-lg overflow-hidden flex flex-col group hover:border-white/25 transition-all shadow-md"
            >
              <div className="relative aspect-3/2 w-full bg-black overflow-hidden">
                <img
                  src={photo.thumbnail_url || photo.preview_url}
                  alt={photo.original_filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white/90 font-mono">
                  #{index + 1}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-sm font-medium text-white font-mono block truncate">
                    {photo.original_filename}
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    Dimensões: {photo.width} × {photo.height}px
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <LightroomExportModal
        gallery={gallery}
        selectedPhotos={selectedPhotos}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
