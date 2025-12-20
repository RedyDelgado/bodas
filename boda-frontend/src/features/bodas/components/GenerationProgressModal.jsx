import { useEffect } from "react";

export default function GenerationProgressModal({ open, progress, onClose }) {
  if (!open) return null;

  const total = progress?.total ?? 0;
  const generadas = progress?.generadas ?? 0;
  const estado = progress?.estado ?? "en_cola";

  const pct =
    total > 0 ? Math.min(100, Math.round((generadas / total) * 100)) : 0;

  const bloqueando = estado === "en_cola" || estado === "procesando";

  // Debug: mostrar cambios
  console.log('GenerationProgressModal render:', { estado, generadas, total, pct });

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-base font-semibold text-slate-900">
            Generando tarjetas
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {bloqueando
              ? "Por favor espera. No cierres esta ventana."
              : "Proceso finalizado."}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 font-medium">
              {estado === "en_cola" && "En cola…"}
              {estado === "procesando" && "Procesando…"}
              {estado === "finalizado" && "Finalizado"}
              {estado === "error" && "Error"}
            </span>
            <span className="font-mono  font-medium text-slate-900 text-lg">
              {generadas}/{total}
            </span>
          </div>

          <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progreso: {pct}%</span>
            {estado === "procesando" && (
              <span className="animate-pulse text-emerald-600 font-medium">
                En proceso...
              </span>
            )}
          </div>
          
          {estado === "error" && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3">
              {progress?.mensaje || "Ocurrió un error durante la generación."}
            </div>
          )}

          <button
            type="button"
            disabled={bloqueando}
            onClick={!bloqueando ? onClose : undefined}
            className={`w-full rounded-xl py-2.5 text-sm font-medium transition-all ${
              bloqueando
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {bloqueando ? "Generando…" : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
