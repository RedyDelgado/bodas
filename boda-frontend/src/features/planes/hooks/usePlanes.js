// src/features/planes/hooks/usePlanes.js
import { useEffect, useState } from "react";
import { obtenerPlanes } from "../services/planesService";

/**
 * Hook de negocio para obtener la lista de planes.
 * Internamente usa FAKE o API real según VITE_USE_FAKE.
 */
export function usePlanes() {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerPlanes()
      .then((data) => {
        if (!cancelado) setPlanes(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado) setError("No se pudieron cargar los planes.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { planes, cargando, error };
}
