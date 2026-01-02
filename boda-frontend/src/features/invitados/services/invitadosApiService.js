// src/features/invitados/services/invitadosApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Adaptador: convierte el invitado que viene de Laravel (snake_case)
 * al modelo que usa el frontend (camelCase).
 *
 * Campos de Laravel:
 * - id
 * - boda_id
 * - codigo_clave
 * - nombre_invitado
 * - pases
 * - correo
 * - celular
 * - nombre_acompanante
 * - es_confirmado (boolean)
 * - fecha_confirmacion
 * - notas
 */
function mapInvitadoFromApi(inv) {
  if (!inv) return null;

  return {
    id: inv.id,
    bodaId: inv.boda_id,
    codigoClave: inv.codigo_clave,
    nombre: inv.nombre_invitado,
    pases: inv.pases,
    email: inv.correo,
    telefono: inv.celular,
    nombreAcompanante: inv.nombre_acompanante,
    estadoConfirmacion:
      inv.es_confirmado === 1
        ? "confirmado"
        : inv.es_confirmado === -1
        ? "no_asiste"
        : "pendiente",
    fechaConfirmacion: inv.fecha_confirmacion,
    notas: inv.notas,
    es_confirmado: inv.es_confirmado,
  };
}

/**
 * ADMIN_BODA – invitados de la boda propia.
 *   GET /mis-bodas/{boda}/invitados
 */
export async function getInvitadosByBodaApi(bodaId) {
  const response = await axiosClient.get(`/mis-bodas/${bodaId}/invitados`);
  const raw = response.data.data || response.data;
  return Array.isArray(raw) ? raw.map(mapInvitadoFromApi) : [];
}

/**
 * ADMIN_BODA – actualizar invitado propio.
 *   PUT /invitados/{invitado}
 */
export async function updateInvitadoApi(id, datos) {
  const payload = {
    nombre_invitado: datos.nombre,
    correo: datos.email,
    celular: datos.telefono,
    pases: datos.pases,
    nombre_acompanante: datos.nombreAcompanante,
    notas: datos.notas,
    es_confirmado:
      datos.estadoConfirmacion === "confirmado"
        ? 1
        : datos.estadoConfirmacion === "no_asiste"
        ? -1
        : 0,
  };

  const response = await axiosClient.put(`/invitados/${id}`, payload);
  const raw = response.data.data || response.data;
  return mapInvitadoFromApi(raw);
}

/**
 * ADMIN_BODA – confirmar invitado manualmente.
 *   POST /invitados/{invitado}/confirmar
 */
export async function confirmarInvitadoApi(id) {
  const response = await axiosClient.post(`/invitados/${id}/confirmar`);
  const raw = response.data.data || response.data;
  return mapInvitadoFromApi(raw);
}
