// src/features/public/components/RsvpModal.jsx
import React, { useState } from "react";
import { FiX, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { registrarRsvp, validarCodigo } from "../services/publicRsvpService";

import {
  COLOR_AZUL,
  COLOR_MARFIL,
  COLOR_DORADO,
  COLOR_CORAL,
} from "../../../shared/styles/colors";
/**
 * Modal mejorado para confirmación de RSVP
 * Diseño elegante y funcional
 */
export function RsvpModal({ isOpen, onClose, onSuccess }) {
  // Colores de boda (importados desde tokens compartidos)
  // Etapas: 'buscar' (solo código) | 'confirmar' (mostrar datos y confirmar)
  const [etapa, setEtapa] = useState("buscar");

  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [mensajePersonal, setMensajePersonal] = useState("");
  const [numeroContacto, setNumeroContacto] = useState("");
  const [estadoFormulario, setEstadoFormulario] = useState("idle"); // idle | loading | success | error
  const [mensajeError, setMensajeError] = useState("");
  const [invitadoEncontrado, setInvitadoEncontrado] = useState(null);

  // Maneja envío final (confirmación) - solo se llama en etapa 'confirmar'
  const manejadorEnvio = async (e) => {
    e.preventDefault();
    setMensajeError("");

    // Validación mínima
    if (!codigoInvitacion.trim()) {
      setEstadoFormulario("error");
      setMensajeError("Código de invitación requerido.");
      return;
    }

    if (!numeroContacto.trim() || numeroContacto.trim().length < 6) {
      setEstadoFormulario("error");
      setMensajeError("Ingresa un número de celular válido.");
      return;
    }

    try {
      setEstadoFormulario("loading");

      const cargaUtilidad = {
        codigo: codigoInvitacion.trim().toUpperCase(),
        respuesta: "confirmado",
        cantidad_personas: Number(cantidadPersonas) || 1,
        mensaje: mensajePersonal.trim() || null,
        celular: numeroContacto.trim(),
      };

      const respuesta = await registrarRsvp(cargaUtilidad);

      setEstadoFormulario("success");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess({
            nombre: respuesta?.invitado?.nombre_invitado || "Invitado",
            cantidad: respuesta?.invitado?.pases || cantidadPersonas,
          });
        }, 600);
      }

      // limpiar y cerrar luego
      setTimeout(() => {
        setCodigoInvitacion("");
        setCantidadPersonas(1);
        setMensajePersonal("");
        setNumeroContacto("");
        setInvitadoEncontrado(null);
        setEtapa("buscar");
      }, 500);
    } catch (error) {
      console.error("Error en confirmación:", error);
      setEstadoFormulario("error");
      if (error.response?.status === 404) {
        setMensajeError("No encontramos tu invitación. Verifica el código.");
      } else if (error.response?.status === 422) {
        const errores = error.response?.data?.errors;
        const primerError = errores ? Object.values(errores)[0] : null;
        setMensajeError(Array.isArray(primerError) ? primerError[0] : primerError || "Datos inválidos.");
      } else {
        setMensajeError("Ocurrió un error al confirmar. Intenta más tarde.");
      }
    }
  };

  // Validar código - etapa previa
  const validarCodigoAction = async (e) => {
    e?.preventDefault?.();
    setMensajeError("");
    if (!codigoInvitacion.trim()) {
      setMensajeError("Por favor ingresa el código de invitación para validar.");
      return;
    }

    try {
      setEstadoFormulario("loading");
      const { data } = await validarCodigo(codigoInvitacion.trim().toUpperCase());
      if (data?.ok && data?.invitado) {
        const inv = data.invitado;
        setInvitadoEncontrado(inv);
        setCantidadPersonas(inv.pases || 1);
        setNumeroContacto(inv.celular || "");
        setEtapa("confirmar");
        setEstadoFormulario("idle");
      } else {
        setMensajeError(data?.message || "Código no válido");
        setEstadoFormulario("error");
      }
    } catch (err) {
      console.error(err);
      setMensajeError(err.response?.data?.message || "Error al validar código.");
      setEstadoFormulario("error");
    }
  };

  if (!isOpen) return null;

  const modalBg = `linear-gradient(180deg, ${COLOR_DORADO}10, ${COLOR_MARFIL})`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden my-8 border-2"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: modalBg,
          borderColor: COLOR_DORADO,
          boxShadow: "0 20px 50px rgba(10,11,13,0.45)",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5 text-slate-600" />
        </button>

        {/* Línea decorativa superior */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${COLOR_DORADO}, ${COLOR_CORAL})`,
          }}
        />

        {/* Contenido */}
        <div className="p-6 sm:p-8">
          {/* Encabezado */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3" style={{ background: COLOR_DORADO }}>
              <FiCheckCircle className="w-6 h-6 text-[#F8F4E3]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-2">
              Confirma tu asistencia
            </h2>
            <p className="text-sm text-slate-600">
              Ingresa los datos de tu invitación para registrar tu presencia
            </p>
          </div>

          {/* Formulario */}
          {estadoFormulario !== "success" ? (
            <form onSubmit={etapa === "buscar" ? validarCodigoAction : manejadorEnvio} className="space-y-4">
              {/* Código de invitación */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Código de invitación
                </label>
                <input
                  type="text"
                  value={codigoInvitacion}
                  onChange={(e) => setCodigoInvitacion(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC12345"
                  maxLength={16}
                  className="w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm focus:outline-none transition-colors"
                  style={{ borderColor: "#F3E7D0" }}
                  disabled={etapa === "confirmar"}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Aparece en tu invitación o mensaje WhatsApp
                </p>
              </div>
              {/* Si estamos en etapa 'confirmar', mostramos datos encontrados y permitimos editar celular y mensaje. */}
              {etapa === "confirmar" && invitadoEncontrado && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Teléfono registrado (editable)
                    </label>
                    <input
                      type="tel"
                      value={numeroContacto}
                      onChange={(e) => setNumeroContacto(e.target.value)}
                      placeholder="Ej: 987 654 321"
                      className="w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm focus:outline-none transition-colors"
                      style={{ borderColor: "#F3E7D0" }}
                    />
                    <p className="text-xs text-slate-500 mt-1">Se mostrará el número guardado en la invitación, puedes editarlo si corresponde.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Número de pases (no editable)
                    </label>
                    <div className="w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm text-slate-700" style={{ borderColor: "#F3E7D0" }}>
                      {cantidadPersonas} persona(s)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">La cantidad asignada en tu invitación.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={mensajePersonal}
                      onChange={(e) => setMensajePersonal(e.target.value)}
                      placeholder="Ej: Tengo preferencia vegetariana..."
                      maxLength={200}
                      rows={3}
                      className="w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                      style={{ borderColor: "#F3E7D0" }}
                    />
                    <p className="text-xs text-slate-500 mt-1">{mensajePersonal.length}/200</p>
                  </div>
                </>
              )}

              {/* Mensaje de error */}
              {mensajeError && (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 flex gap-2 items-start">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{mensajeError}</p>
                </div>
              )}

              {/* Nota informativa */}
              <div className="rounded-xl p-3" style={{ background: "rgba(244, 236, 223, 0.9)", border: `1px solid ${COLOR_DORADO}` }}>
                <p className="text-xs text-[#1E293B] flex gap-2 items-start">
                  <FiClock className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D4AF37]" />
                  <span>
                    Después de confirmar, recibirás detalles de la boda por
                    WhatsApp.
                  </span>
                </p>
              </div>

              {/* Botón enviar / validar */}
              <button
                type="submit"
                disabled={estadoFormulario === "loading"}
                className="w-full rounded-xl text-white font-semibold py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: etapa === "buscar"
                    ? `linear-gradient(90deg, ${COLOR_DORADO}, ${COLOR_CORAL})`
                    : `linear-gradient(90deg, ${COLOR_CORAL}, ${COLOR_DORADO})`,
                }}
              >
                {estadoFormulario === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {etapa === "buscar" ? "Validando..." : "Confirmando..."}
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    {etapa === "buscar" ? "Validar código" : "Confirmar asistencia"}
                  </>
                )}
              </button>
            </form>
          ) : (
            /* estadoFormulario de éxito */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4" style={{ background: COLOR_DORADO }}>
                <FiCheckCircle className="w-8 h-8 text-[#F8F4E3]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                ¡Confirmación registrada!
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Gracias por tu confirmación. Pronto verás más detalles sobre
                la celebración.
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl text-[#1E293B] font-semibold px-6 py-2.5 transition-colors"
                style={{ background: COLOR_MARFIL, border: `1px solid ${COLOR_DORADO}` }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

