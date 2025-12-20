// src/features/plantillas/services/plantillasApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Servicio REAL de plantillas.
 * Ruta pública:
 *   GET /public/plantillas
 */
export async function getPlantillasApi() {
  const response = await axiosClient.get("/public/plantillas");
  const payload = response.data?.data ?? response.data;
  if (Array.isArray(payload)) return payload;
  console.warn("Respuesta inesperada en getPlantillasApi", payload);
  return [];
}
