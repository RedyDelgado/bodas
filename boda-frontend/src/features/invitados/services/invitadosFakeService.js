// src/features/invitados/services/invitadosFakeService.js

// Ejemplo de dataset fake en memoria
const INVITADOS_FAKE = [
  {
    id: 1,
    bodaId: 1,
    codigoClave: "ABC12345",
    nombre: "Invitado Demo 1",
    pases: 2,
    email: "invitado1@test.com",
    telefono: "999999999",
    nombreAcompanante: "Acompañante Demo",
    estadoConfirmacion: "confirmado",
    fechaConfirmacion: "2025-01-01",
    notas: "Ejemplo de invitado.",
  },
  // puedes añadir más si quieres...
];

/**
 * Obtiene invitados fake por boda.
 */
export function getInvitadosFake(bodaId) {
  if (!bodaId) return Promise.resolve([]);
  // En un demo simple, devolvemos todos sin filtrar por bodaId.
  return Promise.resolve(INVITADOS_FAKE);
}

/**
 * Actualiza un invitado en el array fake.
 */
export function updateInvitadoFake(id, datos) {
  const index = INVITADOS_FAKE.findIndex((inv) => inv.id === id);
  if (index === -1) {
    return Promise.resolve(null);
  }

  INVITADOS_FAKE[index] = {
    ...INVITADOS_FAKE[index],
    ...datos,
  };

  return Promise.resolve(INVITADOS_FAKE[index]);
}

/**
 * Marca un invitado como confirmado en el fake.
 */
export function confirmarInvitadoFake(id) {
  const index = INVITADOS_FAKE.findIndex((inv) => inv.id === id);
  if (index === -1) {
    return Promise.resolve(null);
  }

  INVITADOS_FAKE[index] = {
    ...INVITADOS_FAKE[index],
    estadoConfirmacion: "confirmado",
  };

  return Promise.resolve(INVITADOS_FAKE[index]);
}

/**
 * Marca un invitado como "no asistirá" en el fake.
 */
export function noAsistiraInvitadoFake(id) {
  const index = INVITADOS_FAKE.findIndex((inv) => inv.id === id);
  if (index === -1) {
    return Promise.resolve(null);
  }

  INVITADOS_FAKE[index] = {
    ...INVITADOS_FAKE[index],
    estadoConfirmacion: "no_asiste",
  };

  return Promise.resolve(INVITADOS_FAKE[index]);
}

/**
 * Elimina un invitado del array fake.
 */
export function eliminarInvitadoFake(id) {
  const index = INVITADOS_FAKE.findIndex((inv) => inv.id === id);
  if (index === -1) return Promise.resolve(false);
  INVITADOS_FAKE.splice(index, 1);
  return Promise.resolve(true);
}
