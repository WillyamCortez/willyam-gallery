"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Gallery } from "@/types";
import { formatDate } from "@/lib/utils";

interface CoverHeroProps {
  gallery: Gallery;
  onScrollToGallery: () => void;
}

export const CoverHero: React.FC<CoverHeroProps> = ({ gallery, onScrollToGallery }) => {
  return (
    <div className="relative w-full h-[92vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-surface-950 text-white select-none">
      {/* Imagem de Fundo Full-Bleed */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="absolute inset-0 bg-cover bg-center z-0 filter brightness-[0.75]"
        style={{
          backgroundImage: `url(${gallery.cover_image_key || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=90"})`,
        }}
      />

      {/* Gradientes e Vinhetas Elegantes */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 z-1" />
      <div className="absolute inset-0 bg-radial-vignette opacity-60 z-1" />

      {/* Conteúdo Central com Tipografia Editorial */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Título do Ensaio */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="font-sans text-balance text-4xl sm:text-6xl md:text-7xl font-normal tracking-wide text-white leading-tight drop-shadow-lg mb-4"
        >
          {gallery.title}
        </motion.h1>

        {/* Nome dos Clientes & Data */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-white/80 font-sans text-sm sm:text-base"
        >
          <span>{gallery.client_name}</span>
          {gallery.event_date && (
            <>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{formatDate(gallery.event_date)}</span>
            </>
          )}
        </motion.div>

        {/* Descrição sutil */}
        {gallery.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mt-6 max-w-xl text-white/70 font-sans text-xs sm:text-sm leading-relaxed line-clamp-3 font-light"
          >
            {gallery.description}
          </motion.p>
        )}
      </div>

      {/* Botão de Rolagem Suave */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        onClick={onScrollToGallery}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer group"
      >
        <span className="text-[11px] font-sans font-medium">
          Ver Coleção
        </span>
        <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/15 transition-all">
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </motion.button>
    </div>
  );
};
