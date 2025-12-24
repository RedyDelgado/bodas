import React, { useEffect, useState } from "react";

export default function EditInvitadoModal({ open, invitado, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre_invitado: invitado?.nombre_invitado || "",
    celular: invitado?.celular || "",
    pases: invitado?.pases || 1,
  });

  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState(""); // mensaje pequeño
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setForm({
      nombre_invitado: invitado?.nombre_invitado || "",
      celular: invitado?.celular || "",
      pases: invitado?.pases || 1,
    });
    setSaving(false);
    setStatusText("");
    setErrorText("");
  }, [invitado]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pases" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setErrorText("");
    setStatusText("Guardando cambios…");

    try {
      // IMPORTANT: onSave debe retornar una promesa (tu handler ya es async, ok)
      await Promise.resolve(onSave(form));

      // Este texto se verá un instante antes de cerrarse el modal (si tu onSave lo cierra)
      setStatusText("Actualizando lista / generando tarjeta…");
    } catch (err) {
      setErrorText(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo guardar. Revisa los datos."
      );
      setStatusText("");
      setSaving(false);
      return;
    }

    // Si tu onSave cierra el modal, esta parte casi ni se nota, pero no estorba.
    setSaving(false);
    setStatusText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Editar invitado</h2>

        {errorText ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {errorText}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre del invitado
            </label>
            <input
              type="text"
              name="nombre_invitado"
              value={form.nombre_invitado}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Número de pases
            </label>
            <input
              type="number"
              min={1}
              name="pases"
              value={form.pases}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Teléfono (WhatsApp)
            </label>
            <input
              type="text"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-full text-xs font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/70 border-b-transparent animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </form>

        {/* Overlay pequeño (tipo “refrescando/generando”) */}
        {(saving || statusText) && (
          <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-b-transparent animate-spin" />
              <span className="text-xs font-medium text-slate-700">
                {statusText || "Procesando…"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
