// src/features/bodas/services/configuracionBodaService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import {
  getConfigBodaApi,
  createConfigBodaApi,
  updateConfigBodaApi,
} from "./configuracionBodaApiService";

// si quisieras FAKE en el futuro, aquí irían las funciones fake.
const getConfigBodaFake = async () => null;
const saveConfigBodaFake = async (_, datos) => datos;

/**
 * Obtiene la configuración de una boda.
 */
export function obtenerConfigBoda(bodaId) {
  if (!bodaId) return Promise.resolve(null);
  if (USE_FAKE_API) return getConfigBodaFake(bodaId);
  return getConfigBodaApi(bodaId);
}

/**
 * Crea o actualiza según exista o no config.id
 */
export async function guardarConfigBoda(bodaId, config) {
  if (!bodaId) throw new Error("Se requiere el ID de la boda.");

  if (USE_FAKE_API) return saveConfigBodaFake(bodaId, config);

  if (config && config.id) {
    return updateConfigBodaApi(bodaId, config);
  }
  return createConfigBodaApi(bodaId, config);
}
