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
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Superadmin</h1>
        <p className="text-slate-600">Visión general de todas las bodas registradas en la plataforma</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-500 text-sm mb-1">Bodas registradas</p>
          <p className="text-2xl font-bold text-slate-900">{totalBodas}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-500 text-sm mb-1">Invitados totales</p>
          <p className="text-2xl font-bold text-slate-900">{totalInvitados}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-500 text-sm mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-emerald-600">{totalConfirmados}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-slate-500 text-sm mb-1">Visitas acumuladas</p>
          <p className="text-2xl font-bold text-slate-900">{totalVistas}</p>
        </div>
      </div>

      {/* Tabla de bodas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 p-4">{error}</p>
        ) : bodas.length === 0 ? (
          <p className="text-sm text-slate-500 p-4">No hay bodas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Título</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Subdominio</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Ubicación</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Invitados</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Confirmados</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Visitas</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bodas.map((boda) => (
                  <tr key={boda.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                      {boda.titulo}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {boda.subdominio}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {boda.fechaBoda}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {boda.ciudad}, {boda.pais}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-slate-800">
                      {boda.totalInvitados}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-emerald-700 font-medium">
                      {boda.totalConfirmados}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-slate-800">
                      {boda.totalVistas}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          boda.estado === "activa"
                            ? "bg-emerald-100 text-emerald-700"
                            : boda.estado === "borrador"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
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
