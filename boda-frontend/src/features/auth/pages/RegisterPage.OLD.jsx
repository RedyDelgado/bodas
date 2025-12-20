// src/features/auth/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoadingOverlay } from "../../../shared/context/LoadingOverlayContext.jsx";
import { FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

export function RegisterPage() {
  const { register, error } = useAuth();
  const { showLoader, hideLoader } = useLoadingOverlay();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    nombre_pareja: "",
    subdominio: "",
    fecha_boda: "",
    ciudad: "",
  });
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPasswordConfirm, setMostrarPasswordConfirm] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    
    // Si es el subdominio, limpiar caracteres no permitidos
    if (name === 'subdominio') {
      // Solo permitir letras, números y guiones
      const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setForm((f) => ({ ...f, [name]: cleanValue }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  // Validación de contraseña
  const passwordsMatch = form.password && form.password_confirmation && form.password === form.password_confirmation;
  const passwordLength = form.password.length >= 6;
  const passwordValid = passwordLength && passwordsMatch;
  
  // Validación de subdominio
  const subdominioValid = /^[a-z0-9-]+$/.test(form.subdominio) && form.subdominio.length >= 3;

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!passwordsMatch) {
      setErrorLocal("Las contraseñas no coinciden");
      return;
    }
    
    if (!passwordLength) {
      setErrorLocal("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);
    setErrorLocal(null);
    showLoader("Creando tu cuenta y boda...");

    const resp = await register(form);

    setCargando(false);
    hideLoader();

    if (!resp.ok) {
      setErrorLocal(resp.error || "No se pudo registrar. Revisa los datos.");
      return;
    }

    // Ir directo al panel
    navigate("/panel", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          Crear cuenta y tu boda
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Completa tus datos y comenzaremos tu sitio de boda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input 
                  name="name" 
                  required 
                  value={form.name} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={form.email} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Seguridad de tu Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input 
                    type={mostrarPassword ? "text" : "password"}
                    name="password" 
                    required 
                    value={form.password} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${passwordLength ? 'text-green-600' : 'text-slate-400'}`}>
                    {passwordLength ? <FiCheck size={12} /> : <FiX size={12} />}
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Repetir contraseña
                </label>
                <div className="relative">
                  <input 
                    type={mostrarPasswordConfirm ? "text" : "password"}
                    name="password_confirmation" 
                    required 
                    value={form.password_confirmation} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPasswordConfirm(!mostrarPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarPasswordConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {form.password_confirmation && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordsMatch ? <FiCheck size={12} /> : <FiX size={12} />}
                    {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Datos de la Boda */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Datos de tu Boda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la pareja
                </label>
                <input 
                  name="nombre_pareja" 
                  required 
                  value={form.nombre_pareja} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Ej: María & Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subdominio deseado
                </label>
                <input 
                  name="subdominio" 
                  required 
                  value={form.subdominio} 
                  onChange={handleChange} 
                  placeholder="maria-y-juan" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tu sitio será: <span className="font-medium">{form.subdominio || 'tu-boda'}.miwebdebodas.com</span>
                </p>
                {form.subdominio && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${subdominioValid ? 'text-green-600' : 'text-orange-600'}`}>
                    {subdominioValid ? <FiCheck size={12} /> : <FiX size={12} />}
                    {subdominioValid ? 'Subdominio válido' : 'Solo letras, números y guiones (mínimo 3)'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha de la boda (opcional)
                </label>
                <input 
                  type="date" 
                  name="fecha_boda" 
                  value={form.fecha_boda} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ciudad (opcional)
                </label>
                <input 
                  name="ciudad" 
                  value={form.ciudad} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Ciudad del evento"
                />
              </div>
            </div>
          </div>

          {(error || errorLocal) && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorLocal || error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={cargando || !passwordValid || !subdominioValid} 
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {cargando ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando tu cuenta...
              </>
            ) : (
              "Crear cuenta y empezar"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-slate-800 hover:text-slate-900 font-semibold">
              Inicia sesión
            </a>
          </p>
        </div>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Al registrarte aceptas los términos de uso.
        </p>
      </div>
    </div>
  );
}
