// src/features/bodas/services/bodasApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Adaptador: convierte el objeto boda que viene de Laravel (snake_case)
 * al modelo que usa el frontend (camelCase).
 */
function mapBodaFromApi(b) {
  if (!b) return null;

  const cfg = b.configuracion || {};

  const tituloBase =
    b.nombre_pareja ??
    (b.nombre_novio_1 && b.nombre_novio_2
      ? `${b.nombre_novio_1} & ${b.nombre_novio_2}`
      : b.nombre_novio_1 ??
        b.nombre_novio_2 ??
        b.subdominio ??
        `Boda #${b.id}`);

  return {
    id: b.id,
    titulo: tituloBase,

    // Campos snake originales (compatibilidad con componentes existentes)
    nombre_pareja: b.nombre_pareja ?? null,
    nombre_novio_1: b.nombre_novio_1 ?? null,
    nombre_novio_2: b.nombre_novio_2 ?? null,
    fecha_boda: b.fecha_boda ?? null,
    ciudad: b.ciudad ?? "",
    subdominio: b.subdominio ?? "",
    dominio_personalizado: b.dominio_personalizado ?? null,
    url_publica_cache: b.url_publica_cache ?? null,

    // Campos camelCase
    nombrePareja: b.nombre_pareja ?? null,
    nombreNovio1: b.nombre_novio_1 ?? null,
    nombreNovio2: b.nombre_novio_2 ?? null,
    correoContacto: b.correo_contacto ?? null,
    fechaBoda: b.fecha_boda ?? null,
    ciudad: b.ciudad ?? "",
    pais: b.pais ?? "", // si luego añades campo país
    subdominio: b.subdominio ?? "",
    dominioPersonalizado: b.dominio_personalizado ?? null,
    urlPublicaCache: b.url_publica_cache ?? null,
    estado: b.estado ?? "borrador",
    totalInvitados: b.total_invitados ?? 0,
    totalConfirmados: b.total_confirmados ?? 0,
    totalVistas: b.total_vistas ?? 0,
    planId: b.plan_id ?? null,
    plantillaId: b.plantilla_id ?? null,
    fechaPublicacion: b.fecha_publicacion ?? null,

    // Configuración (snake + camel para campos clave del PDF)
    configuracion: cfg,
    frase_principal: cfg.frase_principal ?? null,
    texto_fecha_religioso: cfg.texto_fecha_religioso ?? null,
    texto_fecha_civil: cfg.texto_fecha_civil ?? null,
    texto_padres_novio: cfg.texto_padres_novio ?? null,
    texto_padres_novia: cfg.texto_padres_novia ?? null,
    texto_padrinos_mayores: cfg.texto_padrinos_mayores ?? null,
    texto_padrinos_civiles: cfg.texto_padrinos_civiles ?? null,
    cronograma_texto: cfg.cronograma_texto ?? null,
    local_religioso: cfg.local_religioso ?? null,
    local_recepcion: cfg.local_recepcion ?? null,
    ceremonia_maps_url: cfg.ceremonia_maps_url ?? null,
    recepcion_maps_url: cfg.recepcion_maps_url ?? null,
    texto_cuentas_bancarias: cfg.texto_cuentas_bancarias ?? null,
    texto_yape: cfg.texto_yape ?? null,
    texto_historia_pareja: cfg.texto_historia_pareja ?? null,
    texto_mensaje_final: cfg.texto_mensaje_final ?? null,
    texto_preguntas_frecuentes: cfg.texto_preguntas_frecuentes ?? null,

    frasePrincipal: cfg.frase_principal ?? null,
    fechaReligioso: cfg.texto_fecha_religioso ?? null,
    fechaCivil: cfg.texto_fecha_civil ?? null,
    padresNovio: cfg.texto_padres_novio ?? null,
    padresNovia: cfg.texto_padres_novia ?? null,
    padrinosReligiosos: cfg.texto_padrinos_mayores ?? null,
    padrinosCiviles: cfg.texto_padrinos_civiles ?? null,
    cronogramaTexto: cfg.cronograma_texto ?? null,
    localReligioso: cfg.local_religioso ?? null,
    localRecepcion: cfg.local_recepcion ?? null,
  };
}

/**
 * SUPERADMIN – listado global de bodas:
 *   GET /bodas
 */
export async function getBodasApi() {
  const response = await axiosClient.get("/bodas");
  const raw = response.data.data || response.data;
  return Array.isArray(raw) ? raw.map(mapBodaFromApi) : [];
}

/**
 * SUPERADMIN – detalle de una boda:
 *   GET /bodas/{boda}
 */
export async function getBodaByIdApi(id) {
  const response = await axiosClient.get(`/bodas/${id}`);
  const raw = response.data.data || response.data;
  return mapBodaFromApi(raw);
}

/**
 * ADMIN_BODA / SUPERADMIN – listado de MIS bodas:
 *   GET /mis-bodas
 */
export async function getMisBodasApi() {
  const response = await axiosClient.get("/mis-bodas");
  const raw = response.data.data || response.data;
  return Array.isArray(raw) ? raw.map(mapBodaFromApi) : [];
}

/**
 * ADMIN_BODA – detalle de una boda propia:
 *   GET /mis-bodas/{boda}
 */
export async function getMiBodaApi(id) {
  const response = await axiosClient.get(`/mis-bodas/${id}`);
  const raw = response.data.data || response.data;
  return mapBodaFromApi(raw);
}

/**
 * ADMIN_BODA – resumen para dashboard:
 *   GET /mis-bodas/{boda}/resumen
 * Puedes decidir si aquí devuelves un objeto específico de resúmenes,
 * por ahora solo devolvemos lo que mande el backend sin mapear.
 */
export async function getResumenMiBodaApi(id) {
  const response = await axiosClient.get(`/mis-bodas/${id}/resumen`);
  return response.data.data || response.data;
}
