// src/features/planes/services/planesApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Servicio REAL de planes.
 * Usamos la ruta pública para la landing:
 *   GET /public/planes
 */
export async function getPlanesApi() {
  const response = await axiosClient.get("/public/planes");
  const payload = response.data?.data ?? response.data;
  if (Array.isArray(payload)) return payload;
  console.warn("Respuesta inesperada en getPlanesApi", payload);
  return [];
}
