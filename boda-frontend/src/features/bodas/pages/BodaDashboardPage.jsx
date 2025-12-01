// src/features/panel/pages/BodaDashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";

// ==== ÍCONOS MONOCROMO (currentColor) ====
function IconUsers({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M15 19c0-2.21-1.79-4-4-4H7c-2.21 0-4 1.79-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="10"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M20 19c0-1.66-1.34-3-3-3h-.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 5.5a2.5 2.5 0 1 1 0 5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m8.5 12.5 2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClock({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconX({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m9 9 6 6m0-6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGlobe({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.5 10h17M3.5 14h17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12 3c-2 2.2-3 4.8-3 9s1 6.8 3 9c2-2.2 3-4.8 3-9s-1-6.8-3-9Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IconSettings({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.75 12a7.25 7.25 0 0 1 .1-1.2l-1.7-1.3 1.8-3.1 2 .5A7.2 7.2 0 0 1 8.8 5l.3-2h3.8l.3 2a7.2 7.2 0 0 1 1.9.9l2-.5 1.8 3.1-1.7 1.3c.06.39.1.78.1 1.2 0 .42-.04.82-.1 1.21l1.7 1.29-1.8 3.1-2-.5a7.2 7.2 0 0 1-1.9.9l-.3 2h-3.8l-.3-2a7.2 7.2 0 0 1-1.9-.9l-2 .5-1.8-3.1 1.7-1.29A7.3 7.3 0 0 1 4.75 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUsersLink({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19c0-2.21 1.79-4 4-4h1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="8"
        cy="9"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 17h4a2 2 0 0 0 0-4h-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 17a2 2 0 0 0 0-4h3"
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
    <div className="py-4 md:py-6 space-y-6">
      {/* CABECERA PRINCIPAL */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] tracking-[0.16em] uppercase text-slate-400">
            Dashboard de la boda
          </p>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {boda?.nombre_pareja
              ? `Boda de ${boda.nombre_pareja}`
              : "Resumen general de tu boda"}
          </h1>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600 mt-1">
            {fechaLarga && <span>{fechaLarga}</span>}
            {boda?.ciudad && (
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                {boda.ciudad}
              </span>
            )}
            {diasRestantes !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                <IconClock className="w-3 h-3" />
                {diasRestantes >= 0
                  ? `${diasRestantes} día(s) para la boda`
                  : "La fecha de la boda ya pasó"}
              </span>
            )}
            {dominio && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                <IconGlobe className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{dominio}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/panel/configuracion?boda=${bodaId}`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <IconSettings className="w-4 h-4" />
            <span>Configuración de la boda</span>
          </button>
          <button
            onClick={() => navigate(`/panel/invitados?boda=${bodaId}`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <IconUsersLink className="w-4 h-4" />
            <span>Invitados y links RSVP</span>
          </button>
          <button
            onClick={() =>
              window.open(`/boda/${boda?.subdominio || ""}`, "_blank")
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
          >
            <IconGlobe className="w-4 h-4" />
            <span>Ver página pública</span>
          </button>
        </div>
      </div>

      {/* FILA PRINCIPAL: MÉTRICAS + PROGRESO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Métricas principales (4 cards) + progreso */}
        <div className="space-y-4 xl:col-span-2">
          {/* Tarjetas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">
                  Invitados totales
                </p>
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-50 text-slate-700">
                  <IconUsers className="w-3.5 h-3.5" />
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
                  <IconCheck className="w-3.5 h-3.5" />
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
                  <IconClock className="w-3.5 h-3.5" />
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
                  <IconX className="w-3.5 h-3.5" />
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
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalAsistentes}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                Sumatoria de pases de quienes han confirmado asistencia.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Fotos subidas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {totalFotos}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                Imágenes activas en la página pública.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Vistas de la página
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {totalVistas}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                Veces que la página pública ha sido visitada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
