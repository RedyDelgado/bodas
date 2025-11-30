// src/features/plantillas/hooks/usePlantillas.js
import { useEffect, useState } from "react";
import { obtenerPlantillas } from "../services/plantillasService";

export function usePlantillas() {
  const [plantillas, setPlantillas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerPlantillas()
      .then((data) => {
        if (!cancelado) setPlantillas(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado)
          setError("No se pudieron cargar las plantillas.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { plantillas, cargando, error };
}
