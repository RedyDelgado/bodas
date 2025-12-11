// src/features/public/services/publicRsvpService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Envía la confirmación de asistencia (RSVP) de un invitado.
 * Espera:
 *  - codigo: string (obligatorio)
 *  - respuesta: string (confirmado|rechazado)
 *  - cantidad_personas: number (opcional, por defecto 1)
 *  - mensaje: string (opcional)
 *  - celular: string (opcional)
 */
export async function registrarRsvp({
  codigo,
  respuesta = "confirmado",
  cantidad_personas = 1,
  mensaje = "",
  celular = "",
}) {
  const payload = {
    codigo,
    respuesta,
    cantidad_personas,
    mensaje: mensaje || null,
  };

  // Agregar celular si se proporciona
  if (celular) {
    payload.celular = celular;
  }

  const { data } = await axiosClient.post("/public/rsvp", payload);
  return data;
}

/**
 * Validar código de invitación sin confirmar aún.
 * GET /public/rsvp/validar/{codigo}
 */
export async function validarCodigo(codigo) {
  if (!codigo) throw new Error("Código requerido");
  const { data } = await axiosClient.get(`/public/rsvp/validar/${encodeURIComponent(codigo)}`);
  return data;
}
