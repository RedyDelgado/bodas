// src/features/invitados/components/InvitadosPanel.jsx
import React, { useMemo, useState } from "react";
import { useInvitados } from "../hooks/useInvitados";
import { InvitadoSidebar } from "./InvitadoSidebar";

/**
 * Panel SaaS de invitados para una boda.
 *
 * Props:
 * - bodaId: ID de la boda (number)
 */
export function InvitadosPanel({ bodaId }) {
  const {
    invitados,
    cargando,
    error,
    guardarInvitado,
    confirmar,
  } = useInvitados(bodaId);

  const [busqueda, setBusqueda] = useState("");
  const [invitadoActivo, setInvitadoActivo] = useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const invitadosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return invitados;
    const q = busqueda.toLowerCase();
    return invitados.filter((inv) => {
      return (
        inv.nombre?.toLowerCase().includes(q) ||
        inv.email?.toLowerCase().includes(q) ||
        inv.telefono?.toLowerCase().includes(q) ||
        inv.nombreAcompanante?.toLowerCase().includes(q)
      );
    });
  }, [invitados, busqueda]);

  const totalInvitados = invitados.length;
  const confirmados = invitados.filter(
    (inv) => inv.estadoConfirmacion === "confirmado"
  ).length;
  const pendientes = invitados.filter(
    (inv) => inv.estadoConfirmacion === "pendiente"
  ).length;

  const handleAbrirSidebar = (invitado) => {
    setInvitadoActivo(invitado);
    setSidebarAbierto(true);
  };

  const handleCerrarSidebar = () => {
    setSidebarAbierto(false);
    setInvitadoActivo(null);
  };

  const handleGuardarInvitado = async (datosActualizados) => {
    await guardarInvitado(datosActualizados.id, datosActualizados);
  };

  const handleConfirmarInvitado = async () => {
    if (!invitadoActivo) return;
    await confirmar(invitadoActivo.id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Invitados de la boda
          </h2>
          <p className="text-[11px] text-slate-500">
            Gestión tipo SaaS: búsqueda, edición rápida y confirmación manual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Métricas rápidas */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {totalInvitados}
              </span>
            </span>
            <span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              Confirmados:{" "}
              <span className="font-semibold">{confirmados}</span>
            </span>
            <span className="px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              Pendientes:{" "}
              <span className="font-semibold">{pendientes}</span>
            </span>
          </div>

          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-64 max-w-xs border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <span className="absolute left-2 top-1.5 text-slate-400 text-xs">
              🔍
            </span>
          </div>
        </div>
      </div>

      {cargando && (
        <p className="text-sm text-slate-500">Cargando invitados...</p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      {!cargando && !error && invitadosFiltrados.length === 0 && (
        <p className="text-sm text-slate-500">
          No se encontraron invitados que coincidan con la búsqueda.
        </p>
      )}

      {!cargando && !error && invitadosFiltrados.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-500 uppercase">
                <th className="text-left px-3 py-2 border-b">Nombre</th>
                <th className="text-left px-3 py-2 border-b">Teléfono</th>
                <th className="text-left px-3 py-2 border-b">Email</th>
                <th className="text-left px-3 py-2 border-b">
                  Acompañante
                </th>
                <th className="text-center px-3 py-2 border-b">
                  Confirmación
                </th>
                <th className="text-center px-3 py-2 border-b">
                  Notas
                </th>
                <th className="text-center px-3 py-2 border-b">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {invitadosFiltrados.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleAbrirSidebar(inv)}
                >
                  <td className="px-3 py-2 border-b text-slate-800">
                    {inv.nombre}
                  </td>
                  <td className="px-3 py-2 border-b text-slate-700">
                    {inv.telefono}
                  </td>
                  <td className="px-3 py-2 border-b text-slate-700">
                    {inv.email || "-"}
                  </td>
                  <td className="px-3 py-2 border-b text-slate-700">
                    {inv.nombreAcompanante || "-"}
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] ${
                        inv.estadoConfirmacion === "confirmado"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {inv.estadoConfirmacion}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b text-center text-slate-700">
                    {inv.notas || "-"}
                  </td>
                  <td
                    className="px-3 py-2 border-b text-center"
                    onClick={(e) => e.stopPropagation()} // evitar que dispare el click de fila
                  >
                    {inv.estadoConfirmacion !== "confirmado" && (
                      <button
                        type="button"
                        onClick={() => {
                          setInvitadoActivo(inv);
                          setSidebarAbierto(true);
                        }}
                        className="px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] hover:bg-slate-800"
                      >
                        Editar / Confirmar
                      </button>
                    )}
                    {inv.estadoConfirmacion === "confirmado" && (
                      <button
                        type="button"
                        onClick={() => {
                          setInvitadoActivo(inv);
                          setSidebarAbierto(true);
                        }}
                        className="px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                      >
                        Ver / Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvitadoSidebar
        invitado={invitadoActivo}
        abierto={sidebarAbierto}
        onClose={handleCerrarSidebar}
        onGuardar={handleGuardarInvitado}
        onConfirmar={handleConfirmarInvitado}
      />
    </div>
  );
}
