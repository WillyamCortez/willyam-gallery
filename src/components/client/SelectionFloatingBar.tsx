"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, CheckCircle2, AlertCircle, ArrowRight, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SelectionFloatingBarProps {
  selectedCount: number;
  photoLimit: number;
  extraPhotoPrice: number;
  isLocked: boolean;
  onOpenFinalizeModal: () => void;
}

export const SelectionFloatingBar: React.FC<SelectionFloatingBarProps> = ({
  selectedCount,
  photoLimit,
  extraPhotoPrice,
  isLocked,
  onOpenFinalizeModal,
}) => {
  const isOverLimit = selectedCount > photoLimit;
  const extraCount = Math.max(0, selectedCount - photoLimit);
  const extraTotalAmount = extraCount * extraPhotoPrice;
  const progressPercent = Math.min(100, Math.round((selectedCount / photoLimit) * 100));

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 px-4 pointer-events-none flex justify-center">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="pointer-events-auto max-w-2xl w-full bg-surface-950/95 backdrop-blur-xl border border-white/15 text-white rounded-full py-3 px-5 sm:px-6 shadow-2xl flex items-center justify-between gap-4"
      >
        {/* Lado Esquerdo: Contador e Status */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {isLocked ? (
              <Lock className="w-4 h-4 text-amber-400" />
            ) : isOverLimit ? (
              <AlertCircle className="w-4 h-4 text-accent-gold" />
            ) : (
              <Heart className={`w-4 h-4 ${selectedCount > 0 ? "fill-rose-500 text-rose-500" : "text-white/60"}`} />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide font-sans">
                {selectedCount}{" "}
                <span className="text-white/50 font-normal">de {photoLimit} inclusas</span>
              </span>

              {isOverLimit && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-accent-gold border border-amber-500/30">
                  +{extraCount} extras ({formatCurrency(extraTotalAmount)})
                </span>
              )}
            </div>

            {/* Barra de Progresso sutil */}
            <div className="w-32 sm:w-48 h-1 bg-white/15 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit ? "bg-accent-gold" : "bg-emerald-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lado Direito: Botão de CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {isLocked ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/10 text-white/80 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seleção Travada</span>
            </div>
          ) : (
            <button
              onClick={onOpenFinalizeModal}
              disabled={selectedCount === 0}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium transition-all ${
                selectedCount === 0
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-white text-black hover:bg-surface-200 active:scale-[0.98] transition-transform duration-200 ease-out shadow-md cursor-pointer"
              }`}
            >
              <span>Finalizar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
