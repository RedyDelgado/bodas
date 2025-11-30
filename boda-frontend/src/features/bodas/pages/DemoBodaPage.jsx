// src/features/bodas/pages/DemoBodaPage.jsx
import React from "react";
import { useParams } from "react-router-dom";

export function DemoBodaPage() {
  const { slug } = useParams();

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Demo de boda: {slug}
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Aquí más adelante mostraremos la plantilla pública de la boda,
          con textos, colores, fotos e invitados cargados desde la API.
        </p>
        <div className="h-48 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
          Sección de portada de la boda (maquetada en fases posteriores).
        </div>
      </div>
    </section>
  );
}
