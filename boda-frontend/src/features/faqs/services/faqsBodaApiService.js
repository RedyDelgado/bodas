// src/features/faqs/services/faqsBodaApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Obtener FAQs específicas de una boda (tabla faqs_boda)
 * GET /bodas/{bodaId}/faqs
 */
export async function getFaqsForBoda(bodaId) {
  if (!bodaId) return [];
  const response = await axiosClient.get(`/public/bodas/${bodaId}/faqs`);
  return Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];
}

export default { getFaqsForBoda };
