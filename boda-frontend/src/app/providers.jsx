// src/app/providers.jsx
import React from "react";
import { AuthProvider } from "../features/auth/context/AuthContext";

/**
 * Aquí registramos todos los providers globales de la app.
 * Por ahora solo AuthProvider.
 * Más adelante se pueden añadir:
 * - BodasProvider
 * - InvitadosProvider
 * etc.
 */
export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
