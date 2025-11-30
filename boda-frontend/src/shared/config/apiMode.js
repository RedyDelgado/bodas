// src/shared/config/apiMode.js

/**
 * Lee las variables de entorno de Vite para saber
 * si debemos usar servicios FAKE o la API real.
 */
export const USE_FAKE_API =
  import.meta.env.VITE_USE_FAKE === "true" || import.meta.env.VITE_USE_FAKE === true;
