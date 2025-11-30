// src/features/bodas/services/bodasFakeService.js

/**
 * Servicio FAKE de Bodas.
 * Los campos están inspirados en tu tabla `bodas`.
 */

let bodasFake = [
  {
    id: 1,
    titulo: "Boda de Redy & Patricia",
    subdominio: "redy-patricia-2025",
    fechaBoda: "2025-12-20",
    ciudad: "Quillabamba",
    pais: "Perú",
    estado: "activa", // borrador | activa | archivada
    planId: 2,
    plantillaId: 1,
    totalInvitados: 150,
    totalConfirmados: 90,
    totalVistas: 340,
  },
  {
    id: 2,
    titulo: "Boda de Christopher & Emilia",
    subdominio: "christopher-emilia-2025",
    fechaBoda: "2025-11-15",
    ciudad: "Cusco",
    pais: "Perú",
    estado: "activa",
    planId: 1,
    plantillaId: 2,
    totalInvitados: 120,
    totalConfirmados: 70,
    totalVistas: 210,
  },
  {
    id: 3,
    titulo: "Boda Demo Internacional",
    subdominio: "demo-internacional",
    fechaBoda: "2026-03-10",
    ciudad: "Madrid",
    pais: "España",
    estado: "borrador",
    planId: 3,
    plantillaId: 3,
    totalInvitados: 200,
    totalConfirmados: 0,
    totalVistas: 12,
  },
];

export function getBodasFake() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(bodasFake), 300);
  });
}

export function getBodaByIdFake(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const boda = bodasFake.find((b) => b.id === Number(id));
      if (!boda) {
        reject(new Error("Boda no encontrada (FAKE)"));
      } else {
        resolve(boda);
      }
    }, 300);
  });
}

export function getBodaBySubdominioFake(subdominio) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const boda = bodasFake.find((b) => b.subdominio === subdominio);
      if (!boda) {
        reject(new Error("Boda no encontrada para ese subdominio (FAKE)"));
      } else {
        resolve(boda);
      }
    }, 300);
  });
}
