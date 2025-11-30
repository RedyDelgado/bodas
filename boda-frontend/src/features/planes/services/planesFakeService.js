// src/features/planes/services/planesFakeService.js

/**
 * Servicio FAKE de Planes.
 * Simula la respuesta que en el futuro dará la API Laravel.
 * 
 * IMPORTANTE:
 *  - Cuando conectemos con el backend, mantendremos la misma "forma"
 *    de los objetos para no romper los componentes ni los hooks.
 */

// Datos de ejemplo (podemos ajustarlos según tu modelo real)
const planesFake = [
  {
    id: 1,
    nombre: "Plan Básico",
    slug: "basico",
    descripcion: "Ideal para bodas pequeñas y sencillas.",
    precioMensual: 0,
    precioAnual: 0,
    limiteBodas: 1,
    limiteInvitados: 100,
    destacado: false,
  },
  {
    id: 2,
    nombre: "Plan Premium",
    slug: "premium",
    descripcion: "Incluye dominio personalizado, galería avanzada y WhatsApp.",
    precioMensual: 29,
    precioAnual: 290,
    limiteBodas: 3,
    limiteInvitados: 500,
    destacado: true,
  },
  {
    id: 3,
    nombre: "Plan Ilimitado",
    slug: "ilimitado",
    descripcion: "Perfecto para wedding planners y agencias.",
    precioMensual: 59,
    precioAnual: 590,
    limiteBodas: 9999,
    limiteInvitados: 9999,
    destacado: false,
  },
];

/**
 * Obtiene todos los planes disponibles (FAKE).
 * Retorna una Promise para simular un fetch real.
 */
export function getPlanesFake() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(planesFake);
    }, 300); // pequeño delay para simular red
  });
}
