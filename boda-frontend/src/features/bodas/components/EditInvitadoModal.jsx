import React, { useState } from "react";

export default function EditInvitadoModal({ open, invitado, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre_invitado: invitado?.nombre_invitado || "",
    celular: invitado?.celular || "",
    pases: invitado?.pases || 1,
  });

  React.useEffect(() => {
    setForm({
      nombre_invitado: invitado?.nombre_invitado || "",
      celular: invitado?.celular || "",
      pases: invitado?.pases || 1,
    });
  }, [invitado]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pases" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Editar invitado</h2>
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
