// src/features/panel/pages/BodaDashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";
import { DomainManagementModal } from "../components/DomainManagementModal";

// React Icons
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiGlobe,
  FiSettings,
  FiUserCheck,
  FiImage,
  FiEye,
} from "react-icons/fi";

/* Iconos coherentes con BodaInvitadosPage */
function IconChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSparkles(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M12 3l1.3 3.3L16.5 8 13.3 9.3 12 12l-1.3-2.7L7.5 8l3.2-1.7L12 3zM6 13l.7 1.8L9 15l-1.3.7L7 17l-.7-1.3L5 15l1.3-.2L6 13zm10 3l.7 1.8L19 18l-1.3.7L17 20l-.7-1.3L15 18l1.3-.2L16 16z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 3.5v3M16 3.5v3M3.5 9.5h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ======================== COMPONENTE ========================

export function BodaDashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bodaId = searchParams.get("boda"); // /panel?boda=ID

  const [estado, setEstado] = useState("loading"); // loading | select | ok | error
  const [mensajeError, setMensajeError] = useState("");

  const [resumen, setResumen] = useState(null);
  const [bodasUsuario, setBodasUsuario] = useState([]);

  // Modal de gestión de dominios
  const [modalDominioAbierto, setModalDominioAbierto] = useState(false);

  // --------- NAV ---------
  const handleIrDashboard = () => {
    if (!bodaId) return;
    navigate(`/panel?boda=${bodaId}`);
  };

  const handleIrConfig = () => {
    if (!bodaId) return;
    navigate(`/panel/configuracion?boda=${bodaId}`);
  };

  const handleIrInvitados = () => {
    if (!bodaId) return;
    navigate(`/panel/invitados?boda=${bodaId}`);
  };

  const handleVerPublica = () => {
    const sub = resumen?.boda?.subdominio;
    if (!sub) return;
    window.open(`/boda/${sub}`, "_blank");
  };

  const handleRecargarResumen = async () => {
    if (!bodaId) return;
    try {
      const res = await axiosClient.get(`/mis-bodas/${bodaId}/resumen`);
      setResumen(res.data);
    } catch (error) {
      console.error("Error al recargar resumen", error);
    }
  };

  useEffect(() => {
    const fetchResumen = async (id) => {
      try {
        setEstado("loading");
        const res = await axiosClient.get(`/mis-bodas/${id}/resumen`);
        setResumen(res.data);
        setEstado("ok");
      } catch (error) {
        console.error(error);
        setEstado("error");

        if (error.response?.status === 403) {
          setMensajeError("No tienes permisos para ver el resumen de esta boda.");
        } else if (error.response?.status === 404) {
          setMensajeError("No encontramos esta boda.");
        } else {
          setMensajeError("Ocurrió un error al cargar el resumen de la boda.");
        }
      }
    };

    const fetchBodasUsuario = async () => {
      try {
        setEstado("loading");
        const res = await axiosClient.get("/mis-bodas");
        const bodas = Array.isArray(res.data) ? res.data : [];

        setBodasUsuario(bodas);

        if (bodas.length === 0) {
          setEstado("error");
          setMensajeError("Aún no tienes ninguna boda registrada.");
          return;
        }

        if (bodas.length === 1) {
          const unica = bodas[0];
          navigate(`/panel?boda=${unica.id}`, { replace: true });
          return;
        }

        setEstado("select");
      } catch (error) {
        console.error(error);
        setEstado("error");
        setMensajeError(
          "No se pudo obtener la lista de tus bodas. Intenta más tarde."
        );
      }
    };

    if (bodaId) {
      fetchResumen(bodaId);
    } else {
      fetchBodasUsuario();
    }
  }, [bodaId, navigate]);

  // ========= HELPERS PARA FORMATO Y DATOS CLAVE =========

  const fechaLarga = useMemo(() => {
    if (!resumen?.boda?.fecha_boda) return "";
    const f = new Date(resumen.boda.fecha_boda);
    if (isNaN(f.getTime())) return resumen.boda.fecha_boda;
    return f.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [resumen?.boda?.fecha_boda]);

  const diasRestantes = useMemo(() => {
    if (!resumen?.boda?.fecha_boda) return null;
    const hoy = new Date();
    const evento = new Date(resumen.boda.fecha_boda);
    if (isNaN(evento.getTime())) return null;
    const diffMs = evento.getTime() - hoy.getTime();
    const d = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return d;
  }, [resumen?.boda?.fecha_boda]);

  const dominio = useMemo(() => {
    const boda = resumen?.boda;
    if (!boda) return null;
    if (boda.usa_dominio_personalizado && boda.dominio_personalizado) {
      return boda.dominio_personalizado;
    }
    if (boda.subdominio) return boda.subdominio;
    return null;
  }, [resumen?.boda]);

  // ======== ESTADOS DE CARGA / ERROR ========

  if (estado === "loading") {
    return (
      <div className="py-6">
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 max-w-xl">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">
            Cargando
          </p>
          <p className="text-sm text-slate-700">
            Estamos preparando el resumen de tu boda…
          </p>
        </div>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="py-6">
        <div className="max-w-lg bg-white border border-rose-200 rounded-2xl px-5 py-4">
          <h1 className="text-sm font-semibold text-rose-700 mb-1">
            No se pudo cargar el dashboard
          </h1>
          <p className="text-sm text-slate-700">{mensajeError}</p>
        </div>
      </div>
    );
  }

  // ======== ESTADO "select": usuario con varias bodas ========

  if (estado === "select") {
    return (
      <div className="py-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Elige la boda que quieres gestionar
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tienes varias bodas asociadas a tu cuenta. Selecciona una para ver
              su dashboard y configuración.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bodasUsuario.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/panel?boda=${b.id}`)}
              className="text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-400 hover:shadow-sm transition flex flex-col gap-1"
            >
              <p className="text-sm font-semibold text-slate-900">
                {b.nombre_pareja || `Boda #${b.id}`}
              </p>
              <p className="text-xs text-slate-600">
                Fecha: {b.fecha_boda ?? "Sin fecha definida"}
              </p>
              <p className="text-xs text-slate-500">
                Subdominio: {b.subdominio || "—"}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ======== ESTADO "ok": mostramos resumen de UNA boda concreta ========

  if (!resumen) return null;

  const { boda, invitados, fotos } = resumen;
  const porcentajes = invitados?.porcentajes || {
    confirmados: 0,
    rechazados: 0,
    pendientes: 0,
  };

  const totalInvitados = invitados?.total || 0;
  const totalConfirmados = invitados?.confirmados || 0;
  const totalPendientes = invitados?.pendientes || 0;
  const totalRechazados = invitados?.rechazados || 0;
  const totalAsistentes = invitados?.total_asistentes_confirmados || 0;

  const totalVistas = boda?.total_vistas || 0;
  const totalFotos = fotos?.total || 0;

  const progressConfirmados = porcentajes.confirmados || 0;

  return (
    <div className="space-y-6 py-4 md:py-6">
      {/* BARRA SUPERIOR – coherente con BodaInvitadosPage */}
      <div className="bg-white border border-slate-200 rounded-3xl px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          {/* Botón atrás: vuelve a la selección de bodas */}
          <button
            type="button"
            onClick={() => navigate("/panel")}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            title="Volver a mis bodas"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Dashboard de la boda
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                {boda?.nombre_pareja || "Mi boda"}
              </h1>
              {boda?.subdominio && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-2.5 py-1 text-[11px] font-medium">
                  <IconSparkles className="w-3.5 h-3.5" />
                  {boda.subdominio}
                </span>
              )}
              {boda?.fecha_boda && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600">
                  <IconCalendar className="w-3.5 h-3.5" />
                  {fechaLarga}
                </span>
              )}
            </div>
            {boda?.ciudad && (
              <p className="mt-1 text-xs text-slate-500">{boda.ciudad}</p>
            )}
          </div>
        </div>

        {/* Píldoras de navegación entre secciones */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleIrDashboard}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            <FiUserCheck className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleIrConfig}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FiSettings className="w-3.5 h-3.5" />
            Configuración
          </button>
          <button
            type="button"
            onClick={handleIrInvitados}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FiUsers className="w-3.5 h-3.5" />
            Invitados y links RSVP
          </button>
          <button
            type="button"
            onClick={handleVerPublica}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <FiGlobe className="w-3.5 h-3.5" />
            Ver página pública
          </button>
        </div>
      </div>

      {/* FILA PRINCIPAL: MÉTRICAS + PROGRESO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Métricas principales + progreso */}
        <div className="space-y-4 xl:col-span-2">
          {/* Tarjetas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">
                  Invitados totales
                </p>
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-50 text-slate-700">
                  <FiUsers className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalInvitados}
              </p>
              <p className="text-[11px] text-slate-500">
                Personas registradas en la lista.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase">
                  Confirmados
                </p>
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 text-emerald-700">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">
                {totalConfirmados}
              </p>
              <p className="text-[11px] text-emerald-700">
                {porcentajes.confirmados}% del total.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-amber-700 uppercase">
                  Pendientes
                </p>
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-50 text-amber-700">
                  <FiClock className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-amber-800">
                {totalPendientes}
              </p>
              <p className="text-[11px] text-amber-700">
                Invitados sin respuesta aún.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-rose-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-rose-700 uppercase">
                  Rechazados
                </p>
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-rose-50 text-rose-700">
                  <FiXCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-rose-800">
                {totalRechazados}
              </p>
              <p className="text-[11px] text-rose-700">
                No podrán asistir al evento.
              </p>
            </div>
          </div>

          {/* Progreso de confirmación */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h2 className="text-sm font-semibold text-slate-900">
                Progreso de confirmación
              </h2>
              {totalInvitados > 0 && (
                <p className="text-[11px] text-slate-500">
                  {totalConfirmados} de {totalInvitados} invitados han confirmado.
                </p>
              )}
            </div>

            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-3.5 bg-slate-900 rounded-full transition-all"
                style={{ width: `${progressConfirmados}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Confirmados:{" "}
                <strong className="font-semibold">
                  {porcentajes.confirmados}%
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Pendientes:{" "}
                <strong className="font-semibold">
                  {porcentajes.pendientes}%
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Rechazados:{" "}
                <strong className="font-semibold">
                  {porcentajes.rechazados}%
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* PANEL LATERAL: MÉTRICAS CLAVE */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Asistentes estimados
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-2xl font-semibold text-slate-900">
                  {totalAsistentes}
                </p>
                <FiUserCheck className="w-4 h-4 text-slate-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Sumatoria de pases de quienes han confirmado asistencia.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Fotos subidas
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xl font-semibold text-slate-900">
                  {totalFotos}
                </p>
                <FiImage className="w-4 h-4 text-slate-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Imágenes activas en la página pública.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Vistas de la página
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xl font-semibold text-slate-900">
                  {totalVistas}
                </p>
                <FiEye className="w-4 h-4 text-slate-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Veces que la página pública ha sido visitada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para gestionar dominio */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setModalDominioAbierto(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg hover:bg-slate-800 flex items-center gap-2"
        >
          <FiGlobe className="w-4 h-4" />
          Configurar dominio
        </button>
      </div>

      {/* Modal de gestión de dominios */}
      <DomainManagementModal
        boda={resumen?.boda}
        isOpen={modalDominioAbierto}
        onClose={() => setModalDominioAbierto(false)}
        onSuccess={handleRecargarResumen}
      />
    </div>
  );
}
