// src/features/planes/services/planesService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import { getPlanesFake } from "./planesFakeService";
import { getPlanesApi } from "./planesApiService";

/**
 * Punto único de acceso a los planes.
 * Si USE_FAKE_API = true → usa datos fake.
 * Si USE_FAKE_API = false → llama a la API real.
 */
export function obtenerPlanes() {
  if (USE_FAKE_API) {
    return getPlanesFake();
  }
  return getPlanesApi();
}
