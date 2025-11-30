import axiosClient from "../../../shared/config/axiosClient";

export const rsvpApi = {
  async verificar(codigo) {
    const res = await axiosClient.get(`/public/rsvp/validar/${codigo}`);
    return res.data;
  },

  async registrar(payload) {
    const res = await axiosClient.post(`/public/rsvp`, payload);
    return res.data;
  }
};
