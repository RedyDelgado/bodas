// src/shared/components/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Topbar */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-white">
        <div className="font-semibold text-slate-800">
          Panel de administración
        </div>
        <div className="flex items-center gap-3">
          {usuario && (
            <span className="text-sm text-slate-600">
              {usuario.name} {/* o usuario.nombre */}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
