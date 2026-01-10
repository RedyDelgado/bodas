// src/features/public/components/RsvpModal.jsx
import React, { useState } from "react";
import { FiX, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { registrarRsvp, validarCodigo } from "../services/publicRsvpService";
import { ConfirmationSuccess } from "./ConfirmationSuccess";
import { ConfirmationDialog } from "./ConfirmationDialog";

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
  // Etapas: 'buscar' (solo código) | 'confirmar' (mostrar datos y confirmar) | 'opciones' (elegir si asiste o no)
  const [etapa, setEtapa] = useState("buscar");

  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [mensajePersonal, setMensajePersonal] = useState("");
  const [numeroContacto, setNumeroContacto] = useState("");
  const [estadoFormulario, setEstadoFormulario] = useState("idle"); // idle | loading | success | error
  const [mensajeError, setMensajeError] = useState("");
  const [invitadoEncontrado, setInvitadoEncontrado] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [deadlineMessage, setDeadlineMessage] = useState(
    "Puedes confirmar hasta 10 días antes del evento."
  );
  const [deadlineLabel, setDeadlineLabel] = useState("");
  
  // Estados para modal de confirmación de rechazo
  const [mostrarConfirmacionRechazo, setMostrarConfirmacionRechazo] = useState(false);
  const [estaEnviandoRechazo, setEstaEnviandoRechazo] = useState(false);
  const [tipoRespuesta, setTipoRespuesta] = useState(null); // 'confirmado' | 'rechazado'

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

    if (etapa === "confirmar" && isClosed) {
      setEstadoFormulario("error");
      setMensajeError(
        deadlineMessage || "Solo se puede confirmar hasta 10 días antes del evento para garantizar los espacios y platos."
      );
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

      // mostrar pantalla de éxito (usamos ConfirmationSuccess)
      setTipoRespuesta('confirmado');
      setEstadoFormulario("success");
      setInvitadoEncontrado(respuesta?.invitado || invitadoEncontrado);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess({
            nombre: respuesta?.invitado?.nombre_invitado || "Invitado",
            cantidad: respuesta?.invitado?.pases || cantidadPersonas,
          });
        }, 600);
      }
    } catch (error) {
      console.error("Error en confirmación:", error);
      setEstadoFormulario("error");
      if (error.response?.status === 404) {
        setMensajeError("No encontramos tu invitación. Verifica el código.");
      } else if (error.response?.status === 422) {
        const errores = error.response?.data?.errors;
        const primerError = errores ? Object.values(errores)[0] : null;
        setIsClosed(Boolean(error.response?.data?.is_closed));
        const mensajeApi = error.response?.data?.message;
        setMensajeError(
          Array.isArray(primerError)
            ? primerError[0]
            : mensajeApi || primerError || "Datos inválidos."
        );
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
      const data = await validarCodigo(codigoInvitacion.trim().toUpperCase());

      const fechaLimite = data?.deadline_formatted || "";
      const mensajeLimite =
        data?.mensaje_deadline ||
        (fechaLimite
          ? `Puedes confirmar hasta el ${fechaLimite} (10 días antes del evento).`
          : "Puedes confirmar hasta 10 días antes del evento.");

      setDeadlineLabel(fechaLimite);
      setDeadlineMessage(mensajeLimite);
      setIsClosed(Boolean(data?.is_closed));

      if (data?.ok && data?.invitado) {
        const inv = data.invitado;
        setInvitadoEncontrado(inv);
        setCantidadPersonas(inv.pases || 1);
        setNumeroContacto(inv.celular || "");

        // Si ya está confirmado, notificar al padre para mostrar la celebración
        if (inv.es_confirmado === 1) {
          setEstadoFormulario("success");
          if (onSuccess) {
            // Enviar datos similares a los que se envían tras confirmar
            onSuccess({ nombre: inv.nombre_invitado, cantidad: inv.pases || 1 });
          }
          return;
        } else {
          setEtapa("confirmar");
          setEstadoFormulario("idle");
        }
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

  // Mostrar confirmación para rechazar invitación
  const mostrarConfirmacionRechazarInvitacion = () => {
    setMostrarConfirmacionRechazo(true);
  };

  // Confirmar que desea rechazar
  const confirmarRechazo = async () => {
    setEstaEnviandoRechazo(true);
    setMensajeError("");

    try {
      const cargaUtilidad = {
        codigo: codigoInvitacion.trim().toUpperCase(),
        respuesta: "rechazado",
      };

      // Solo agregar campos opcionales si tienen valor
      if (mensajePersonal.trim()) {
        cargaUtilidad.mensaje = mensajePersonal.trim();
      }
      
      if (numeroContacto.trim()) {
        cargaUtilidad.celular = numeroContacto.trim();
      }

      const respuesta = await registrarRsvp(cargaUtilidad);
      
      // Primero cerrar el modal de confirmación
      setMostrarConfirmacionRechazo(false);
      setEstaEnviandoRechazo(false);
      
      // Luego establecer el tipo de respuesta y el invitado
      setInvitadoEncontrado(respuesta?.invitado || invitadoEncontrado);
      setTipoRespuesta('rechazado');
      
      // Finalmente cambiar a estado de éxito (esto renderizará el mensaje correcto)
      setEstadoFormulario("success");

      // NO ejecutar onSuccess cuando rechaza, solo cuando confirma
    } catch (error) {
      console.error("Error al rechazar:", error);
      setMensajeError(
        error.response?.data?.message || error.response?.data?.errors?.codigo?.[0] || "No se pudo registrar el rechazo. Intenta más tarde."
      );
      setEstaEnviandoRechazo(false);
      setMostrarConfirmacionRechazo(false);
    }
  };

  // Cancelar rechazo
  const cancelarRechazo = () => {
    setMostrarConfirmacionRechazo(false);
  };

  // Usamos el mismo fondo oscuro y tarjeta que ConfirmationSuccess para mantener coherencia visual
  const modalBg = undefined;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-4 overflow-y-auto"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <div className="relative z-10 max-w-2xl w-full mx-auto">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-black/95 border border-yellow-500/40 rounded-3xl shadow-2xl overflow-hidden">
            {/* Línea decorativa superior */}
            <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <div className="p-6 sm:p-8">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5 text-slate-600" />
        </button>

            {/* Contenido (migrado dentro de la tarjeta para mantener estilo) */}
            
          {/* Encabezado */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3" style={{ background: COLOR_DORADO }}>
              <FiCheckCircle className="w-6 h-6 text-[#F8F4E3]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-white mb-2">
              Confirma tu asistencia
            </h2>
            <p className="text-sm text-slate-200">
              Ingresa los datos de tu invitación para registrar tu presencia
            </p>
          </div>

          {/* Formulario */}
          {estadoFormulario !== "success" ? (
            <form onSubmit={etapa === "buscar" ? validarCodigoAction : manejadorEnvio} className="space-y-4">
              {/* Código de invitación */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
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
                <p className="text-xs text-slate-300 mt-1">
                  Aparece en tu invitación o mensaje WhatsApp
                </p>
              </div>
              {/* Si estamos en etapa 'confirmar', mostramos datos encontrados y permitimos editar celular y mensaje. */}
              {etapa === "confirmar" && invitadoEncontrado && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
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
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                      Número de pases (no editable)
                    </label>
                    <div className="w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm text-slate-700" style={{ borderColor: "#F3E7D0" }}>
                      {cantidadPersonas} persona(s)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">La cantidad asignada en tu invitación.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
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
              <div className="bg-white/5 border border-yellow-500/20 rounded-2xl p-2 sm:p-3 mb-4 backdrop-blur-sm">
                <p className="text-xs text-slate-200 flex gap-2 items-start">
                  <FiClock className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#D4AF37]" />
                  <span>
                    Después de confirmar, recibirás detalles de la boda por
                    WhatsApp.
                  </span>
                </p>
              </div>

              {deadlineMessage && (
                <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2 sm:p-3 mb-4 backdrop-blur-sm">
                  <p className="text-xs text-amber-100 flex gap-2 items-start">
                    <FiClock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      {deadlineMessage}
                      {isClosed ? " (plazo cerrado)" : ""}
                      {deadlineLabel
                        ? ` | Fecha límite: ${deadlineLabel}`
                        : ""}
                    </span>
                  </p>
                </div>
              )}

              {/* Botón enviar / validar */}
              <button
                type="submit"
                disabled={
                  estadoFormulario === "loading" || (etapa === "confirmar" && isClosed)
                }
                 className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
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

              {/* Botón rechazar - solo en etapa confirmar */}
              {etapa === "confirmar" && (
                <button
                  type="button"
                  onClick={mostrarConfirmacionRechazarInvitacion}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all mt-3"
                >
                  ✗ No podré asistir
                </button>
              )}
            </form>
          ) : (
            /* estadoFormulario de éxito: diferentes mensajes según confirmó o rechazó */
            tipoRespuesta === 'rechazado' ? (
              /* Mensaje amigable para quien no puede asistir */
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-700/50 mb-3">
                  <span className="text-3xl">💙</span>
                </div>
                <h3 className="text-2xl font-serif text-white mb-3">
                  ¡Gracias por avisarnos!
                </h3>
                <p className="text-slate-200 leading-relaxed mb-4">
                  Lamentamos que {invitadoEncontrado?.nombre_invitado || 'tú'} no pueda{invitadoEncontrado?.nombre_invitado ? '' : 's'} acompañarnos en este día especial.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Aunque no estarás físicamente, tu cariño y buenos deseos nos acompañarán. 
                  ¡Esperamos compartir contigo en futuras ocasiones!
                </p>
                <button
                  onClick={() => {
                    setCodigoInvitacion("");
                    setCantidadPersonas(1);
                    setMensajePersonal("");
                    setNumeroContacto("");
                    setInvitadoEncontrado(null);
                    setEtapa("buscar");
                    setEstadoFormulario("idle");
                    setTipoRespuesta(null);
                    if (onClose) onClose();
                  }}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              /* Mensaje de éxito para quien confirmó */
              <ConfirmationSuccess
                nombreInvitado={invitadoEncontrado?.nombre_invitado}
                cantidadPersonas={invitadoEncontrado?.pases || cantidadPersonas}
                invitado={invitadoEncontrado}
                onClose={() => {
                  setCodigoInvitacion("");
                  setCantidadPersonas(1);
                  setMensajePersonal("");
                  setNumeroContacto("");
                  setInvitadoEncontrado(null);
                  setEtapa("buscar");
                  setEstadoFormulario("idle");
                  setTipoRespuesta(null);
                  if (onClose) onClose();
                }}
              />
            )
          )}
        </div>
      </div>

      {/* Modal de confirmación para rechazar invitación */}
      <ConfirmationDialog
        isOpen={mostrarConfirmacionRechazo}
        title="¿Seguro que no asistirás?"
        message="Esta acción registrará que no asistirás a la boda. ¿Deseas continuar? Si cambias de opinión, puedes contactar con los organizadores."
        confirmText="Sí, no asistiré"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={confirmarRechazo}
        onCancel={cancelarRechazo}
        isLoading={estaEnviandoRechazo}
      />
    </div>
    </div>
    </div>
  );
}

