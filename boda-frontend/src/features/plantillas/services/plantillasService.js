// src/features/plantillas/services/plantillasService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import { getPlantillasFake } from "./plantillasFakeService";
import { getPlantillasApi } from "./plantillasApiService";

export function obtenerPlantillas() {
  if (USE_FAKE_API) {
    return getPlantillasFake();
  }
  return getPlantillasApi();
}
