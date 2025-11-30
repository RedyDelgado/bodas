// src/features/bodas/services/bodasApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Adaptador: convierte el objeto boda que viene de Laravel (snake_case)
 * al modelo que usa el frontend (camelCase).
 */
function mapBodaFromApi(b) {
  if (!b) return null;

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
