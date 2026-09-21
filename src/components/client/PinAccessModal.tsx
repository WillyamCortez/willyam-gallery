"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

interface PinAccessModalProps {
  galleryTitle: string;
  clientName: string;
  onUnlock: (pin: string) => Promise<boolean>;
}

export const PinAccessModal: React.FC<PinAccessModalProps> = ({
  galleryTitle,
  clientName,
  onUnlock,
}) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setIsLoading(true);
    setError(false);

    const success = await onUnlock(pin);
    if (!success) {
      setError(true);
      setPin("");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B] text-white">
      {/* Fundo com efeito sutil */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="relative max-w-sm w-full bg-surface-900 border border-white/10 rounded-2xl p-8 text-center shadow-2xl z-10"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 text-accent-gold flex items-center justify-center mx-auto mb-4 border border-white/10">
          <Lock className="w-5 h-5" />
        </div>

        <h2 className="font-sans text-balance text-2xl text-white font-normal mb-1">
          {galleryTitle}
        </h2>
        <p className="text-xs text-white/50 font-sans tracking-wide mb-6">
          {clientName}
        </p>

        <p className="text-xs text-white/70 font-sans mb-6 leading-relaxed">
          Esta coleção é protegida por senha. Insira o PIN de 4 dígitos fornecido pelo fotógrafo para acessar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              autoFocus
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="0000"
              className={`w-36 text-center text-2xl py-3 px-4 bg-black/60 border rounded text-white font-mono focus:outline-hidden transition-colors ${
                error
                  ? "border-rose-500 ring-1 ring-rose-500"
                  : "border-white/20 focus:border-accent-gold"
              }`}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-rose-400 font-sans"
            >
              PIN incorreto. Tente novamente ou use 1234 para demo.
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading || pin.length < 3}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white text-black font-semibold text-xs hover:bg-surface-200 transition-all disabled:opacity-40 cursor-pointer shadow-md active:scale-98"
          >
            {isLoading ? (
              <span>Validando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar na Galeria</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
