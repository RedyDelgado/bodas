// src/features/fotos/components/GaleriaBodaPanel.jsx
import React, { useState } from "react";
import { useFotosBoda } from "../hooks/useFotosBoda";

export function GaleriaBodaPanel({ bodaId }) {
  const {
    fotos,
    cargando,
    subiendo,
    error,
    subir,
    eliminar,
    marcarPortada,
  } = useFotosBoda(bodaId);

  const [archivo, setArchivo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    await subir(archivo, { titulo, descripcion });
    setArchivo(null);
    setTitulo("");
    setDescripcion("");
    // limpiamos el input file manualmente
    e.target.reset?.();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Galería de fotos de la boda
          </h2>
          <p className="text-[11px] text-slate-500">
            Sube y gestiona las fotos que se mostrarán en la página pública.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      {/* Formulario de subida */}
      <form
        onSubmit={handleSubir}
        className="border border-dashed border-slate-300 rounded-lg p-3 mb-4 text-xs flex flex-col md:flex-row md:items-center gap-3"
      >
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="text-xs"
            />
            <input
              type="text"
              placeholder="Título (opcional)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="flex-1 border border-slate-200 rounded-md px-2 py-1"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border border-slate-200 rounded-md px-2 py-1"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={!archivo || subiendo}
            className="px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {subiendo ? "Subiendo..." : "Subir foto"}
          </button>
        </div>
      </form>

      {/* Lista / grid de fotos */}
      {cargando ? (
        <p className="text-sm text-slate-500">Cargando fotos...</p>
      ) : fotos.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aún no hay fotos en la galería.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {fotos
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            .map((foto) => (
              <div
                key={foto.id}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
                  {/* Aquí asumimos que urlImagen es accesible desde el navegador */}
                  <img
                    src={foto.urlImagen}
                    alt={foto.titulo || "Foto de boda"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                      {foto.titulo || "Sin título"}
                    </p>
                    {foto.descripcion && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {foto.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {foto.esPortada ? (
                      <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">
                        Portada
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => marcarPortada(foto.id)}
                        className="px-2 py-1 rounded-full bg-slate-900 text-white text-[10px] hover:bg-slate-800"
                      >
                        Hacer portada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminar(foto.id)}
                      className="px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
