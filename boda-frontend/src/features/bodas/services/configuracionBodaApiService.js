// boda-frontend/src/features/bodas/services/configuracionBodaApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * API ↔ Frontend adapter para ConfiguracionBoda.
 */

/**
 * API (snake_case) → Frontend (camelCase)
 */
function mapConfigFromApi(cfg) {
  if (!cfg) return null;

  return {
    id: cfg.id,
    bodaId: cfg.boda_id,

    // Portada / fechas
    frasePrincipal: cfg.frase_principal ?? "",
    textoFechaReligioso: cfg.texto_fecha_religioso ?? "",
    textoFechaCivil: cfg.texto_fecha_civil ?? "",

    // Cronograma
    cronogramaTexto: cfg.cronograma_texto ?? "",

    // Locales
    localReligioso: cfg.local_religioso ?? "",
    localRecepcion: cfg.local_recepcion ?? "",

    // Padres y padrinos
    textoPadresNovio: cfg.texto_padres_novio ?? "",
    textoPadresNovia: cfg.texto_padres_novia ?? "",
    textoPadrinosMayores: cfg.texto_padrinos_mayores ?? "",
    textoPadrinosCiviles: cfg.texto_padrinos_civiles ?? "",

    // Regalos / cuentas
    textoCuentasBancarias: cfg.texto_cuentas_bancarias ?? "",
    textoYape: cfg.texto_yape ?? "",

    // Historia / mensaje final
    textoHistoriaPareja: cfg.texto_historia_pareja ?? "",
    textoMensajeFinal: cfg.texto_mensaje_final ?? "",

    // Intro FAQs (si existe en BD)
    textoPreguntasFrecuentes: cfg.texto_preguntas_frecuentes ?? "",
  };
}

/**
 * Frontend (camelCase o snake_case) → API (snake_case)
 *
 * Soporta:
 *  - cfg.frasePrincipal      (camel)
 *  - cfg.frase_principal     (snake)
 *  ... igual para el resto.
 */
function mapConfigToPayload(bodaId, datos = {}) {
  // datos ya viene en snake_case desde el formulario
  return {
    ...datos,
    boda_id: bodaId,
  };
}

/**
 * GET /mis-bodas/{boda}/configuracion
 */
export async function getConfigBodaApi(bodaId) {
  const response = await axiosClient.get(`/mis-bodas/${bodaId}/configuracion`);
  const raw = response.data?.data ?? response.data;
  return mapConfigFromApi(raw);
}


/**
 * POST /mis-bodas/{boda}/configuracion
 */
export async function createConfigBodaApi(bodaId, datos) {
  const payload = mapConfigToPayload(bodaId, datos);
  const response = await axiosClient.post(
    `/mis-bodas/${bodaId}/configuracion`,
    payload
  );
  const raw = response.data?.data ?? response.data;
  return mapConfigFromApi(raw);
}

/**
 * PUT /mis-bodas/{boda}/configuracion
 */
export async function updateConfigBodaApi(bodaId, datos) {
  const payload = mapConfigToPayload(bodaId, datos);
  const response = await axiosClient.put(
    `/mis-bodas/${bodaId}/configuracion`,
    payload
  );
  const raw = response.data?.data ?? response.data;
  return mapConfigFromApi(raw);
}
