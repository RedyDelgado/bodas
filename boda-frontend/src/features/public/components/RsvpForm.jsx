import { useState } from "react";
import axiosClient from "../../../shared/config/axiosClient";

export function RsvpForm({ initialCode = "" }) {
  const [codigo, setCodigo] = useState(initialCode);
  const [respuesta, setRespuesta] = useState("confirmado"); // confirmado | rechazado
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado("loading");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        codigo,
        respuesta,
        cantidad_personas: Number(cantidadPersonas) || 1,
        mensaje: mensaje || null,
      };

      const res = await axiosClient.post("/public/rsvp", payload);

      setEstado("success");
      setSuccessMsg(
        res.data?.message || "Respuesta registrada correctamente. ¡Gracias por confirmar!"
      );
    } catch (error) {
      console.error(error);
      setEstado("error");

      if (error.response?.status === 404) {
        setErrorMsg("No encontramos esta invitación. Verifica tu código.");
      } else if (error.response?.status === 422) {
        setErrorMsg("Por favor revisa los datos ingresados.");
      } else {
        setErrorMsg("Ocurrió un error al registrar tu respuesta. Inténtalo nuevamente.");
      }
    } finally {
      setEstado((prev) => (prev === "loading" ? "idle" : prev));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-left">
        Confirma tu asistencia
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm md:text-base">
        {/* Código de invitación */}
        <div>
          <label className="block text-slate-800 font-medium mb-1">
            Código de invitación
          </label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            placeholder="Ej: AB3D9KLP"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Este código viene en tu mensaje de invitación.
          </p>
        </div>

        {/* Respuesta: confirmado / rechazado */}
        <div>
          <label className="block text-slate-800 font-medium mb-1">
            ¿Podrás acompañarnos?
          </label>
          <div className="flex flex-col md:flex-row gap-2">
            <button
              type="button"
              onClick={() => setRespuesta("confirmado")}
              className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium ${
                respuesta === "confirmado"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              Sí, asistiré
            </button>
            <button
              type="button"
              onClick={() => setRespuesta("rechazado")}
              className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium ${
                respuesta === "rechazado"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-slate-300"
              }`}
            >
              No podré asistir
            </button>
          </div>
        </div>

        {/* Cantidad de personas (pases) */}
        <div>
          <label className="block text-slate-800 font-medium mb-1">
            Número de personas que asistirán
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={cantidadPersonas}
            onChange={(e) => setCantidadPersonas(e.target.value)}
            className="w-full md:w-40 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            Incluyéndote a ti. Si solo vas tú, deja 1.
          </p>
        </div>

        {/* Mensaje opcional */}
        <div>
          <label className="block text-slate-800 font-medium mb-1">
            Mensaje para los novios (opcional)
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            placeholder="Ej: Llegaremos sobre las 7 pm, uno de nosotros es vegetariano..."
          />
        </div>

        {/* Mensajes de estado */}
        {errorMsg && (
          <p className="text-sm text-red-600">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="text-sm text-emerald-600">
            {successMsg}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={estado === "loading"}
            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {estado === "loading" ? "Enviando..." : "Enviar respuesta"}
          </button>
        </div>
      </form>
    </div>
  );
}
