// src/features/auth/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { FiMail, FiArrowLeft, FiCheck } from "react-icons/fi";
import axiosClient from "../../../shared/config/axiosClient";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setError("");

    try {
      const { data } = await axiosClient.post("/auth/forgot-password", { email });
      setMensaje(data.message || "Correo enviado exitosamente");
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error al enviar el correo");
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
            <FiMail className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-slate-300 text-sm">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          {!enviado ? (
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
                  disabled={cargando}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
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
                    Enviando...
                  </>
                ) : (
                  <>
                    <FiMail size={18} />
                    Enviar enlace de recuperación
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
                  ¡Correo enviado!
                </h3>
                <p className="text-sm text-slate-600">
                  {mensaje}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
              </div>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 font-medium"
              >
                <FiArrowLeft size={14} />
                Volver al inicio de sesión
              </a>
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
