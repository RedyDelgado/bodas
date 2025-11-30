import axiosClient from "../../../shared/config/axiosClient";

/**
 * Servicio de API para gestionar invitados de una boda concreta
 * usando las rutas protegidas:
 * - GET    /mis-bodas/{boda}/invitados
 * - POST   /mis-bodas/{boda}/invitados
 * - GET    /invitados/{id}
 * - PUT    /invitados/{id}
 * - DELETE /invitados/{id}
 * - POST   /invitados/{id}/confirmar
 */

export const invitadosApi = {
  async listarPorBoda(bodaId) {
    const res = await axiosClient.get(`/mis-bodas/${bodaId}/invitados`);
    return res.data;
  },

  async crear(bodaId, payload) {
    const res = await axiosClient.post(
      `/mis-bodas/${bodaId}/invitados`,
      payload
    );
    return res.data;
  },

  async obtener(id) {
    const res = await axiosClient.get(`/invitados/${id}`);
    return res.data;
  },

  async actualizar(id, payload) {
    const res = await axiosClient.put(`/invitados/${id}`, payload);
    return res.data;
  },

  async eliminar(id) {
    const res = await axiosClient.delete(`/invitados/${id}`);
    return res.data;
  },

  async confirmar(id) {
    const res = await axiosClient.post(`/invitados/${id}/confirmar`);
    return res.data;
  },
};
