import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rsvpApi } from "../services/rsvpApi";

export function RsvpPage() {
  const { codigo } = useParams();

  const [estado, setEstado] = useState("loading"); // loading | ok | error | enviado
  const [mensajeError, setMensajeError] = useState("");
  const [invitado, setInvitado] = useState(null);

  const [form, setForm] = useState({
    respuesta: "",
    cantidad_personas: 1,
    mensaje: "",
  });

  useEffect(() => {
    const fetchInvitado = async () => {
      try {
        setEstado("loading");
        const resp = await rsvpApi.verificar(codigo);

        setInvitado(resp.invitado);
        setEstado("ok");
      } catch (e) {
        setEstado("error");
        setMensajeError("El código no es válido o no se encontró el invitado.");
      }
    };

    fetchInvitado();
  }, [codigo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const enviar = async (e) => {
    e.preventDefault();

    const payload = {
      codigo,
      respuesta: form.respuesta,
      cantidad_personas: Number(form.cantidad_personas),
      mensaje: form.mensaje,
    };

    try {
      await rsvpApi.registrar(payload);
      setEstado("enviado");
    } catch (e) {
      setMensajeError("No se pudo registrar la respuesta.");
    }
  };

  if (estado === "loading")
    return <p className="p-6 text-slate-700">Validando código...</p>;

  if (estado === "error")
    return (
      <div className="p-6 text-center">
        <p className="text-rose-600 font-semibold">{mensajeError}</p>
      </div>
    );

  if (estado === "enviado")
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          ¡Gracias por confirmar!
        </h1>
        <p className="text-slate-600">
          Tu respuesta fue registrada correctamente.
        </p>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">
        Confirmar asistencia
      </h1>

      <p className="text-slate-700 mb-4">
        Hola <strong>{invitado.nombre_invitado}</strong>, completa tu
        confirmación para la boda.
      </p>

      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 font-medium mb-1">
            ¿Asistirás?
          </label>
          <select
            name="respuesta"
            value={form.respuesta}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Seleccionar</option>
            <option value="confirmado">Sí, asistiré</option>
            <option value="rechazado">No podré asistir</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 font-medium mb-1">
            Número de personas (máx: {invitado.pases})
          </label>
          <input
            type="number"
            name="cantidad_personas"
            min="1"
            max={invitado.pases}
            value={form.cantidad_personas}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 font-medium mb-1">
            Mensaje (opcional)
          </label>
          <textarea
            name="mensaje"
            rows="3"
            value={form.mensaje}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-2 rounded-lg"
        >
          Enviar respuesta
        </button>
      </form>
    </div>
  );
}
