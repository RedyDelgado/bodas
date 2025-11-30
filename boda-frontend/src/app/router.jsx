// src/app/router.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { PublicLayout } from "../shared/components/layouts/PublicLayout.jsx";
import { AdminLayout } from "../shared/components/layouts/AdminLayout.jsx";

// ProtectedRoute
import { ProtectedRoute } from "../shared/components/routing/ProtectedRoute.jsx";

// Páginas
import { LandingPage } from "../features/public/pages/LandingPage.jsx";
import { LoginPage } from "../features/auth/pages/LoginPage.jsx";
import { DemoBodaPage } from "../features/bodas/pages/DemoBodaPage.jsx";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage.jsx";
import { BodaDashboardPage } from "../features/bodas/pages/BodaDashboardPage.jsx";
import { BodaConfigPage } from "../features/bodas/pages/BodaConfigPage";
import BodaPublicPage from "../features/public/pages/BodaPublicPage";
import { BodaInvitadosPage } from "../features/bodas/pages/BodaInvitadosPage.jsx";
import { RsvpPage } from "../features/public/pages/RsvpPage.jsx";


// Si no tienes NotFound aún, puedes crearlo luego.
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          404 – Página no encontrada
        </h1>
        <p className="text-sm text-slate-600">
          La ruta solicitada no existe en la plataforma de bodas.
        </p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/demo-boda/:slug" element={<BodaPublicPage />} />
        </Route>

        {/* RUTA PÚBLICA DE LA BODA REAL (FASE 8)
            No usa PublicLayout ni AdminLayout para que la boda
            se vea "limpia", solo con su propia plantilla.
         */}
        <Route path="/boda/:slug" element={<BodaPublicPage />} />

        {/* Rutas de administración:
            - /admin → solo superadmin
            - /panel → solo admin_boda
         */}
         

        {/* SUPERADMIN */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          {/* Más adelante: /admin/bodas, /admin/planes, etc. */}
        </Route>

        {/* ADMIN_BODA */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin_boda"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/panel" element={<BodaDashboardPage />} />
          {/* Más adelante: /panel/configuracion, /panel/invitados, /panel/fotos, etc. */}
        </Route>

        <Route
          path="/panel"
          element={
            <ProtectedRoute rolPermitido={["admin_boda", "superadmin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BodaDashboardPage />} />
          <Route path="configuracion" element={<BodaConfigPage />} />
          <Route path="invitados" element={<BodaInvitadosPage />} />
        </Route>

        {/* 404 genérico */}
        <Route path="*" element={<NotFoundPage />} />

        <Route path="/rsvp/:codigo" element={<RsvpPage />} />

      </Routes>
    </BrowserRouter>
  );
}
