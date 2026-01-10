// src/features/invitados/services/invitadosService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import {
  getInvitadosFake,
  updateInvitadoFake,
  confirmarInvitadoFake,
  noAsistiraInvitadoFake,
  eliminarInvitadoFake,
} from "./invitadosFakeService";
import {
  getInvitadosByBodaApi,
  updateInvitadoApi,
  confirmarInvitadoApi,
  noAsistiraInvitadoApi,
  eliminarInvitadoApi,
} from "./invitadosApiService";

export function obtenerInvitadosPorBoda(bodaId) {
  if (!bodaId) return Promise.resolve([]);
  if (USE_FAKE_API) return getInvitadosFake(bodaId);
  return getInvitadosByBodaApi(bodaId);
}

export function actualizarInvitado(id, datos) {
  if (USE_FAKE_API) return updateInvitadoFake(id, datos);
  return updateInvitadoApi(id, datos);
}

export function confirmarInvitado(id) {
  if (USE_FAKE_API) return confirmarInvitadoFake(id);
  return confirmarInvitadoApi(id);
}

export function marcarNoAsistira(id) {
  if (USE_FAKE_API) return noAsistiraInvitadoFake(id);
  return noAsistiraInvitadoApi(id);
}

export function eliminarInvitado(id) {
  if (USE_FAKE_API) return eliminarInvitadoFake(id);
  return eliminarInvitadoApi(id);
}
