import React, { useState } from "react";
import { FiX, FiDownload, FiMessageCircle } from "react-icons/fi";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""); // ej: http://localhost:8000/api

export function WhatsappCardModal({ open, invitado, onClose, onOpenWhatsapp }) {
  if (!open || !invitado) return null;

  const codigo = invitado.codigo_clave;

  // ✅ Ahora sí coincide con el backend: /api/public/rsvp-card/...
  const statusUrl = `${API}/public/rsvp-card/${encodeURIComponent(codigo)}.png?t=${Date.now()}`;
  const downloadUrlFallback = `${API}/public/rsvp-card/${encodeURIComponent(codigo)}.png?download=1&t=${Date.now()}`;

  const [loading, setLoading] = useState(false);

  const descargar = async () => {
    setLoading(true);
    try {
      // Primero pedimos el status al backend; éste devolverá JSON con download_url
      const statusResp = await fetch(statusUrl);
      if (!statusResp.ok) throw new Error("Error al solicitar generación/estado");

      // Si el backend devuelve JSON con download_url lo usamos; si no, usamos el fallback
      let finalDownloadUrl = downloadUrlFallback;
      const contentType = statusResp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await statusResp.json();
        if (data && data.download_url) finalDownloadUrl = data.download_url;
      } else {
        // En caso raro de que el endpoint devuelva la imagen directamente, pedir con download=1
        finalDownloadUrl = downloadUrlFallback;
      }

      const resp = await fetch(finalDownloadUrl);
      if (!resp.ok) throw new Error("Error al descargar la imagen final");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tarjeta-${codigo}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error al descargar:", error);
      alert("Error al descargar la tarjeta. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const descargarYAbrirWhatsapp = async () => {
    setLoading(true);
    try {
      await descargar();
      // Pequeño delay para asegurar que la descarga se complete localmente
      setTimeout(() => onOpenWhatsapp(), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* ✅ Sin p-5 global: así la imagen no “flota” con padding */}
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER con padding */}
        <div className="p-5">
          <button
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100"
            onClick={onClose}
          >
            <FiX className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Invitación para {invitado.nombre_invitado}
          </h3>

          <p className="text-xs text-slate-500">
            Descarga la tarjeta y luego abre WhatsApp para enviarla.
          </p>
        </div>

        {/* Preview removido: sólo mostramos botones para descargar/generar */}
        <div className="border-y border-slate-200 bg-white h-28 flex items-center justify-center">
          <p className="text-sm text-slate-500">Pulsa descargar para generar o recuperar la tarjeta.</p>
        </div>

        {/* FOOTER con padding */}
        <div className="p-5 flex flex-col gap-2">
          <button
            onClick={descargar}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-full ${loading ? 'bg-slate-700 opacity-80' : 'bg-slate-900 hover:bg-slate-800'} text-white py-2 text-sm font-semibold`}
          >
            <FiDownload className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Generando...' : 'Descargar tarjeta'}
          </button>

          <button
            onClick={descargarYAbrirWhatsapp}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 ${loading ? 'bg-emerald-200 opacity-80' : 'bg-emerald-50 hover:bg-emerald-100'} text-emerald-700 py-2 text-sm font-semibold`}
          >
            <FiMessageCircle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Generando...' : 'Descargar y abrir WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}
