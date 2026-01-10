// src/features/invitados/hooks/useInvitados.js
import { useEffect, useState, useCallback } from "react";
import {
  obtenerInvitadosPorBoda,
  actualizarInvitado,
  confirmarInvitado,
  marcarNoAsistira,
  eliminarInvitado,
} from "../services/invitadosService";

/**
 * Hook de negocio para trabajar con invitados de una boda.
 *
 * Recibe el `bodaId`. Si es null/undefined, no hace request.
 */
export function useInvitados(bodaId) {
  const [invitados, setInvitados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarInvitados = useCallback(() => {
    if (!bodaId) {
      setInvitados([]);
      return;
    }

    setCargando(true);
    setError("");

    obtenerInvitadosPorBoda(bodaId)
      .then((data) => {
        setInvitados(data);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la lista de invitados.");
      })
      .finally(() => {
        setCargando(false);
      });
  }, [bodaId]);

  useEffect(() => {
    cargarInvitados();
  }, [cargarInvitados]);

  /**
   * Actualiza un invitado y refresca la lista en memoria.
   */
  const guardarInvitado = useCallback(async (id, datos) => {
    try {
      const actualizado = await actualizarInvitado(id, datos);
      setInvitados((prev) =>
        prev.map((inv) => (inv.id === id ? actualizado : inv))
      );
      return actualizado;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  /**
   * Marca un invitado como confirmado usando la API.
   */
  const confirmar = useCallback(async (id) => {
    try {
      const confirmado = await confirmarInvitado(id);
      setInvitados((prev) =>
        prev.map((inv) => (inv.id === id ? confirmado : inv))
      );
      return confirmado;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  /**
   * Marca "no asistirá" y actualiza estado en memoria.
   */
  const noAsistira = useCallback(async (id) => {
    try {
      const actualizado = await marcarNoAsistira(id);
      setInvitados((prev) =>
        prev.map((inv) => (inv.id === id ? actualizado : inv))
      );
      return actualizado;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  /**
   * Revertir a pendiente mediante actualización genérica.
   */
  const revertirPendiente = useCallback(async (id) => {
    try {
      const actualizado = await actualizarInvitado(id, { estadoConfirmacion: "pendiente" });
      setInvitados((prev) =>
        prev.map((inv) => (inv.id === id ? actualizado : inv))
      );
      return actualizado;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  /**
   * Eliminar invitado de la lista.
   */
  const eliminar = useCallback(async (id) => {
    try {
      await eliminarInvitado(id);
      setInvitados((prev) => prev.filter((inv) => inv.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  return {
    invitados,
    cargando,
    error,
    recargar: cargarInvitados,
    guardarInvitado,
    confirmar,
    noAsistira,
    revertirPendiente,
    eliminar,
  };
}
