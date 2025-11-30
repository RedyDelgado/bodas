// src/features/plantillas/services/plantillasApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Servicio REAL de plantillas.
 * Ruta pública:
 *   GET /public/plantillas
 */
export async function getPlantillasApi() {
  const response = await axiosClient.get("/public/plantillas");
  return response.data.data || response.data;
}
