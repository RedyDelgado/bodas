// src/features/admin/pages/AdminDashboardPage.jsx
import React from "react";
import { useBodas } from "../../bodas/hooks/useBodas";
import {
  FiHeart,
  FiUsers,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

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
      {/* Encabezado Premium */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <FiHeart className="text-rose-600" size={32} />
          Dashboard de Bodas
        </h1>
        <p className="text-slate-600">
          Visión general de todas las bodas registradas en la plataforma
        </p>
      </div>

      {/* Tarjetas resumen - Diseño Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-rose-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-rose-100 p-3 rounded-lg">
              <FiHeart className="text-rose-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1">Bodas Registradas</p>
          <p className="text-3xl font-bold text-slate-900">{totalBodas}</p>
          <p className="text-xs text-slate-500 mt-2">Total en la plataforma</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-sky-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-sky-100 p-3 rounded-lg">
              <FiUsers className="text-sky-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1">Invitados Totales</p>
          <p className="text-3xl font-bold text-slate-900">{totalInvitados}</p>
          <p className="text-xs text-slate-500 mt-2">Personas registradas</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <FiCheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1">Confirmados</p>
          <p className="text-3xl font-bold text-emerald-600">{totalConfirmados}</p>
          <p className="text-xs text-slate-500 mt-2">
            {totalInvitados > 0
              ? `${Math.round((totalConfirmados / totalInvitados) * 100)}% de confirmación`
              : "Sin invitados"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <FiEye className="text-amber-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1">Visitas Acumuladas</p>
          <p className="text-3xl font-bold text-slate-900">{totalVistas}</p>
          <p className="text-xs text-slate-500 mt-2">Páginas visitadas</p>
        </div>
      </div>

      {/* Tabla de bodas - Premium */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64">
            <ImSpinner2 className="animate-spin text-slate-600 mb-4" size={48} />
            <p className="text-slate-600 font-medium">Cargando bodas...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-6 py-4 m-6 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold">Error al cargar bodas</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : bodas.length === 0 ? (
          <div className="p-12 text-center">
            <FiHeart className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-600 font-medium mb-2">No hay bodas registradas</p>
            <p className="text-sm text-slate-500">
              Las bodas aparecerán aquí una vez que se registren en la plataforma
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Boda
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subdominio
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Invitados
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Confirmados
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Visitas
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bodas.map((boda) => (
                  <tr
                    key={boda.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FiHeart className="text-rose-400" size={16} />
                        <span className="font-semibold text-slate-900">
                          {boda.titulo}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
                        {boda.subdominio}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-700 font-medium">
                        {boda.fechaBoda}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600">
                        {boda.ciudad}, {boda.pais}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-sky-100 text-sky-700 rounded-full font-semibold text-sm">
                        {boda.totalInvitados}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm">
                        {boda.totalConfirmados}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full font-semibold text-sm">
                        {boda.totalVistas}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          boda.estado === "activa"
                            ? "bg-emerald-100 text-emerald-800"
                            : boda.estado === "borrador"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            boda.estado === "activa"
                              ? "bg-emerald-600"
                              : boda.estado === "borrador"
                              ? "bg-amber-600"
                              : "bg-slate-600"
                          }`}
                        ></span>
                        {boda.estado.charAt(0).toUpperCase() +
                          boda.estado.slice(1)}
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
