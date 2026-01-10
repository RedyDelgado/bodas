// src/features/invitados/components/InvitadosPanel.jsx
import React, { useMemo, useState } from "react";
import { useInvitados } from "../hooks/useInvitados";
import { InvitadoSidebar } from "./InvitadoSidebar";
import { ConfirmationDialog } from "../../public/components/ConfirmationDialog";

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
    noAsistira,
    revertirPendiente,
    eliminar,
  } = useInvitados(bodaId);

  const [busqueda, setBusqueda] = useState("");
  const [invitadoActivo, setInvitadoActivo] = useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [modalAccion, setModalAccion] = useState({ open: false, tipo: null, invitado: null });
  const [procesandoAccion, setProcesandoAccion] = useState(false);

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

  const abrirModalAccion = (tipo, invitado) => {
    setModalAccion({ open: true, tipo, invitado });
  };

  const cerrarModalAccion = () => setModalAccion({ open: false, tipo: null, invitado: null });

  const ejecutarAccionModal = async () => {
    if (!modalAccion.open || !modalAccion.invitado) return;
    setProcesandoAccion(true);
    try {
      const id = modalAccion.invitado.id;
      if (modalAccion.tipo === "no_asistira") {
        await noAsistira(id);
      } else if (modalAccion.tipo === "eliminar") {
        await eliminar(id);
      } else if (modalAccion.tipo === "revertir") {
        await revertirPendiente(id);
      }
      cerrarModalAccion();
    } catch (e) {
      console.error(e);
    } finally {
      setProcesandoAccion(false);
    }
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
                      className={`px-2 py-1 rounded-full text-[11px] border ${
                        inv.estadoConfirmacion === "confirmado"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : inv.estadoConfirmacion === "no_asiste"
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {/* Confirmar */}
                      {inv.estadoConfirmacion !== "confirmado" && (
                        <button
                          type="button"
                          onClick={() => confirmar(inv.id)}
                          className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] hover:bg-emerald-100"
                        >
                          Confirmar
                        </button>
                      )}

                      {/* No asistirá / Revertir a pendiente */}
                      {inv.estadoConfirmacion !== "no_asiste" ? (
                        <button
                          type="button"
                          onClick={() => abrirModalAccion("no_asistira", inv)}
                          className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] hover:bg-rose-100"
                        >
                          No asistirá
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirModalAccion("revertir", inv)}
                          className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] hover:bg-amber-100"
                        >
                          Volver a pendiente
                        </button>
                      )}

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => {
                          setInvitadoActivo(inv);
                          setSidebarAbierto(true);
                        }}
                        className="px-2 py-1 rounded-md border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => abrirModalAccion("eliminar", inv)}
                        className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[11px] hover:bg-slate-200"
                      >
                        Eliminar
                      </button>
                    </div>
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

      {/* Modal de confirmación para acciones */}
      <ConfirmationDialog
        isOpen={modalAccion.open}
        title={
          modalAccion.tipo === "no_asistira"
            ? "¿Marcar como 'No asistirá'?"
            : modalAccion.tipo === "eliminar"
            ? "¿Eliminar invitado?"
            : "¿Volver a estado 'Pendiente'?"
        }
        message={
          modalAccion.tipo === "no_asistira"
            ? "Esta acción registrará que el invitado no asistirá. Podrás revertirlo a 'Pendiente' si cambia de opinión."
            : modalAccion.tipo === "eliminar"
            ? "Se eliminará al invitado de forma permanente de esta boda. Esta acción no se puede deshacer."
            : "El invitado volverá a estado 'Pendiente' y dejará de aparecer como 'No asistirá'."
        }
        confirmText={
          modalAccion.tipo === "eliminar" ? "Eliminar" : "Confirmar"
        }
        isDangerous={modalAccion.tipo === "eliminar"}
        isLoading={procesandoAccion}
        onConfirm={ejecutarAccionModal}
        onCancel={cerrarModalAccion}
      />
    </div>
  );
}
