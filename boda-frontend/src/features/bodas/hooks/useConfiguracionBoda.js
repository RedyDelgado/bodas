// src/features/bodas/hooks/useConfiguracionBoda.js
import { useCallback, useEffect, useState } from "react";
import {
  obtenerConfigBoda,
  guardarConfigBoda,
} from "../services/configuracionBodaService";

/**
 * Hook para leer / guardar configuración de la boda propia.
 *
 * Recibe bodaId (desde useMiBodaActual).
 */
export function useConfiguracionBoda(bodaId) {
  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  const cargar = useCallback(() => {
    if (!bodaId) return;
    setCargando(true);
    setError("");
    setMensajeOk("");

    obtenerConfigBoda(bodaId)
      .then((data) => setConfig(data))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la configuración de la boda.");
      })
      .finally(() => setCargando(false));
  }, [bodaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = useCallback(
    async (datos) => {
      if (!bodaId) return;
      try {
        setGuardando(true);
        setError("");
        setMensajeOk("");
        const saved = await guardarConfigBoda(bodaId, datos);
        setConfig(saved);
        setMensajeOk("Configuración guardada correctamente.");
        return saved;
      } catch (err) {
        console.error(err);
        setError("Error al guardar la configuración.");
        throw err;
      } finally {
        setGuardando(false);
      }
    },
    [bodaId]
  );

  return { config, cargando, guardando, error, mensajeOk, cargar, guardar };
}
