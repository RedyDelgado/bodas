// src/features/admin/pages/AdminDashboardPage.jsx
import React from "react";
import { useBodas } from "../../bodas/hooks/useBodas";

export function AdminDashboardPage() {
  const { bodas, cargando, error } = useBodas();

  const totalBodas = bodas.length;
  const totalInvitados = bodas.reduce(
    (acc, b) => acc + (b.totalInvitados || 0),
    0
  );
  const totalConfirmados = bodas.reduce(
    (acc, b) => acc + (b.totalConfirmados || 0),
    0
  );
  const totalVistas = bodas.reduce(
    (acc, b) => acc + (b.totalVistas || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-900">
          Dashboard Superadmin
        </h1>
        <p className="text-xs text-slate-500">
          Datos fake basados en el modelo de la tabla <code>bodas</code>.
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
          <p className="text-slate-500 mb-1">Bodas registradas</p>
          <p className="text-2xl font-bold text-slate-900">{totalBodas}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
          <p className="text-slate-500 mb-1">Invitados totales</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalInvitados}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
          <p className="text-slate-500 mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-emerald-600">
            {totalConfirmados}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
          <p className="text-slate-500 mb-1">Visitas acumuladas</p>
          <p className="text-2xl font-bold text-slate-900">{totalVistas}</p>
        </div>
      </div>

      {/* Tabla de bodas */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Bodas en la plataforma
          </h2>
          <span className="text-[11px] text-slate-500">
            Vista de control general (superadmin).
          </span>
        </div>

        {cargando ? (
          <p className="text-sm text-slate-500">Cargando bodas...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : bodas.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay bodas registradas (FAKE).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="text-left px-3 py-2 border-b">Título</th>
                  <th className="text-left px-3 py-2 border-b">Subdominio</th>
                  <th className="text-left px-3 py-2 border-b">Fecha</th>
                  <th className="text-left px-3 py-2 border-b">Ubicación</th>
                  <th className="text-center px-3 py-2 border-b">
                    Invitados
                  </th>
                  <th className="text-center px-3 py-2 border-b">
                    Confirmados
                  </th>
                  <th className="text-center px-3 py-2 border-b">Visitas</th>
                  <th className="text-center px-3 py-2 border-b">Estado</th>
                </tr>
              </thead>
              <tbody>
                {bodas.map((boda) => (
                  <tr key={boda.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border-b">
                      <div className="font-medium text-slate-900">
                        {boda.titulo}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-b text-xs text-slate-700">
                      {boda.subdominio}
                    </td>
                    <td className="px-3 py-2 border-b text-xs text-slate-700">
                      {boda.fechaBoda}
                    </td>
                    <td className="px-3 py-2 border-b text-xs text-slate-700">
                      {boda.ciudad}, {boda.pais}
                    </td>
                    <td className="px-3 py-2 border-b text-center text-xs text-slate-800">
                      {boda.totalInvitados}
                    </td>
                    <td className="px-3 py-2 border-b text-center text-xs text-emerald-700">
                      {boda.totalConfirmados}
                    </td>
                    <td className="px-3 py-2 border-b text-center text-xs text-slate-800">
                      {boda.totalVistas}
                    </td>
                    <td className="px-3 py-2 border-b text-center text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          boda.estado === "activa"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : boda.estado === "borrador"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {boda.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
