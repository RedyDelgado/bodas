// src/shared/components/layouts/PublicLayout.jsx
import React from "react";
import { Outlet, Link, NavLink } from "react-router-dom";

/**
 * Layout público:
 * - Se usará para: Landing (/), Login (/login), Demo de boda (/demo-boda/:slug)
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-slate-800">
            💍 Plataforma de Bodas
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700"
                }`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/demo-boda/demo-ejemplo"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700"
                }`
              }
            >
              Ver demo
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full border ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-slate-300 text-slate-700"
                }`
              }
            >
              Iniciar sesión
            </NavLink>
            <NavLink
              to="/registro"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 ${
                  isActive ? "ring-2 ring-slate-400" : ""
                }`
              }
            >
              Crear cuenta
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-6">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} Plataforma de bodas.</span>
          <span>Desarrollado para pruebas internas.</span>
        </div>
      </footer>
    </div>
  );
}
