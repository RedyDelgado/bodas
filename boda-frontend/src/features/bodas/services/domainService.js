// src/features/bodas/services/domainService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Asignar o actualizar el dominio personalizado de una boda.
 * @param {number} bodaId
 * @param {string} dominio - Ej: "redyypatricia.com"
 * @param {boolean} verificar - Si true, verifica DNS inmediatamente
 */
export async function setDomainPropio(bodaId, dominio, verificar = false) {
  const response = await axiosClient.post(`/mis-bodas/${bodaId}/dominio`, {
    dominio_personalizado: dominio,
    verificar,
  });
  return response.data;
}

/**
 * Eliminar el dominio personalizado de una boda (vuelve a usar subdominio).
 */
export async function removeDomainPropio(bodaId) {
  const response = await axiosClient.delete(`/mis-bodas/${bodaId}/dominio`);
  return response.data;
}

/**
 * Verificar si el dominio apunta correctamente a nuestro servidor.
 */
export async function verifyDomainPropio(bodaId) {
  const response = await axiosClient.post(
    `/mis-bodas/${bodaId}/dominio/verificar`
  );
  return response.data;
}

/**
 * Validar disponibilidad de un dominio (sin asignarlo aún).
 */
export async function checkDomainAvailability(dominio, bodaId = null) {
  const response = await axiosClient.get(`/validar-disponibilidad-dominio`, {
    params: { dominio, boda_id: bodaId },
  });
  return response.data;
}
