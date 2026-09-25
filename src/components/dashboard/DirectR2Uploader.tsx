"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileImage, X, Loader2 } from "lucide-react";
import { GallerySection, Photo } from "@/types";

interface UploadFileItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  progress: number;
  status: "idle" | "uploading" | "completed" | "error";
  error?: string;
  sectionId?: string | null;
}

interface DirectR2UploaderProps {
  galleryId: string;
  sections: GallerySection[];
  onUploadSuccess: (newPhoto: Photo) => void;
}

export const DirectR2Uploader: React.FC<DirectR2UploaderProps> = ({
  galleryId,
  sections,
  onUploadSuccess,
}) => {
  const [fileQueue, setFileQueue] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sections[0]?.id || null
  );

  React.useEffect(() => {
    if (sections.length > 0 && (!selectedSectionId || !sections.some((s) => s.id === selectedSectionId))) {
      setSelectedSectionId(sections[0].id);
    } else if (sections.length === 0) {
      setSelectedSectionId(null);
    }
  }, [sections]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFiles = async (files: FileList | File[]) => {
    const newItems: UploadFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const previewUrl = URL.createObjectURL(file);
      const dimensions = await getImageDimensions(previewUrl);

      newItems.push({
        id: `upload-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
        file,
        previewUrl,
        width: dimensions.width,
        height: dimensions.height,
        progress: 0,
        status: "idle",
        sectionId: selectedSectionId,
      });
    }

    setFileQueue((prev) => [...prev, ...newItems]);
  };

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 2400, height: 1600 });
      img.src = url;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const startBatchUpload = async () => {
    setIsProcessingBatch(true);

    for (const item of fileQueue) {
      if (item.status === "completed") continue;

      // Atualiza status para uploading
      setFileQueue((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 15 } : f))
      );

      try {
        // 1. Obter presigned URL para o Cloudflare R2
        const presignedRes = await fetch("/api/r2/presigned-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            galleryId,
            filename: item.file.name,
            contentType: item.file.type,
          }),
        });

        let r2Key = `originals/${galleryId}/${Date.now()}_${item.file.name}`;
        let uploadUrl = "";

        if (presignedRes.ok) {
          const presignedData = await presignedRes.json();
          uploadUrl = presignedData.uploadUrl;
          r2Key = presignedData.key;
        }

        // 2. Se houver uploadUrl válida (R2 configurado), faz PUT direto para a Cloudflare
        if (uploadUrl && !uploadUrl.includes("dummy")) {
          setFileQueue((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, progress: 60 } : f))
          );

          await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": item.file.type },
            body: item.file,
          });
        } else {
          // Simula progresso no ambiente de desenvolvimento local
          setFileQueue((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, progress: 80 } : f))
          );
        }

        // 3. Registra os metadados da foto no Supabase
        let photoDbId = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.sectionId || "");
        try {
          const photoSaveRes = await fetch("/api/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              galleryId,
              sectionId: isUUID ? item.sectionId : null,
              r2Key,
              originalFilename: item.file.name,
              width: item.width,
              height: item.height,
              aspectRatio: item.width / item.height,
              orderIndex: Date.now(),
            }),
          });
          if (photoSaveRes.ok) {
            const photoData = await photoSaveRes.json();
            if (photoData?.photo?.id) {
              photoDbId = photoData.photo.id;
            }
          } else {
            const errData = await photoSaveRes.json().catch(() => ({}));
            console.error("Erro ao registrar foto no banco:", errData);
          }
        } catch (dbErr) {
          console.warn("Aviso ao salvar foto no Supabase:", dbErr);
        }

        // 4. Notifica componente pai sobre a nova foto criada
        const newPhoto: Photo = {
          id: photoDbId,
          gallery_id: galleryId,
          section_id: item.sectionId || null,
          r2_key: r2Key,
          original_filename: item.file.name,
          width: item.width,
          height: item.height,
          aspect_ratio: item.width / item.height,
          order_index: Date.now(),
          preview_url: item.previewUrl,
          thumbnail_url: item.previewUrl,
          is_selected: false,
        };

        onUploadSuccess(newPhoto);

        // Marca como concluído
        setFileQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: "completed", progress: 100 } : f))
        );
      } catch (err: any) {
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "error", error: err.message || "Erro no upload" }
              : f
          )
        );
      }
    }

    setIsProcessingBatch(false);
  };

  const removeQueueItem = (id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="bg-surface-900 border border-white/10 rounded-lg p-6 font-sans">
      {/* Seletor de Seção para o lote */}
      {sections.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">
            Destino das fotos:
          </span>
          <select
            value={selectedSectionId || ""}
            onChange={(e) => setSelectedSectionId(e.target.value || null)}
            className="px-3 py-1.5 bg-black/60 border border-white/15 rounded text-xs text-white focus:outline-hidden focus:border-accent-gold"
          >
            <option value="">Sem seção específica</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Área de Arraste (Dropzone) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-accent-gold bg-accent-gold/10"
            : "border-white/20 hover:border-white/40 bg-black/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processSelectedFiles(e.target.files);
          }}
        />

        <div className="w-12 h-12 rounded-full bg-white/10 text-white/80 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h4 className="font-sans text-balance text-lg text-white font-medium mb-1">
          Arraste e solte fotos de alta resolução aqui
        </h4>
        <p className="text-xs text-white/50 mb-3">
          ou clique para selecionar arquivos do computador (JPEG, PNG, WebP)
        </p>
        <span className="inline-block text-[11px] px-3 py-1 rounded-full bg-white/10 text-accent-gold">
          Upload Direto para o Cloudflare R2
        </span>
      </div>

      {/* Lista da Fila de Arquivos */}
      {fileQueue.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 font-medium">
              Fila de Upload ({fileQueue.length} arquivos)
            </span>
            <button
              onClick={startBatchUpload}
              disabled={isProcessingBatch || fileQueue.every((f) => f.status === "completed")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-surface-200 transition-all shadow disabled:opacity-40"
            >
              {isProcessingBatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando para R2...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Iniciar Upload do Lote</span>
                </>
              )}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            {fileQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded text-xs text-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-10 h-10 object-cover rounded shrink-0 bg-surface-800"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white/90">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-white/50">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB — {item.width}×{item.height}px
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "uploading" && (
                    <div className="flex items-center gap-2 text-accent-gold text-[11px]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{item.progress}%</span>
                    </div>
                  )}

                  {item.status === "completed" && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enviado</span>
                    </div>
                  )}

                  {item.status === "error" && (
                    <div className="flex items-center gap-1.5 text-rose-400 text-[11px]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Erro</span>
                    </div>
                  )}

                  {item.status === "idle" && (
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
