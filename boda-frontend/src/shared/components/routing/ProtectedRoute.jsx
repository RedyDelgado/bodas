// src/shared/components/routing/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, cargando, usuario } = useAuth();
  const location = useLocation();

  // Mientras estamos validando /auth/me
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-sm">Verificando sesión...</p>
      </div>
    );
  }

  // Si no hay sesión → al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ Si se especifican roles permitidos, validamos contra usuario.rol.nombre
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const rolNombre = usuario?.rol?.nombre; // viene del backend Laravel (user->rol->nombre)

    // Si el usuario no tiene rol o no está en la lista permitida → bloqueamos
    if (!rolNombre || !allowedRoles.includes(rolNombre)) {
      // Puedes mandarlo al home o a otra ruta de "sin permiso"
      return <Navigate to="/" replace />;
    }
  }

  // Si pasó todas las validaciones, renderizamos el contenido protegido
  return children;
}
