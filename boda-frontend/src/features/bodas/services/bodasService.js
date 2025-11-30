// src/features/bodas/services/bodasService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import {
  getBodasFake,
  getBodaByIdFake,
  getBodaBySubdominioFake,
} from "./bodasFakeService";
import {
  getBodasApi,
  getBodaByIdApi,
  getMisBodasApi,
  getMiBodaApi,
  getResumenMiBodaApi,
} from "./bodasApiService";

export function obtenerBodas() {
  if (USE_FAKE_API) return getBodasFake();
  return getBodasApi();
}

export function obtenerBodaPorId(id) {
  if (USE_FAKE_API) return getBodaByIdFake(id);
  return getBodaByIdApi(id);
}

export function obtenerBodaPorSubdominio(subdominio) {
  if (USE_FAKE_API) {
    return getBodaBySubdominioFake(subdominio);
  }
  return Promise.reject(
    new Error("obtenerBodaPorSubdominio aún no está implementado en la API real")
  );
}

/**
 * Mis bodas (admin_boda).
 */
export function obtenerMisBodas() {
  if (USE_FAKE_API) return getBodasFake();
  return getMisBodasApi();
}

/**
 * MI boda actual (admin_boda).
 * Convención: tomamos la primera de /mis-bodas.
 */
export async function obtenerMiBodaActual() {
  if (USE_FAKE_API) {
    const bodas = await getBodasFake();
    return bodas[0] ?? null;
  }
  const misBodas = await getMisBodasApi();
  return Array.isArray(misBodas) && misBodas.length > 0 ? misBodas[0] : null;
}

export function obtenerMiBoda(id) {
  if (USE_FAKE_API) return getBodaByIdFake(id);
  return getMiBodaApi(id);
}

export function obtenerResumenMiBoda(id) {
  if (USE_FAKE_API) {
    return Promise.resolve(null);
  }
  return getResumenMiBodaApi(id);
}
