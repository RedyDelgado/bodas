// src/shared/components/ui/FullScreenLoader.jsx
import React from "react";
import { createPortal } from "react-dom";

export function FullScreenLoader({ message = "Cargando..." }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900/80 px-10 py-8 shadow-xl border border-white/10">
        {/* Zona visual principal */}
        <div className="relative">
          {/* Anillo giratorio */}
          <div className="w-24 h-24 rounded-full border-4 border-pink-300/40 border-t-transparent animate-spin" />

          {/* Icono de novios al centro */}
          <div className="absolute inset-2 flex items-center justify-center">
            <img
              src="/loader-novios.svg"
              alt="Cargando tu web de boda"
              className="h-14 w-14 drop-shadow-md"
            />
          </div>
        </div>

        {/* Mensaje principal */}
        <p className="text-sm font-medium tracking-wide text-slate-100 uppercase">
          {message}
        </p>

        {/* Mensaje secundario opcional */}
        <p className="text-xs text-slate-300/80 text-center max-w-xs">
          Preparando tu experiencia de boda personalizada...
        </p>
      </div>
    </div>,
    document.body
  );
}
