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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-blue-100 text-sm">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          {!enviado ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="tu@email.com"
                  disabled={cargando}
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-4 text-base font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                    <FiMail size={20} />
                    Enviar enlace de recuperación
                  </>
                )}
              </button>

              <div className="text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  <FiArrowLeft size={16} />
                  Volver al inicio de sesión
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiCheck className="text-green-600" size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  ¡Correo enviado!
                </h3>
                <p className="text-sm text-slate-600">
                  {mensaje}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
              </div>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                <FiArrowLeft size={16} />
                Volver al inicio de sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
