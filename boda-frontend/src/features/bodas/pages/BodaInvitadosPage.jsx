import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { invitadosApi } from "../services/invitadosApiService";

export function BodaInvitadosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bodaId = searchParams.get("boda"); // /panel/invitados?boda=ID

  const [estado, setEstado] = useState("loading"); // loading | ok | error
  const [mensajeError, setMensajeError] = useState("");
  const [invitados, setInvitados] = useState([]);

  // formulario rápido para crear un invitado
  const [form, setForm] = useState({
    nombre_invitado: "",
    codigo_clave: "",
    pases: 1,
  });

  useEffect(() => {
    if (!bodaId) {
      setEstado("error");
      setMensajeError(
        "No se especificó la boda. Ingresa desde el dashboard o añade ?boda=ID en la URL."
      );
      return;
    }

    const fetchInvitados = async () => {
      try {
        setEstado("loading");
        const data = await invitadosApi.listarPorBoda(bodaId);
        // asumo que el controlador devuelve un array simple
        setInvitados(Array.isArray(data) ? data : data.data ?? []);
        setEstado("ok");
      } catch (error) {
        console.error(error);
        setEstado("error");
        if (error.response?.status === 403) {
          setMensajeError("No tienes permisos para ver los invitados de esta boda.");
        } else {
          setMensajeError(
            "Ocurrió un error al cargar la lista de invitados."
          );
        }
      }
    };

    fetchInvitados();
  }, [bodaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pases" ? Number(value) || 0 : value,
    }));
  };

  const handleCrearInvitado = async (e) => {
    e.preventDefault();
    if (!form.nombre_invitado || !form.codigo_clave) return;

    try {
      const payload = {
        nombre_invitado: form.nombre_invitado,
        codigo_clave: form.codigo_clave,
        pases: form.pases || 1,
      };

      const nuevo = await invitadosApi.crear(bodaId, payload);

      // según tu controlador, puede devolver solo el invitado o { message, invitado }
      const invitado = nuevo.invitado ?? nuevo;
      setInvitados((prev) => [invitado, ...prev]);

      setForm({
        nombre_invitado: "",
        codigo_clave: "",
        pases: 1,
      });
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el invitado. Revisa los datos.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este invitado?")) return;

    try {
      await invitadosApi.eliminar(id);
      setInvitados((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el invitado.");
    }
  };

  const handleConfirmar = async (id) => {
    try {
      const resp = await invitadosApi.confirmar(id);
      const invitadoActualizado = resp.invitado ?? resp;

      setInvitados((prev) =>
        prev.map((i) => (i.id === id ? invitadoActualizado : i))
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar como confirmado.");
    }
  };

  if (estado === "loading") {
    return (
      <div className="p-6">
        <p className="text-slate-700">Cargando invitados...</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="p-6">
        <div className="max-w-lg bg-white border border-rose-200 rounded-2xl px-4 py-3">
          <h1 className="text-base font-semibold text-rose-700 mb-1">
            No se pudo cargar la lista de invitados
          </h1>
          <p className="text-sm text-slate-700">{mensajeError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Invitados y RSVP
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gestiona la lista de invitados para esta boda, sus pases y su estado
            de confirmación.
          </p>
        </div>

        <button
          onClick={() => navigate(`/panel?boda=${bodaId}`)}
          className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-100"
        >
          Volver al dashboard
        </button>
      </div>

      {/* Formulario rápido para crear invitado */}
      <form
        onSubmit={handleCrearInvitado}
        className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold text-slate-900">
          Añadir invitado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre del invitado
            </label>
            <input
              type="text"
              name="nombre_invitado"
              value={form.nombre_invitado}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Código / clave
            </label>
            <input
              type="text"
              name="codigo_clave"
              value={form.codigo_clave}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Ej: AB39KLP"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Este código se usará para el link de RSVP del invitado.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Número de pases
            </label>
            <input
              type="number"
              min={1}
              name="pases"
              value={form.pases}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
          >
            Guardar invitado
          </button>
        </div>
      </form>

      {/* Tabla de invitados */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Lista de invitados
          </h2>
          <p className="text-xs text-slate-500">
            Total: {invitados.length} invitado(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-2 pr-4 text-left">Nombre</th>
                <th className="py-2 pr-4 text-left">Código</th>
                <th className="py-2 pr-4 text-center">Pases</th>
                <th className="py-2 pr-4 text-left">Estado</th>
                <th className="py-2 pr-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitados.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    Aún no tienes invitados registrados para esta boda.
                  </td>
                </tr>
              )}

              {invitados.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="py-2 pr-4 text-slate-900">
                    {i.nombre_invitado}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono">
                      {i.codigo_clave}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-center text-slate-800">
                    {i.pases ?? 1}
                  </td>
                  <td className="py-2 pr-4">
                    {i.es_confirmado ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-[11px] text-emerald-700">
                        Confirmado
                      </span>
                    ) : i.fecha_confirmacion ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-[11px] text-rose-700">
                        No asiste
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-[11px] text-amber-700">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right space-x-2">
                    {!i.es_confirmado && (
                      <button
                        onClick={() => handleConfirmar(i.id)}
                        className="text-[11px] font-medium text-emerald-700 hover:underline"
                      >
                        Marcar confirmado
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(i.id)}
                      className="text-[11px] font-medium text-rose-700 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
