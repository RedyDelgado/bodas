// src/features/faqs/hooks/useBodaFaqs.js
import { useEffect, useState } from "react";
import { getFaqsForBoda } from "../services/faqsBodaApiService";

export function useBodaFaqs(bodaId) {
  const [faqs, setFaqs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    if (!bodaId) return;
    setCargando(true);
    setError("");

    getFaqsForBoda(bodaId)
      .then((data) => {
        if (!cancelado) setFaqs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelado) setError("No se pudieron cargar las FAQs de la boda.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [bodaId]);

  return { faqs, cargando, error };
}

export default useBodaFaqs;
