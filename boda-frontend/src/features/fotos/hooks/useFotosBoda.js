// src/features/fotos/hooks/useFotosBoda.js
import { useCallback, useEffect, useState } from "react";
import {
  obtenerFotosBoda,
  subirFotoBoda,
  actualizarFoto,
  eliminarFoto,
  marcarFotoComoPortada,
} from "../services/fotosService";

export function useFotosBoda(bodaId) {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    if (!bodaId) return;
    setCargando(true);
    setError("");

    obtenerFotosBoda(bodaId)
      .then((data) => setFotos(data))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la galería de fotos.");
      })
      .finally(() => setCargando(false));
  }, [bodaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const subir = useCallback(
    async (file, meta) => {
      if (!bodaId || !file) return;
      setSubiendo(true);
      setError("");

      try {
        const nueva = await subirFotoBoda(bodaId, file, meta);
        setFotos((prev) => [...prev, nueva]);
      } catch (err) {
        console.error(err);
        setError("Error al subir la foto.");
        throw err;
      } finally {
        setSubiendo(false);
      }
    },
    [bodaId]
  );

  const actualizar = useCallback(async (id, datos) => {
    try {
      const actualizada = await actualizarFoto(id, datos);
      setFotos((prev) => prev.map((f) => (f.id === id ? actualizada : f)));
      return actualizada;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const eliminar = useCallback(async (id) => {
    try {
      await eliminarFoto(id);
      setFotos((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const marcarPortada = useCallback(async (id) => {
    try {
      const portada = await marcarFotoComoPortada(id);
      setFotos((prev) =>
        prev.map((f) => ({
          ...f,
          esPortada: f.id === id,
        }))
      );
      return portada;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  return {
    fotos,
    cargando,
    subiendo,
    error,
    cargar,
    subir,
    actualizar,
    eliminar,
    marcarPortada,
  };
}
