// src/features/public/templates/Plantilla01.jsx
import { useEffect, useMemo, useState } from "react";
import { registrarRsvp } from "../services/publicRsvpService";

/**
 * Formatea una fecha tipo "YYYY-MM-DD" a algo como:
 * "jueves, 2 de julio de 2026"
 */
function formatFechaLarga(fechaStr) {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return fechaStr;

  return fecha.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Convierte una hora "HH:MM[:SS]" a "HH:MM" en locale es-PE
 */
function formatHoraCorta(horaStr) {
  if (!horaStr) return "";
  const [h, m] = horaStr.split(":");
  if (!h) return horaStr;

  const fecha = new Date();
  fecha.setHours(parseInt(h, 10), parseInt(m || "0", 10), 0, 0);

  return fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Plantilla01
 * ----------- 
 * Props:
 * - boda: objeto con datos generales (nombre_pareja, nombre_novio_1, nombre_novio_2, fecha_boda, ciudad, etc.)
 * - configuracion: objeto con textos y detalles (texto_bienvenida, lugar_ceremonia, hora_ceremonia, etc.)
 * - fotos: arreglo de fotos [{ id, url_publica / url / ruta, ... }]
 */
export default function Plantilla01({ boda, configuracion, fotos }) {
  // ===================== COUNTDOWN =====================
  const [countdown, setCountdown] = useState({
    dias: "--",
    horas: "--",
    minutos: "--",
    segundos: "--",
  });

  const fechaBoda = boda?.fecha_boda ? new Date(boda.fecha_boda) : null;

  useEffect(() => {
    if (!fechaBoda || isNaN(fechaBoda.getTime())) return;

    const timer = setInterval(() => {
      const ahora = new Date().getTime();
      const evento = fechaBoda.getTime();
      const diff = evento - ahora;

      if (diff <= 0) {
        setCountdown({
          dias: "00",
          horas: "00",
          minutos: "00",
          segundos: "00",
        });
        clearInterval(timer);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown({
        dias: d.toString().padStart(2, "0"),
        horas: h.toString().padStart(2, "0"),
        minutos: m.toString().padStart(2, "0"),
        segundos: s.toString().padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fechaBoda]);

  // ===================== TEXTOS DERIVADOS =====================
  const tituloPrincipal = useMemo(() => {
    if (configuracion?.titulo_principal) return configuracion.titulo_principal;
    if (boda?.nombre_pareja) return boda.nombre_pareja;
    if (boda?.nombre_novio_1 && boda?.nombre_novio_2) {
      return `${boda.nombre_novio_1} & ${boda.nombre_novio_2}`;
    }
    return "Nuestra boda";
  }, [boda, configuracion]);

  const fechaLarga = formatFechaLarga(boda?.fecha_boda);
  const textoBienvenida =
    configuracion?.texto_bienvenida ||
    "Nos llena de alegría compartir este día tan especial contigo. Acompáñanos a celebrar nuestro amor.";

  const lugarCeremonia =
    configuracion?.lugar_ceremonia || configuracion?.lugar_evento;
  const horaCeremonia = formatHoraCorta(configuracion?.hora_ceremonia);
  const direccionCeremonia = configuracion?.direccion_ceremonia;

  const lugarRecepcion = configuracion?.lugar_recepcion;
  const horaRecepcion = formatHoraCorta(configuracion?.hora_recepcion);
  const direccionRecepcion = configuracion?.direccion_recepcion;

  const dressCode = configuracion?.dress_code || "Elegante / Formal";
  const mensajeFinal =
    configuracion?.frase_final ||
    "Tu presencia es nuestro mejor regalo. Gracias por acompañarnos en este día irrepetible.";

  // ===================== FOTOS =====================
  const fotosLimpias = Array.isArray(fotos) ? fotos : [];
  const fotoPrincipal = fotosLimpias[0];
  const urlFotoPrincipal =
    fotoPrincipal?.url_publica ||
    fotoPrincipal?.url ||
    fotoPrincipal?.ruta ||
    "";

  // ===================== RSVP (API /public/rsvp) =====================
  const [codigoRsvp, setCodigoRsvp] = useState("");
  const [rsvpCantidad, setRsvpCantidad] = useState(1);
  const [rsvpMensaje, setRsvpMensaje] = useState("");
  const [rsvpEstado, setRsvpEstado] = useState("idle"); // idle | loading | ok | error
  const [rsvpMensajeEstado, setRsvpMensajeEstado] = useState("");

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();

    if (!codigoRsvp.trim()) {
      setRsvpEstado("error");
      setRsvpMensajeEstado("Por favor ingresa el código de invitación.");
      return;
    }

    try {
      setRsvpEstado("loading");
      setRsvpMensajeEstado("");

      const data = await registrarRsvp({
        codigo: codigoRsvp.trim(),
        cantidad_personas: Number(rsvpCantidad) || 1,
        mensaje: rsvpMensaje.trim(),
      });

      setRsvpEstado("ok");
      setRsvpMensajeEstado(
        data?.message ||
          "¡Gracias! Tu asistencia ha sido confirmada. Nos vemos en la boda."
      );
    } catch (error) {
      console.error(error);
      setRsvpEstado("error");

      if (error.response?.status === 404) {
        setRsvpMensajeEstado(
          error.response?.data?.message ||
            "No encontramos un invitado con ese código. Verifica e inténtalo nuevamente."
        );
      } else if (error.response?.status === 422) {
        setRsvpMensajeEstado(
          error.response?.data?.message ||
            "No se pudo registrar tu asistencia. Revisa los datos e inténtalo de nuevo."
        );
      } else {
        setRsvpMensajeEstado(
          "Ocurrió un problema al registrar tu asistencia. Inténtalo otra vez en unos minutos."
        );
      }
    }
  };

  // ===================== RENDER =====================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Fondo degradado */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />

        {/* Imagen de fondo opcional */}
        {urlFotoPrincipal && (
          <div className="absolute inset-0 opacity-30">
            <img
              src={urlFotoPrincipal}
              alt="Foto principal de la pareja"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
          </div>
        )}

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 flex flex-col items-center text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-slate-200/80">
            Estamos a punto de decir &ldquo;sí, acepto&rdquo;
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight">
            {tituloPrincipal}
          </h1>

          {fechaLarga && (
            <p className="mt-4 text-sm sm:text-base text-slate-200/90">
              {fechaLarga}
              {boda?.ciudad && ` · ${boda.ciudad}`}
            </p>
          )}

          {/* Countdown */}
          {fechaBoda && (
            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              {["DÍAS", "HORAS", "MINUTOS", "SEGUNDOS"].map((label, idx) => {
                const key = ["dias", "horas", "minutos", "segundos"][idx];
                return (
                  <div
                    key={label}
                    className="w-20 sm:w-24 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 sm:px-4 sm:py-3"
                  >
                    <p className="text-lg sm:text-2xl font-semibold">
                      {countdown[key]}
                    </p>
                    <p className="mt-1 text-[10px] sm:text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-8 max-w-xl text-sm sm:text-base text-slate-200/95">
            {textoBienvenida}
          </p>
        </div>
      </section>

      {/* DETALLES PRINCIPALES */}
      <section className="bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
          {/* Ceremonia & Recepción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-2">
                Ceremonia
              </p>
              {lugarCeremonia ? (
                <>
                  <h2 className="text-lg font-semibold text-slate-50">
                    {lugarCeremonia}
                  </h2>
                  {(horaCeremonia || direccionCeremonia) && (
                    <p className="mt-2 text-sm text-slate-200/90">
                      {horaCeremonia && (
                        <span className="block">
                          Hora: <strong>{horaCeremonia}</strong>
                        </span>
                      )}
                      {direccionCeremonia && (
                        <span className="block mt-1">{direccionCeremonia}</span>
                      )}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  Muy pronto confirmaremos los detalles de la ceremonia.
                </p>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-2">
                Recepción
              </p>
              {lugarRecepcion ? (
                <>
                  <h2 className="text-lg font-semibold text-slate-50">
                    {lugarRecepcion}
                  </h2>
                  {(horaRecepcion || direccionRecepcion) && (
                    <p className="mt-2 text-sm text-slate-200/90">
                      {horaRecepcion && (
                        <span className="block">
                          Hora: <strong>{horaRecepcion}</strong>
                        </span>
                      )}
                      {direccionRecepcion && (
                        <span className="block mt-1">
                          {direccionRecepcion}
                        </span>
                      )}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  Estamos ultimando los detalles de la recepción.
                </p>
              )}
            </div>
          </div>

          {/* Dress code / mensaje final */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-2">
                Dress code
              </p>
              <p className="text-sm text-slate-100">{dressCode}</p>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 md:max-w-md">
              {mensajeFinal}
            </p>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      {fotosLimpias.length > 0 && (
        <section className="bg-slate-950">
          <div className="max-w-5xl mx-auto px-4 pb-12 sm:pb-16">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-3">
              Momentos
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-4">
              Nuestra historia en fotos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {fotosLimpias.slice(0, 9).map((foto) => {
                const url =
                  foto.url_publica || foto.url || foto.ruta || undefined;
                if (!url) return null;

                return (
                  <div
                    key={foto.id}
                    className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/60"
                  >
                    <img
                      src={url}
                      alt="Foto de la boda"
                      className="w-full h-32 sm:h-40 md:h-48 object-cover hover:scale-[1.02] transition-transform"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN RSVP POR CÓDIGO (envía a /api/public/rsvp) */}
      <section className="bg-slate-900/80 border-t border-slate-800">
        <div className="max-w-xl mx-auto px-4 py-10 sm:py-12 text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-2">
            Confirmar asistencia
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
            ¿Tienes un código de invitación?
          </h2>
          <p className="text-sm text-slate-300 mb-5">
            Ingresa el código que aparece en tu invitación para registrar tu
            asistencia y el número de acompañantes.
          </p>

          <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Código de invitación
                </label>
                <input
                  type="text"
                  value={codigoRsvp}
                  onChange={(e) => setCodigoRsvp(e.target.value.toUpperCase())}
                  placeholder="Ej: AB39KLP"
                  className="w-full rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-100/20"
                  maxLength={16}
                />
              </div>

              <div className="w-full sm:w-32">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Personas
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rsvpCantidad}
                  onChange={(e) => setRsvpCantidad(e.target.value)}
                  className="w-full rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-100/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mensaje (opcional)
              </label>
              <textarea
                rows={3}
                value={rsvpMensaje}
                onChange={(e) => setRsvpMensaje(e.target.value)}
                placeholder="Ej: Iré con mi pareja :)"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-100/20"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                disabled={rsvpEstado === "loading"}
                className="inline-flex justify-center items-center rounded-full bg-slate-50 text-slate-950 text-sm font-medium px-5 py-2 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {rsvpEstado === "loading" ? "Enviando..." : "Confirmar asistencia"}
              </button>

              {rsvpMensajeEstado && (
                <p
                  className={`text-xs text-center sm:text-right ${
                    rsvpEstado === "ok"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {rsvpMensajeEstado}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900/80">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            Con todo nuestro cariño,{" "}
            {boda?.nombre_pareja ||
              `${boda?.nombre_novio_1 ?? ""} ${boda?.nombre_novio_2 ?? ""}`}
          </p>
          <p className="text-[11px] text-slate-500">
            Página creada con ♥ en nuestra plataforma de bodas.
          </p>
        </div>
      </footer>
    </div>
  );
}
