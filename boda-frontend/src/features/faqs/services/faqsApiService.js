// src/features/faqs/services/faqsApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Servicio REAL de FAQs de plataforma.
 * Ruta pública:
 *   GET /public/faqs
 */
export async function getFaqsApi() {
  const response = await axiosClient.get("/public/faqs");
  const payload = response.data?.data ?? response.data;
  if (Array.isArray(payload)) return payload;
  console.warn("Respuesta inesperada en getFaqsApi", payload);
  return [];
}
