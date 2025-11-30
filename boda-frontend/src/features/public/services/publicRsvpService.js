// src/features/public/services/publicRsvpService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Envía la confirmación de asistencia (RSVP) de un invitado.
 * Espera:
 *  - codigo: string (obligatorio)
 *  - cantidad_personas: number (opcional, por defecto 1)
 *  - mensaje: string (opcional)
 */
export async function registrarRsvp({ codigo, cantidad_personas = 1, mensaje = "" }) {
  const payload = {
    codigo,
    cantidad_personas,
    mensaje,
  };

  const { data } = await axiosClient.post("/public/rsvp", payload);
  return data;
}
