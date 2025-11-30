// src/features/faqs/services/faqsFakeService.js

/**
 * Servicio FAKE de FAQs de la plataforma.
 * Estas preguntas se mostrarán en la landing / página de ayuda.
 */

const faqsFake = [
  {
    id: 1,
    pregunta: "¿Puedo usar un subdominio gratuito para mi boda?",
    respuesta:
      "Sí, la plataforma puede generar un subdominio gratuito del tipo misboda.plataforma.com.",
    orden: 1,
  },
  {
    id: 2,
    pregunta: "¿Puedo usar un dominio propio?",
    respuesta:
      "Sí, con los planes de pago puedes conectar tu dominio comprado en cualquier proveedor.",
    orden: 2,
  },
  {
    id: 3,
    pregunta: "¿Cómo se gestionan los invitados?",
    respuesta:
      "Podrás cargar la lista de invitados, enviar invitaciones por WhatsApp y ver quién confirmó asistencia.",
    orden: 3,
  },
];

export function getFaqsFake() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(faqsFake);
    }, 300);
  });
}
