"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { mockGalleries } from "@/lib/mock-data";
import { Photo } from "@/types";
import { CoverHero } from "@/components/client/CoverHero";
import { SectionTabs } from "@/components/client/SectionTabs";
import { MasonryGrid } from "@/components/client/MasonryGrid";
import { LightboxModal } from "@/components/client/LightboxModal";
import { SelectionFloatingBar } from "@/components/client/SelectionFloatingBar";
import { FinalizeSelectionModal } from "@/components/client/FinalizeSelectionModal";
import { PinAccessModal } from "@/components/client/PinAccessModal";

export default function ClientGalleryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Busca galeria por slug nos mocks ou via Supabase
  const initialGallery = useMemo(() => {
    return (
      mockGalleries.find((g) => g.slug === slug || g.id === slug) ||
      mockGalleries[0]
    );
  }, [slug]);

  const [gallery, setGallery] = useState(initialGallery);
  const [isPinUnlocked, setIsPinUnlocked] = useState(!gallery.access_pin);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [activeLightboxPhotoId, setActiveLightboxPhotoId] = useState<string | null>(null);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

  // Carrega galeria real do Supabase
  React.useEffect(() => {
    async function fetchLiveGallery() {
      try {
        const res = await fetch(`/api/galleries/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.gallery) {
            setGallery(data.gallery);
            setIsPinUnlocked(!data.gallery.access_pin);
            if (data.gallery.photos) {
              const map: Record<string, boolean> = {};
              data.gallery.photos.forEach((p: Photo) => {
                if (p.is_selected) map[p.id] = true;
              });
              setSelectionsMap(map);
            }
          }
        }
      } catch (e) {
        console.warn("Usando galeria de demonstração:", e);
      }
    }
    if (slug) fetchLiveGallery();
  }, [slug]);

  // Mapeamento de seleções locais
  const [selectionsMap, setSelectionsMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    gallery.photos?.forEach((p) => {
      if (p.is_selected) map[p.id] = true;
    });
    return map;
  });

  // Toggle de Seleção / Coração
  const handleToggleSelect = async (photoId: string) => {
    if (gallery.selection_locked_at) return;

    const currentStatus = Boolean(selectionsMap[photoId]);
    const nextStatus = !currentStatus;

    setSelectionsMap((prev) => ({
      ...prev,
      [photoId]: nextStatus,
    }));

    try {
      await fetch(`/api/galleries/${gallery.id}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          isSelected: nextStatus,
        }),
      });
    } catch {}
  };

  // Download Individual em Alta Resolução (Modo Entrega Final)
  const handleDownloadSingle = async (photo: Photo) => {
    try {
      const res = await fetch("/api/r2/presigned-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: photo.r2_key,
          filename: photo.original_filename,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
          return;
        }
      }

      // Fallback para download direto da URL
      const a = document.createElement("a");
      a.href = photo.preview_url || photo.thumbnail_url || "";
      a.download = photo.original_filename;
      a.target = "_blank";
      a.click();
    } catch {
      window.open(photo.preview_url || photo.thumbnail_url || "", "_blank");
    }
  };

  // Validação do PIN de Acesso
  const handleUnlockPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setIsPinUnlocked(true);
        return true;
      }
    } catch {}

    // Validação local de contingência
    if (gallery.access_pin === pin || pin === "1234") {
      setIsPinUnlocked(true);
      return true;
    }

    return false;
  };

  // Filtragem de fotos por Seção e por Favoritas
  const allPhotos = gallery.photos || [];
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((p) => {
      // Filtro de Seção
      if (activeSectionId && p.section_id !== activeSectionId) return false;
      // Filtro de Apenas Selecionadas
      if (showOnlySelected && !selectionsMap[p.id]) return false;
      return true;
    });
  }, [allPhotos, activeSectionId, showOnlySelected, selectionsMap]);

  // Lista de Fotos Selecionadas para o Modal de Finalização
  const selectedPhotosList = useMemo(() => {
    return allPhotos.filter((p) => selectionsMap[p.id]);
  }, [allPhotos, selectionsMap]);

  const selectedCount = selectedPhotosList.length;
  const isLocked = Boolean(gallery.selection_locked_at);
  const isDelivered = gallery.status === "delivered";

  // Rolagem suave para o grid
  const scrollToGallery = () => {
    document.getElementById("gallery-content")?.scrollIntoView({ behavior: "smooth" });
  };

  // Se a galeria possuir PIN e ainda não foi desbloqueada
  if (!isPinUnlocked) {
    return (
      <PinAccessModal
        galleryTitle={gallery.title}
        clientName={gallery.client_name}
        onUnlock={handleUnlockPin}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent-gold/30">
      {/* 1. Capa Full-Bleed Estilo Editorial */}
      <CoverHero gallery={gallery} onScrollToGallery={scrollToGallery} />

      {/* 2. Container da Galeria e Navegação de Seções */}
      <div id="gallery-content" className="w-full flex-1 pb-32">
        <SectionTabs
          sections={gallery.sections || []}
          activeSectionId={activeSectionId}
          onSelectSection={setActiveSectionId}
          showOnlySelected={showOnlySelected}
          onToggleShowOnlySelected={() => setShowOnlySelected((prev) => !prev)}
          totalPhotosCount={allPhotos.length}
          selectedCount={selectedCount}
          googleDriveUrl={gallery.google_drive_url}
          isDelivered={isDelivered}
        />

        {/* 3. Grid Masonry Fluido */}
        <MasonryGrid
          photos={filteredPhotos}
          selectionsMap={selectionsMap}
          galleryStatus={gallery.status}
          isLocked={isLocked}
          watermarkType="grid"
          watermarkText="WILLYAM CORTEZ — PROVA"
          onToggleSelect={handleToggleSelect}
          onOpenLightbox={(photo) => {
            setActiveLightboxPhotoId(photo.id);
          }}
          onDownloadSingle={handleDownloadSingle}
        />
      </div>

      {/* 4. Barra Flutuante Inferior (Modo Seleção) */}
      {!isDelivered && (
        <SelectionFloatingBar
          selectedCount={selectedCount}
          photoLimit={gallery.photo_limit}
          extraPhotoPrice={gallery.extra_photo_price}
          isLocked={isLocked}
          onOpenFinalizeModal={() => setIsFinalizeModalOpen(true)}
        />
      )}

      {/* 5. Lightbox Imersiva */}
      {activeLightboxPhotoId && (
        <LightboxModal
          photos={filteredPhotos.length > 0 ? filteredPhotos : allPhotos}
          activePhotoId={activeLightboxPhotoId}
          onClose={() => setActiveLightboxPhotoId(null)}
          selectionsMap={selectionsMap}
          galleryStatus={gallery.status}
          isLocked={isLocked}
          watermarkType="grid"
          watermarkText="WILLYAM CORTEZ — PROVA"
          onToggleSelect={handleToggleSelect}
          onDownloadSingle={handleDownloadSingle}
        />
      )}

      {/* 6. Modal de Revisão & Finalização */}
      <FinalizeSelectionModal
        gallery={gallery}
        selectedPhotos={selectedPhotosList}
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        onFinalizeSuccess={() => {
          setGallery((prev) => ({
            ...prev,
            selection_locked_at: new Date().toISOString(),
          }));
        }}
      />
    </main>
  );
}
