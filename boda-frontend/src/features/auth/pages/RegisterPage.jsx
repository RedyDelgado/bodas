// src/features/auth/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoadingOverlay } from "../../../shared/context/LoadingOverlayContext.jsx";

export function RegisterPage() {
  const { register, error } = useAuth();
  const { showLoader, hideLoader } = useLoadingOverlay();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nombre_pareja: "",
    subdominio: "",
    fecha_boda: "",
    ciudad: "",
  });
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setErrorLocal(null);
    showLoader("Creando tu cuenta y boda...");

    const resp = await register(form);

    setCargando(false);
    hideLoader();

    if (!resp.ok) {
      setErrorLocal("No se pudo registrar. Revisa los datos.");
      return;
    }

    // Ir directo al panel
    navigate("/panel", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          Crear cuenta y tu boda
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Completa tus datos y comenzaremos tu sitio de boda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
              <input name="name" required value={form.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input type="password" name="password" required value={form.password} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la pareja</label>
              <input name="nombre_pareja" required value={form.nombre_pareja} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subdominio deseado</label>
              <input name="subdominio" required value={form.subdominio} onChange={handleChange} placeholder="ej. redy-patricia" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad (opcional)</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de la boda (opcional)</label>
            <input type="date" name="fecha_boda" value={form.fecha_boda} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          {(error || errorLocal) && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorLocal || error}
            </div>
          )}

          <button type="submit" disabled={cargando} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed">
            {cargando ? "Registrando..." : "Crear cuenta y empezar"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Al registrarte aceptas los términos de uso.
        </p>
      </div>
    </div>
  );
}
