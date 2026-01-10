// src/features/invitados/components/InvitadoSidebar.jsx
import React, { useEffect, useState } from "react";

/**
 * Sidebar para ver/editar un invitado.
 *
 * Props:
 * - invitado: objeto invitado o null
 * - abierto: boolean
 * - onClose: () => void
 * - onGuardar: (datosActualizados) => Promise<void>
 * - onConfirmar: () => Promise<void>
 */
export function InvitadoSidebar({
  invitado,
  abierto,
  onClose,
  onGuardar,
  onConfirmar,
}) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    pases: 1,
    nombreAcompanante: "",
    notas: "",
    estadoConfirmacion: "pendiente",
  });

  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  // Cuando cambia el invitado, llenamos el formulario
  useEffect(() => {
    if (invitado) {
      setForm({
        nombre: invitado.nombre ?? "",
        telefono: invitado.telefono ?? "",
        email: invitado.email ?? "",
        pases: invitado.pases ?? 1,
        nombreAcompanante: invitado.nombreAcompanante ?? "",
        notas: invitado.notas ?? "",
        estadoConfirmacion: invitado.estadoConfirmacion ?? "pendiente",
      });
      setError("");
    }
  }, [invitado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pases" ? Number(value) || 0 : value,
    }));
  };

  const handleGuardar = async () => {
    if (!invitado) return;
    try {
      setGuardando(true);
      setError("");
      await onGuardar({
        ...invitado,
        ...form,
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el invitado. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmar = async () => {
    if (!invitado) return;
    try {
      setConfirmando(true);
      setError("");
      await onConfirmar();
    } catch (err) {
      console.error(err);
      setError("No se pudo confirmar al invitado.");
    } finally {
      setConfirmando(false);
    }
  };

  if (!abierto || !invitado) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-slate-900/40"
        onClick={guardando || confirmando ? undefined : onClose}
      />

      {/* Panel lateral */}
      <div className="w-full max-w-md bg-white shadow-xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Detalle del invitado
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edita los datos y confirma manualmente si es necesario.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando || confirmando}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex-1 overflow-y-auto text-sm space-y-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase mb-1">
              Código / pases
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 border border-slate-200">
                {invitado.codigoClave || "SIN-CÓDIGO"}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Pases:</span>
                <input
                  type="number"
                  min={1}
                  name="pases"
                  value={form.pases}
                  onChange={handleChange}
                  className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Nombre del invitado
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Nombre del acompañante (opcional)
            </label>
            <input
              type="text"
              name="nombreAcompanante"
              value={form.nombreAcompanante}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Notas internas
            </label>
            <textarea
              name="notas"
              rows={3}
              value={form.notas}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase">
              Estado de confirmación
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    estadoConfirmacion: "pendiente",
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs border ${
                  form.estadoConfirmacion === "pendiente"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Pendiente
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    estadoConfirmacion: "confirmado",
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs border ${
                  form.estadoConfirmacion === "confirmado"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Confirmado
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    estadoConfirmacion: "no_asiste",
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs border ${
                  form.estadoConfirmacion === "no_asiste"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                No asistirá
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando || confirmando}
            className="text-xs px-3 py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {form.estadoConfirmacion !== "confirmado" && (
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={confirmando || guardando}
                className="text-xs px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                {confirmando ? "Confirmando..." : "Confirmar invitado"}
              </button>
            )}
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="text-xs px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
