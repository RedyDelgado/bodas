// src/features/planes/services/planesApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Servicio REAL de planes.
 * Usamos la ruta pública para la landing:
 *   GET /public/planes
 */
export async function getPlanesApi() {
  const response = await axiosClient.get("/public/planes");
  // Ajusta según devuelva tu controlador (data o data.data)
  return response.data.data || response.data;
}
