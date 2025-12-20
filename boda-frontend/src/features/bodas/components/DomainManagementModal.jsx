// src/features/bodas/components/DomainManagementModal.jsx
import React, { useState, useEffect } from "react";
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

  const dominioActual = boda?.dominio_personalizado;
  const verificado = boda?.dominio_verificado_at !== null;
  const baseDomain = "miwebdebodas.test"; // Cambiar por tu dominio real

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-900">
              Instrucciones de configuración DNS
            </p>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Ve al panel de tu proveedor de dominio (GoDaddy, Namecheap, etc.)</li>
              <li>Crea un registro A que apunte a la IP de nuestro servidor</li>
              <li>Guarda el dominio aquí y haz clic en "Verificar DNS"</li>
              <li>Una vez verificado, tu página será accesible desde tu dominio</li>
            </ol>
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
  );
}
