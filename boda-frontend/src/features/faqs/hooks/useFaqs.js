// src/features/faqs/hooks/useFaqs.js
import { useEffect, useState } from "react";
import { obtenerFaqs } from "../services/faqsService";

export function useFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerFaqs()
      .then((data) => {
        if (!cancelado) setFaqs(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado)
          setError("No se pudieron cargar las preguntas frecuentes.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { faqs, cargando, error };
}
