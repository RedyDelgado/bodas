// src/features/plantillas/services/plantillasFakeService.js

/**
 * Servicio FAKE de Plantillas de boda.
 * Inspirado en tus prototipos de HTML (boda_public_template, etc.).
 */

const plantillasFake = [
  {
    id: 1,
    nombre: "Clásica Azul Dorado",
    slug: "clasica-azul-dorado",
    descripcion: "Diseño elegante con tonos azul acero y dorado.",
    coloresPrincipales: ["#1F3C88", "#F2A365", "#F9F9FB"],
    imagenPreviaUrl: "/img/plantillas/clasica-azul-dorado.png",
  },
  {
    id: 2,
    nombre: "Minimal Blanca",
    slug: "minimal-blanca",
    descripcion: "Plantilla minimalista, fondo blanco y tipografía moderna.",
    coloresPrincipales: ["#FFFFFF", "#111827", "#9CA3AF"],
    imagenPreviaUrl: "/img/plantillas/minimal-blanca.png",
  },
  {
    id: 3,
    nombre: "Verde Natural",
    slug: "verde-natural",
    descripcion: "Estilo inspirado en naturaleza, ideal para bodas al aire libre.",
    coloresPrincipales: ["#065F46", "#ECFDF5", "#F97316"],
    imagenPreviaUrl: "/img/plantillas/verde-natural.png",
  },
];

export function getPlantillasFake() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(plantillasFake);
    }, 300);
  });
}
