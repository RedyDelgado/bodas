// src/features/bodas/hooks/useBodas.js
import { useEffect, useState } from "react";
import {
  obtenerBodas,
  obtenerBodaPorId,
  obtenerBodaPorSubdominio,
  obtenerMiBodaActual,
} from "../services/bodasService";

/**
 * Hook para SUPERADMIN – listado de todas las bodas.
 */
export function useBodas() {
  const [bodas, setBodas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerBodas()
      .then((data) => {
        if (!cancelado) setBodas(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado) setError("No se pudieron cargar las bodas.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { bodas, cargando, error };
}

/**
 * Hook para obtener una boda por ID (detalle).
 */
export function useBodaById(bodaId) {
  const [boda, setBoda] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bodaId) return;
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerBodaPorId(bodaId)
      .then((data) => {
        if (!cancelado) setBoda(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado) setError("No se pudo cargar la boda.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

  return () => {
      cancelado = true;
    };
  }, [bodaId]);

  return { boda, cargando, error };
}

/**
 * Hook para página pública por subdominio (cuando tengamos la API real).
 */
export function useBodaBySubdominio(subdominio) {
  const [boda, setBoda] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subdominio) return;
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerBodaPorSubdominio(subdominio)
      .then((data) => {
        if (!cancelado) setBoda(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado)
          setError("No se encontró ninguna boda para ese subdominio.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [subdominio]);

  return { boda, cargando, error };
}

/**
 * Hook específico para ADMIN_BODA:
 * obtiene la boda actual del usuario usando /mis-bodas (primera boda).
 */
export function useMiBodaActual() {
  const [boda, setBoda] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerMiBodaActual()
      .then((data) => {
        if (!cancelado) setBoda(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado)
          setError("No se pudo cargar la boda del usuario.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { boda, cargando, error };
}
