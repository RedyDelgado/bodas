// src/features/auth/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoadingOverlay } from "../../../shared/context/LoadingOverlayContext";
import { FiLock } from "react-icons/fi";

export function LoginPage() {
  const { login, error } = useAuth();
  const { showLoader, hideLoader } = useLoadingOverlay();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  const from = location.state?.from?.pathname || "/panel";

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setErrorLocal(null);
    showLoader("Iniciando sesión...");

    const resp = await login({ email, password });

    setCargando(false);
    hideLoader();

    if (!resp.ok) {
      setErrorLocal("No se pudo iniciar sesión. Verifica tus credenciales.");
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          Iniciar sesión
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Accede al panel para administrar tus bodas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="••••••••"
            />
            <div className="mt-2 text-right">
              <a 
                href="/forgot-password" 
                className="text-xs text-slate-600 hover:text-slate-800 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {(error || errorLocal) && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorLocal || error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {cargando ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Ingresando...
              </>
            ) : (
              <>
                <FiLock size={18} />
                Ingresar
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Plataforma de gestión de páginas de boda.
        </p>
      </div>
    </div>
  );
}
