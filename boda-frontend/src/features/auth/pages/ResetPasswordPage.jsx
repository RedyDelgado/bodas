// src/features/auth/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiLock, FiArrowLeft, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import axiosClient from "../../../shared/config/axiosClient";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [completado, setCompletado] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Enlace de recuperación inválido o expirado.");
    }
  }, [token, email]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    setMensaje("");
    setError("");

    try {
      const { data } = await axiosClient.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      setMensaje(data.message || "Contraseña restablecida exitosamente");
      setCompletado(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Error al restablecer la contraseña. El enlace puede haber expirado."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-slate-300 text-sm">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          {!completado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email || ""}
                  disabled
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Mínimo 6 caracteres"
                    disabled={cargando || !token || !email}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Confirma tu contraseña"
                    disabled={cargando || !token || !email}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando || !token || !email}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Restableciendo...
                  </>
                ) : (
                  <>
                    <FiLock size={18} />
                    Restablecer contraseña
                  </>
                )}
              </button>

              <div className="text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  <FiArrowLeft size={14} />
                  Volver al inicio de sesión
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiCheck className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  ¡Contraseña restablecida!
                </h3>
                <p className="text-sm text-slate-600">
                  {mensaje}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Serás redirigido al inicio de sesión...
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="px-8 pb-6 text-xs text-slate-400 text-center">
          Plataforma de gestión de páginas de boda.
        </p>
      </div>
    </div>
  );
}
