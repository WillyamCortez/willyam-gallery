"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockGalleries } from "@/lib/mock-data";
import { Photo, GallerySection, GalleryStatus, Gallery } from "@/types";
import { DirectR2Uploader } from "@/components/dashboard/DirectR2Uploader";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  Unlock,
  Star,
  Image as ImageIcon,
} from "lucide-react";

export default function EditGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const galleryId = params?.id as string;

  const getInitialGallery = () => {
    const staticFound = mockGalleries.find((g) => g.id === galleryId || g.slug === galleryId);
    if (staticFound) return staticFound;

    return {
      id: galleryId,
      photographer_id: "",
      title: "Carregando Galeria...",
      slug: galleryId,
      client_name: "",
      status: "selection" as GalleryStatus,
      photo_limit: 20,
      extra_photo_price: 15.0,
      sections: [] as GallerySection[],
      photos: [] as Photo[],
    } as Gallery;
  };

  const initialGallery = getInitialGallery();
  const [gallery, setGallery] = useState(initialGallery);
  const [sections, setSections] = useState<GallerySection[]>(initialGallery.sections || []);
  const [photos, setPhotos] = useState<Photo[]>(initialGallery.photos || []);
  const [newSectionName, setNewSectionName] = useState("");
  const [saveToast, setSaveToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega os dados reais do Supabase ou localStorage no cliente
  React.useEffect(() => {
    // 1. Tenta carregar do localStorage imediatamente no cliente
    try {
      const saved = localStorage.getItem("willyam_galleries");
      if (saved) {
        const list = JSON.parse(saved);
        const found = list.find((g: any) => g.id === galleryId || g.slug === galleryId);
        if (found) {
          setGallery(found);
          if (found.sections) setSections(found.sections);
          if (found.photos) setPhotos(found.photos);
        }
      }
    } catch (e) {}

    // 2. Busca do Supabase
    async function loadGallery() {
      try {
        const res = await fetch(`/api/galleries/${galleryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.gallery) {
            setGallery(data.gallery);
            if (data.gallery.sections) setSections(data.gallery.sections);
            if (data.gallery.photos) setPhotos(data.gallery.photos);
          }
        }
      } catch (err) {
        console.warn("Usando galeria local de fallback:", err);
      }
    }
    if (galleryId) loadGallery();
  }, [galleryId]);

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const newSec: GallerySection = {
      id: `sec-${Date.now()}`,
      gallery_id: gallery.id,
      name: newSectionName.trim(),
      order_index: sections.length,
    };

    setSections((prev) => [...prev, newSec]);
    setNewSectionName("");
  };

  const handleDeletePhoto = async (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    try {
      await fetch("/api/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
    } catch (e) {
      console.warn("Erro ao excluir foto:", e);
    }
  };

  const handleSetCoverPhoto = async (photo: Photo) => {
    const newCoverKey = photo.r2_key;
    const newCoverUrl = photo.thumbnail_url || photo.preview_url;
    setGallery((prev: any) => ({
      ...prev,
      cover_image_key: newCoverKey,
      cover_image_url: newCoverUrl,
    }));

    try {
      await fetch(`/api/galleries/${gallery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...gallery,
          cover_image_key: newCoverKey,
          sections,
        }),
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.warn("Erro ao salvar nova capa:", err);
    }
  };

  const handleUploadSuccess = (newPhoto: Photo) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteGallery = async () => {
    setIsDeleting(true);
    setShowDeleteModal(false);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("willyam_galleries");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          const updated = list.filter((g: any) => g.id !== gallery.id && g.slug !== gallery.slug);
          localStorage.setItem("willyam_galleries", JSON.stringify(updated));
        } catch (e) {}
      }
    }

    try {
      await fetch(`/api/galleries/${gallery.id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Failed to delete gallery via API:", e);
    } finally {
      setIsDeleting(false);
      router.push("/dashboard");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/galleries/${gallery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...gallery,
          sections,
        }),
      });

      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("willyam_galleries");
          const list = saved ? JSON.parse(saved) : [];
          const updated = list.map((g: any) =>
            g.id === gallery.id || g.slug === gallery.slug ? { ...g, ...gallery, sections } : g
          );
          localStorage.setItem("willyam_galleries", JSON.stringify(updated));
        } catch (e) {}
      }

      if (res.ok) {
        const data = await res.json();
        if (data?.gallery) {
          setGallery((prev: any) => ({ ...prev, ...data.gallery }));
          if (data.gallery.sections) {
            setSections(data.gallery.sections);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao salvar galeria:", e);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Cabeçalho */}
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
              {gallery.title}
            </h1>
            <p className="text-xs text-white/60">
              Cliente: {gallery.client_name} — {photos.length} fotos cadastradas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/galleries/${gallery.id}/selections`}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-amber-500/20 text-accent-gold hover:bg-amber-500/30 text-sm font-medium transition-colors border border-amber-500/30"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ver Seleção & Lightroom</span>
          </Link>

          <Link
            href={`/gallery/${gallery.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            <span>Ver Galeria</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Upload R2 e Fotos da Galeria */}
        <div className="lg:col-span-8 space-y-8">
          {/* Uploader R2 Direto */}
          <div>
            <h3 className="text-sm font-semibold text-accent-gold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Adicionar Novas Fotos (Upload R2)</span>
            </h3>
            <DirectR2Uploader
              galleryId={gallery.id}
              sections={sections}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          {/* Gerenciamento de Fotos */}
          <div className="bg-surface-900 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Fotos no Álbum ({photos.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-none">
              {photos.map((photo) => {
                const isCover =
                  gallery.cover_image_key === photo.r2_key ||
                  (gallery.cover_image_url && gallery.cover_image_url === photo.preview_url);

                return (
                  <div
                    key={photo.id}
                    className={`group relative aspect-square rounded overflow-hidden bg-black border transition-all ${
                      isCover ? "border-amber-400 ring-2 ring-amber-400/50" : "border-white/10"
                    }`}
                  >
                    <img
                      src={photo.thumbnail_url || photo.preview_url}
                      alt={photo.original_filename}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge fixo da Capa */}
                    {isCover && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-black" />
                        <span>Capa</span>
                      </div>
                    )}

                    {/* Overlay de Ações ao passar o mouse */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                      <div className="flex items-center justify-between gap-1">
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetCoverPhoto(photo)}
                            className="p-1.5 px-2 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black transition-colors flex items-center gap-1 text-[11px] font-semibold border border-amber-500/30"
                            title="Definir esta foto como capa do álbum"
                          >
                            <Star className="w-3 h-3" />
                            <span>Definir Capa</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>Capa Atual</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 rounded bg-rose-600/80 hover:bg-rose-600 text-white ml-auto transition-colors"
                          title="Excluir foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[10px] text-white/90 truncate font-mono">
                        {photo.original_filename}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Status, Configurações e Seções */}
        <form onSubmit={handleSave} className="lg:col-span-4 space-y-6">
          {/* Card de Capa do Álbum */}
          <div className="bg-surface-900 border border-white/10 rounded-lg p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between pb-2 border-b border-white/10">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent-gold" />
                <span>Capa do Álbum</span>
              </span>
              {gallery.cover_image_key && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Personalizada
                </span>
              )}
            </h3>

            {gallery.cover_image_url || gallery.cover_image_key ? (
              <div className="relative aspect-video rounded overflow-hidden bg-black border border-white/10">
                <img
                  src={gallery.cover_image_url || gallery.cover_image_key}
                  alt="Capa da galeria"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] text-white flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Foto de Capa Atual</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded border border-dashed border-white/20 text-center text-xs text-white/50">
                Nenhuma capa selecionada. Passe o mouse sobre qualquer foto ao lado e clique em <strong className="text-amber-300">"Definir Capa"</strong>.
              </div>
            )}
            <p className="text-[11px] text-white/40">
              Esta é a imagem que seus clientes verão em tela cheia ao abrir o link do álbum.
            </p>
          </div>

          {/* Status da Galeria */}
          <div className="bg-surface-900 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white pb-2 border-b border-white/10">
              Modo da Galeria
            </h3>

            <div>
              <label className="block text-xs text-white/70 mb-2">
                Status Atual
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGallery((prev: any) => ({ ...prev, status: "selection" }))}
                  className={`p-3 rounded text-center text-sm font-medium transition-all border ${
                    gallery.status === "selection"
                      ? "bg-blue-500/20 border-blue-400 text-blue-300"
                      : "bg-black/40 border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  Em Seleção
                </button>
                <button
                  type="button"
                  onClick={() => setGallery((prev: any) => ({ ...prev, status: "delivered" }))}
                  className={`p-3 rounded text-center text-sm font-medium transition-all border ${
                    gallery.status === "delivered"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-black/40 border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  Entregue (Final)
                </button>
              </div>
            </div>

            {/* Trava de Seleção */}
            <div className="pt-2">
              <label className="block text-xs text-white/70 mb-1">
                Trava de Seleção
              </label>
              <button
                type="button"
                onClick={() =>
                  setGallery((prev: any) => ({
                    ...prev,
                    selection_locked_at: prev.selection_locked_at ? null : new Date().toISOString(),
                  }))
                }
                className={`w-full py-3 px-3 rounded flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                  gallery.selection_locked_at
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {gallery.selection_locked_at ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Seleção Travada (Destravar)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Seleção Aberta (Travar)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Regras e Links */}
          <div className="bg-surface-900 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white pb-2 border-b border-white/10">
              Regras Contratuais
            </h3>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                Fotos Inclusas
              </label>
              <input
                type="number"
                value={gallery.photo_limit}
                onChange={(e) =>
                  setGallery((prev: any) => ({
                    ...prev,
                    photo_limit: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                Valor da Foto Extra (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={gallery.extra_photo_price}
                onChange={(e) =>
                  setGallery((prev: any) => ({
                    ...prev,
                    extra_photo_price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                PIN de Acesso
              </label>
              <input
                type="text"
                value={gallery.access_pin || ""}
                onChange={(e) =>
                  setGallery((prev: any) => ({
                    ...prev,
                    access_pin: e.target.value || null,
                  }))
                }
                placeholder="1234 (opcional)"
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">
                Link da Pasta no Google Drive
              </label>
              <input
                type="url"
                value={gallery.google_drive_url || ""}
                onChange={(e) =>
                  setGallery((prev: any) => ({
                    ...prev,
                    google_drive_url: e.target.value || null,
                  }))
                }
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
              />
            </div>
          </div>

          {/* Gerenciamento de Seções */}
          <div className="bg-surface-900 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white pb-2 border-b border-white/10">
              Seções da Galeria
            </h3>

            <div className="space-y-2">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2 bg-black/40 border border-white/10 rounded text-xs text-white"
                >
                  <span>{sec.name}</span>
                  <button
                    type="button"
                    onClick={() => setSections((prev) => prev.filter((s) => s.id !== sec.id))}
                    className="p-1 text-white/40 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Nova seção..."
                className="flex-1 px-3 py-1.5 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
              />
              <button
                type="button"
                onClick={handleAddSection}
                className="p-2 rounded bg-white text-black hover:bg-surface-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botão Salvar Alterações */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white text-black font-semibold text-xs hover:bg-surface-200 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saveToast ? "Alterações Salvas!" : "Salvar Alterações"}</span>
          </button>

          {/* Zona de Perigo: Excluir Galeria */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-all duration-200 active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Esta Galeria</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Excluir Galeria?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tem certeza de que deseja excluir permanentemente a galeria <strong>{gallery.title}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteGallery}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-md shadow-rose-600/20 active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Excluindo..." : "Confirmar Exclusão"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
