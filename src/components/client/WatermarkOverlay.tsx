"use client";

import React from "react";
import { WatermarkType } from "@/types";

interface WatermarkOverlayProps {
  type?: WatermarkType;
  text?: string | null;
  opacity?: number;
  logoUrl?: string | null;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  type = "grid",
  text = "PROVA — WILLYAM CORTEZ",
  opacity = 0.3,
  logoUrl,
}) => {
  if (type === "center") {
    return (
      <div
        className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-10 overflow-hidden"
        style={{ opacity }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Watermark"
            className="max-w-[50%] max-h-[50%] object-contain filter drop-shadow-md"
            draggable={false}
          />
        ) : (
          <div className="border border-white/60 bg-black/30 backdrop-blur-xs px-6 py-3 rounded text-center font-sans text-balance text-white font-medium text-sm md:text-lg drop-shadow-md">
            {text || "PROVA"}
          </div>
        )}
      </div>
    );
  }

  // Padrão em Grid Diagonal Repetido
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 flex items-center justify-center"
      style={{ opacity }}
    >
      <div className="w-[180%] h-[180%] flex flex-col justify-around rotate-[-30deg] space-y-12">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex justify-around whitespace-nowrap text-white font-sans font-semibold text-xs md:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <span className="opacity-90">{text}</span>
            <span className="opacity-90">{text}</span>
            <span className="opacity-90">{text}</span>
            <span className="opacity-90">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
