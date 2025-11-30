import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";

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
          // Solo tiene una boda → redirigimos automáticamente
          const unica = bodas[0];
          navigate(`/panel?boda=${unica.id}`, { replace: true });
          return;
        }

        // Tiene varias bodas → que elija una
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
      // Ya tenemos la boda en la URL → cargamos resumen
      fetchResumen(bodaId);
    } else {
      // No hay ?boda=ID → vemos cuántas bodas tiene el usuario
      fetchBodasUsuario();
    }
  }, [bodaId, navigate]);

  // ======== ESTADOS DE CARGA / ERROR ========

  if (estado === "loading") {
    return (
      <div className="p-6">
        <p className="text-slate-700">Cargando datos de tus bodas...</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="p-6">
        <div className="max-w-lg bg-white border border-rose-200 rounded-2xl px-4 py-3">
          <h1 className="text-base font-semibold text-rose-700 mb-1">
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
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Elige la boda que quieres gestionar
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Tienes varias bodas asociadas a tu cuenta. Selecciona una para ver su
          dashboard y configuración.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bodasUsuario.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/panel?boda=${b.id}`)}
              className="text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-400 hover:shadow-sm transition"
            >
              <p className="text-sm font-semibold text-slate-900">
                {b.nombre_pareja || `Boda #${b.id}`}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Fecha: {b.fecha_boda ?? "Sin fecha definida"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
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

  const progressConfirmados = porcentajes.confirmados || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard de la boda
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {boda?.nombre_pareja
              ? `Boda de ${boda.nombre_pareja}`
              : "Resumen general de tu boda"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/panel/configuracion?boda=${bodaId}`)}
            className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-100"
          >
            Configuración de la boda
          </button>
          <button
            onClick={() => navigate(`/panel/invitados?boda=${bodaId}`)}
            className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-100"
          >
            Invitados y links RSVP
          </button>
          <button
            onClick={() =>
              window.open(`/boda/${boda?.subdominio || ""}`, "_blank")
            }
            className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
          >
            Ver página pública
          </button>
        </div>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Invitados totales
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalInvitados}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Personas registradas en la lista.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-4">
          <p className="text-xs font-medium text-emerald-700 uppercase">
            Confirmados
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-800">
            {totalConfirmados}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Asistentes confirmados ({porcentajes.confirmados}%).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4">
          <p className="text-xs font-medium text-amber-700 uppercase">
            Pendientes
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-800">
            {totalPendientes}
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Invitados sin respuesta aún.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 p-4">
          <p className="text-xs font-medium text-rose-700 uppercase">
            Rechazados
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-800">
            {totalRechazados}
          </p>
          <p className="mt-1 text-xs text-rose-700">
            No podrán asistir al evento.
          </p>
        </div>
      </div>

      {/* Progreso + métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Progreso de confirmación
          </h2>
          <p className="text-xs text-slate-600 mb-3">
            {totalInvitados > 0
              ? `${totalConfirmados} de ${totalInvitados} invitados han confirmado asistencia.`
              : "Aún no hay invitados registrados."}
          </p>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-3 bg-slate-900 rounded-full transition-all"
              style={{ width: `${progressConfirmados}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
            <span>
              Confirmados: <strong>{porcentajes.confirmados}%</strong>
            </span>
            <span>
              Pendientes: <strong>{porcentajes.pendientes}%</strong>
            </span>
            <span>
              Rechazados: <strong>{porcentajes.rechazados}%</strong>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Asistentes estimados
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {totalAsistentes}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Sumatoria de pases de quienes han confirmado.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Fotos subidas
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {fotos?.total || 0}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Imágenes activas en la página pública.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Vistas de la página
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {totalVistas}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Veces que la página pública ha sido visitada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
