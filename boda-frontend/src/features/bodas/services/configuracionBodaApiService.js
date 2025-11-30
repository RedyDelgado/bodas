// src/features/bodas/services/configuracionBodaApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Adaptador: configuración_bodas (snake_case) → modelo frontend (camelCase).
 *
 * Campos típicos (según seeder):
 * - id
 * - boda_id
 * - frase_principal
 * - texto_fecha_religioso
 * - texto_fecha_civil
 * - cronograma_texto
 * - local_religioso
 * - local_recepcion
 * - texto_cuentas_bancarias
 * - texto_yape
 * - texto_historia_pareja
 * - texto_mensaje_final
 */
function mapConfigFromApi(cfg) {
  if (!cfg) return null;

  return {
    id: cfg.id,
    bodaId: cfg.boda_id,
    frasePrincipal: cfg.frase_principal ?? "",
    textoFechaReligioso: cfg.texto_fecha_religioso ?? "",
    textoFechaCivil: cfg.texto_fecha_civil ?? "",
    cronogramaTexto: cfg.cronograma_texto ?? "",
    localReligioso: cfg.local_religioso ?? "",
    localRecepcion: cfg.local_recepcion ?? "",
    textoCuentasBancarias: cfg.texto_cuentas_bancarias ?? "",
    textoYape: cfg.texto_yape ?? "",
    textoHistoriaPareja: cfg.texto_historia_pareja ?? "",
    textoMensajeFinal: cfg.texto_mensaje_final ?? "",
  };
}

/**
 * GET /mis-bodas/{boda}/configuracion
 */
export async function getConfigBodaApi(bodaId) {
  const response = await axiosClient.get(`/mis-bodas/${bodaId}/configuracion`);
  const raw = response.data.data || response.data;
  return mapConfigFromApi(raw);
}

/**
 * POST /mis-bodas/{boda}/configuracion  (crear si no existe)
 */
export async function createConfigBodaApi(bodaId, datos) {
  const payload = mapConfigToPayload(bodaId, datos);
  const response = await axiosClient.post(
    `/mis-bodas/${bodaId}/configuracion`,
    payload
  );
  const raw = response.data.data || response.data;
  return mapConfigFromApi(raw);
}

/**
 * PUT /mis-bodas/{boda}/configuracion  (actualizar)
 */
export async function updateConfigBodaApi(bodaId, datos) {
  const payload = mapConfigToPayload(bodaId, datos);
  const response = await axiosClient.put(
    `/mis-bodas/${bodaId}/configuracion`,
    payload
  );
  const raw = response.data.data || response.data;
  return mapConfigFromApi(raw);
}

/**
 * Frontend → payload para Laravel.
 */
function mapConfigToPayload(bodaId, cfg) {
  return {
    boda_id: bodaId,
    frase_principal: cfg.frasePrincipal ?? "",
    texto_fecha_religioso: cfg.textoFechaReligioso ?? "",
    texto_fecha_civil: cfg.textoFechaCivil ?? "",
    cronograma_texto: cfg.cronogramaTexto ?? "",
    local_religioso: cfg.localReligioso ?? "",
    local_recepcion: cfg.localRecepcion ?? "",
    texto_cuentas_bancarias: cfg.textoCuentasBancarias ?? "",
    texto_yape: cfg.textoYape ?? "",
    texto_historia_pareja: cfg.textoHistoriaPareja ?? "",
    texto_mensaje_final: cfg.textoMensajeFinal ?? "",
  };
}
