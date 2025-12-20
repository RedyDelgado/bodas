// src/features/bodas/components/DomainManagementModal.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiX, FiCheckCircle, FiAlertCircle, FiGlobe } from "react-icons/fi";
import {
  setDomainPropio,
  removeDomainPropio,
  verifyDomainPropio,
  checkDomainAvailability,
} from "../services/domainService";

export function DomainManagementModal({ boda, isOpen, onClose, onSuccess }) {
  const [dominio, setDominio] = useState("");
  const [modo, setModo] = useState("info"); // info | editar | verificando
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Estado de verificación DNS
  const [verificando, setVerificando] = useState(false);
  const [verificacionOk, setVerificacionOk] = useState(null);

  useEffect(() => {
    if (isOpen && boda) {
      setDominio(boda.dominio_personalizado || "");
      setModo(boda.dominio_personalizado ? "info" : "editar");
      setMensaje("");
      setError("");
      setVerificacionOk(null);
    }
  }, [isOpen, boda]);

  if (!isOpen) return null;

  const handleGuardar = async () => {
    if (!dominio.trim()) {
      setError("Por favor ingresa un dominio válido.");
      return;
    }

    setCargando(true);
    setError("");
    setMensaje("");

    try {
      // Primero validar disponibilidad
      const availability = await checkDomainAvailability(dominio, boda.id);
      if (!availability.disponible) {
        setError("Este dominio ya está en uso por otra boda.");
        setCargando(false);
        return;
      }

      // Guardar dominio (sin verificar todavía)
      const result = await setDomainPropio(boda.id, dominio, false);
      setMensaje(result.message || "Dominio guardado correctamente.");
      setModo("info");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al guardar el dominio."
      );
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm("¿Eliminar el dominio personalizado y volver a usar el subdominio?")) {
      return;
    }

    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const result = await removeDomainPropio(boda.id);
      setMensaje(result.message || "Dominio eliminado.");
      setDominio("");
      setModo("editar");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al eliminar el dominio."
      );
    } finally {
      setCargando(false);
    }
  };

  const handleVerificar = async () => {
    setVerificando(true);
    setError("");
    setMensaje("");
    setVerificacionOk(null);

    try {
      const result = await verifyDomainPropio(boda.id);
      if (result.verificado) {
        setVerificacionOk(true);
        setMensaje(result.message || "¡Dominio verificado correctamente!");
        if (onSuccess) onSuccess();
      } else {
        setVerificacionOk(false);
        setError(result.message || "No se pudo verificar el dominio.");
      }
    } catch (err) {
      setVerificacionOk(false);
      setError(
        err.response?.data?.message ||
          err.response?.data?.details?.error ||
          "Error al verificar el dominio."
      );
    } finally {
      setVerificando(false);
    }
  };

  if (!isOpen) return null;

  const dominioActual = boda?.dominio_personalizado;
  const verificado = boda?.dominio_verificado_at !== null;
  const baseDomain = "miwebdebodas.test"; // Cambiar por tu dominio real

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 my-8 relative"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FiGlobe className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">
              Configuración de Dominio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiX className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info actual */}
          {modo === "info" && dominioActual && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Dominio actual:</p>
                <p className="text-sm font-semibold text-slate-900">
                  {dominioActual}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {verificado ? (
                  <>
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700">
                      Verificado correctamente
                    </span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700">
                      Pendiente de verificación
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setModo("editar")}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-50"
                >
                  Editar
                </button>
                <button
                  onClick={handleEliminar}
                  disabled={cargando}
                  className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {cargando ? "Eliminando..." : "Eliminar"}
                </button>
                {!verificado && (
                  <button
                    onClick={handleVerificar}
                    disabled={verificando}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {verificando ? "Verificando..." : "Verificar DNS"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Formulario de edición */}
          {modo === "editar" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tu dominio personalizado
                </label>
                <input
                  type="text"
                  value={dominio}
                  onChange={(e) => setDominio(e.target.value)}
                  placeholder="redyypatricia.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Solo el dominio, sin http:// ni www
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGuardar}
                  disabled={cargando}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {cargando ? "Guardando..." : "Guardar"}
                </button>
                {dominioActual && (
                  <button
                    onClick={() => setModo("info")}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Instrucciones DNS */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-900">
              📋 Cómo conectar tu dominio (Paso a paso)
            </p>
            <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside pl-1">
              <li>
                <strong>Entra al panel de tu dominio</strong> (GoDaddy, Namecheap, Hostinger, etc.)
              </li>
              <li>
                <strong>Busca la sección "DNS" o "Gestión de DNS"</strong>
              </li>
              <li>
                <strong>Agrega un nuevo registro tipo "A" con estos valores:</strong>
                <div className="mt-1.5 ml-4 space-y-1 bg-white border border-blue-200 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium min-w-[60px]">Tipo:</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900">A</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium min-w-[60px]">Host:</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900">@</code>
                    <span className="text-blue-600 text-[10px]">(o dejar vacío)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium min-w-[60px]">Apunta a:</span>
                    <code className="bg-green-100 px-2 py-0.5 rounded text-green-900 font-semibold">161.97.169.31</code>
                    <span className="text-blue-600 text-[10px]">(IP de nuestro servidor)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium min-w-[60px]">TTL:</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900">3600</code>
                    <span className="text-blue-600 text-[10px]">(1 hora)</span>
                  </div>
                </div>
              </li>
              <li>
                <strong>Guarda los cambios</strong> en tu proveedor de dominio
              </li>
              <li>
                <strong>Regresa a este modal</strong>, ingresa tu dominio arriba ⬆️ y guárdalo
              </li>
              <li>
                <strong>Espera 5-15 minutos</strong> (el DNS tarda en propagarse por internet)
              </li>
              <li>
                <strong>Haz clic en el botón "Verificar DNS"</strong> que aparecerá en este modal
              </li>
            </ol>
            
            <div className="pt-2 border-t border-blue-200 space-y-2">
              <p className="text-xs font-medium text-blue-900">
                💡 ¿Necesitas ayuda o tienes dudas?
              </p>
              <a 
                href="mailto:redy.delgado@gmail.com?subject=Ayuda con configuración de dominio personalizado&body=Hola, necesito ayuda para configurar mi dominio personalizado. Mi dominio es: [ESCRIBE TU DOMINIO AQUÍ]"
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline"
              >
                📧 Escríbenos a redy.delgado@gmail.com
              </a>
              <p className="text-xs text-blue-700">
                Te ayudamos con todo el proceso completamente gratis. ¡Respuesta en menos de 24 horas! ⚡
              </p>
            </div>
          </div>

          {/* Sección de donación */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-rose-900">
              ❤️ Apoya esta plataforma
            </p>
            <p className="text-xs text-rose-800 leading-relaxed">
              Esta plataforma es gratuita y se mantiene gracias al apoyo de parejas como tú. 
              Con una donación de <strong>$1 USD (o más si deseas)</strong> nos ayudas a mantenerla 
              en línea y seguir ayudando a más parejas a celebrar su amor.
            </p>
            <a
              href="https://www.paypal.com/invoice/u/4TMAF3X2DP4YE5M88" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              💝 Donar (desde $1 USD)
            </a>
            <p className="text-xs text-rose-600">
              ¡Cada donación cuenta! Gracias por tu apoyo. 🙏
            </p>
          </div>

          {/* Subdominio alternativo */}
          {!dominioActual && boda?.subdominio && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">
                Tu subdominio gratuito:
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {boda.subdominio}.{baseDomain}
              </p>
            </div>
          )}

          {/* Mensajes */}
          {mensaje && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {verificacionOk === true && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                ¡Dominio verificado! Ya puedes usarlo.
              </span>
            </div>
          )}
          {verificacionOk === false && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <FiAlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Verifica que el registro DNS A esté correcto.
              </span>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );

  // Renderizar en un portal fuera del layout
  return ReactDOM.createPortal(modalContent, document.body);
}
