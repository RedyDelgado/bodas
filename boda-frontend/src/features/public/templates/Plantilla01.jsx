// src/features/public/templates/Plantilla01.jsx
import { useEffect, useMemo, useState } from "react";
import { registrarRsvp } from "../services/publicRsvpService";

/**
 * Formatea fecha "YYYY-MM-DD" a:
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
 * Convierte hora "HH:MM[:SS]" a "HH:MM" (locale es-PE)
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
 * Hook sencillo para fade-in + desplazamiento
 */
function useFade(delayMs = 0) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return visible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-4";
}

/**
 * Contenedor que aplica animación de aparición
 */
function FadeIn({ delay = 0, children }) {
  const cls = useFade(delay);
  return (
    <div
      className={`transition-all duration-700 ease-out ${cls}`}
    >
      {children}
    </div>
  );
}

/**
 * Plantilla01
 * -----------
 * Props:
 * - boda
 * - configuracion
 * - fotos
 */
export default function Plantilla01({ boda, configuracion, fotos }) {
  // ===================== COUNTDOWN =====================
  const [countdown, setCountdown] = useState({
    dias: "--",
    horas: "--",
    minutos: "--",
    segundos: "--",
  });

  const fechaBoda =
    boda?.fecha_boda && !isNaN(new Date(boda.fecha_boda))
      ? new Date(boda.fecha_boda)
      : null;

  useEffect(() => {
    if (!fechaBoda) return;

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

  // ===================== FOTOS / HERO CARRUSEL =====================
  const fotosLimpias = Array.isArray(fotos) ? fotos : [];
  const heroSlides =
    fotosLimpias.length > 0
      ? fotosLimpias.map((f, idx) => ({
          id: f.id ?? idx,
          title: tituloPrincipal,
          subtitle: fechaLarga || "",
          image: f.url_publica || f.url || f.ruta || "",
        }))
      : [
          {
            id: 1,
            title: "Un día para celebrar el amor",
            subtitle: "Quillabamba, clima tropical y gente que queremos.",
            image:
              "https://images.pexels.com/photos/3137077/pexels-photo-3137077.jpeg?auto=compress&cs=tinysrgb&w=1600",
          },
          {
            id: 2,
            title: "Detalles en azul acero y dorado",
            subtitle: "Inspirados en la elegancia y el clima cálido.",
            image:
              "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1600",
          },
          {
            id: 3,
            title: "Una noche para recordar",
            subtitle: "Música, baile y momentos inolvidables.",
            image:
              "https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg?auto=compress&cs=tinysrgb&w=1600",
          },
        ];

  const [heroIndex, setHeroIndex] = useState(0);
  const heroActual = heroSlides[heroIndex] || heroSlides[0];

  useEffect(() => {
    if (!heroSlides.length) return;
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const urlHero = heroActual?.image || "";

  // ===================== GALERÍA MODAL =====================
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextLightbox = () => {
    if (!fotosLimpias.length) return;
    setLightboxIndex((prev) => (prev + 1) % fotosLimpias.length);
  };

  const prevLightbox = () => {
    if (!fotosLimpias.length) return;
    setLightboxIndex((prev) =>
      (prev - 1 + fotosLimpias.length) % fotosLimpias.length
    );
  };

  const fotoLightbox =
    fotosLimpias[lightboxIndex] && (fotosLimpias[lightboxIndex].url_publica ||
      fotosLimpias[lightboxIndex].url ||
      fotosLimpias[lightboxIndex].ruta);

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
    <div className="min-h-screen bg-[#F8F4E3] text-slate-900">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Fondo degradado con “burbujas” */}
        <div className="absolute inset-0 bg-[#2C3E50]/95">
          <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#D4AF37]/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-24 w-80 h-80 bg-[#E67E73]/35 rounded-full blur-3xl" />
        </div>

        {/* HERO content */}
        <div className="relative z-10 w-full max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[5fr,4fr] items-center">
            {/* Carrusel imagen principal */}
            <FadeIn>
              <div className="relative overflow-hidden lg:rounded-[2.5rem] shadow-xl">
                {urlHero && (
                  <div className="relative">
                    <img
                      src={urlHero}
                      alt={heroActual?.title || "Foto principal"}
                      className="h-[26rem] sm:h-[30rem] lg:h-[80vh] w-full object-cover transform scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/90 via-[#2C3E50]/40 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-[#F8F4E3] drop-shadow">
                      <p className="font-serif text-3xl md:text-4xl mb-1">
                        {heroActual?.title || tituloPrincipal}
                      </p>
                      {heroActual?.subtitle && (
                        <p className="text-xs md:text-sm text-[#F8F4E3]/90">
                          {heroActual.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Controles de carrusel */}
                {heroSlides.length > 1 && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#2C3E50]/70 rounded-full px-3 py-1.5 text-xs text-[#F8F4E3]/90">
                    <span>{heroIndex + 1 + "/" + heroSlides.length}</span>
                    <div className="flex gap-1">
                      {heroSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setHeroIndex(idx)}
                          className={
                            "h-1.5 rounded-full transition-all " +
                            (idx === heroIndex
                              ? "bg-[#D4AF37] w-4"
                              : "bg-[#F8F4E3]/40 w-3")
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Texto, countdown y mensaje principal */}
            <FadeIn delay={120}>
              <div className="text-[#F8F4E3]">
                <p className="uppercase tracking-[0.3em] text-xs text-[#D4AF37]/90 mb-3">
                  {boda?.ciudad || "Boda en Quillabamba"}
                </p>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight mb-2">
                  {tituloPrincipal}
                </h1>
                {fechaLarga && (
                  <p className="text-lg md:text-xl mb-4 text-[#F8F4E3]/90">
                    {fechaLarga}
                  </p>
                )}

                {/* Countdown */}
                {fechaBoda && (
                  <div className="inline-flex rounded-2xl bg-[#2C3E50]/40 border border-[#F8F4E3]/20 px-4 py-3 backdrop-blur-sm mb-6">
                    <div className="flex gap-4 text-center text-sm">
                      {[
                        ["DÍAS", "dias"],
                        ["HORAS", "horas"],
                        ["MIN", "minutos"],
                        ["SEG", "segundos"],
                      ].map(([label, key]) => (
                        <div
                          key={label}
                          className="flex flex-col items-center min-w-[2.5rem]"
                        >
                          <span className="text-lg font-semibold">
                            {countdown[key]}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#F8F4E3]/70">
                            {label.toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm md:text-base text-[#F8F4E3]/95 mb-6 max-w-md">
                  {textoBienvenida}
                </p>

                <div className="text-[11px] text-[#F8F4E3]/70 flex flex-col items-start gap-1">
                  <span>Desplázate para conocer más</span>
                  <span className="mt-1 animate-bounce">▼</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ================= RESUMEN DEL DÍA ================= */}
      <FadeIn delay={160}>
        <section className="bg-[#F8F4E3] py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#F8F4E3] shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-serif text-xl text-[#2C3E50] mb-1">
                  Detalles de la celebración
                </h2>
                <p className="text-sm text-slate-600">
                  Aquí encontrarás la información clave para acompañarnos en
                  este día irrepetible.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="px-4 py-2 rounded-full bg-[#E6E7E3] text-[#2C3E50] font-semibold">
                  {fechaLarga || "Fecha por confirmar"}
                </span>
                {boda?.ciudad && (
                  <span className="px-4 py-2 rounded-full bg-[#D4AF37]/30 text-[#2C3E50] font-semibold">
                    {boda.ciudad}
                  </span>
                )}
                <span className="px-4 py-2 rounded-full bg-[#E67E73]/25 text-[#2C3E50] font-semibold">
                  Dress code: {dressCode}
                </span>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ================= CEREMONIA / RECEPCIÓN ================= */}
      <FadeIn delay={200}>
        <section className="bg-[#F8F4E3]">
          <div className="max-w-4xl mx-auto px-4 pb-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ceremonia */}
              <div className="bg-white/95 border border-[#F8F4E3] rounded-3xl p-6 shadow-sm">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-2">
                  Ceremonia
                </p>
                {lugarCeremonia ? (
                  <>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">
                      {lugarCeremonia}
                    </h3>
                    {(horaCeremonia || direccionCeremonia) && (
                      <p className="mt-2 text-sm text-slate-700">
                        {horaCeremonia && (
                          <span className="block">
                            Hora: <strong>{horaCeremonia}</strong>
                          </span>
                        )}
                        {direccionCeremonia && (
                          <span className="block mt-1">
                            {direccionCeremonia}
                          </span>
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Muy pronto confirmaremos los detalles de la ceremonia.
                  </p>
                )}
              </div>

              {/* Recepción */}
              <div className="bg-white/95 border border-[#F8F4E3] rounded-3xl p-6 shadow-sm">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-2">
                  Recepción
                </p>
                {lugarRecepcion ? (
                  <>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">
                      {lugarRecepcion}
                    </h3>
                    {(horaRecepcion || direccionRecepcion) && (
                      <p className="mt-2 text-sm text-slate-700">
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
                  <p className="text-sm text-slate-500">
                    Estamos ultimando los detalles de la recepción.
                  </p>
                )}
              </div>
            </div>

            {/* Dress code + mensaje final */}
            <div className="bg-white/95 border border-[#F8F4E3] rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-2">
                  Dress code
                </p>
                <p className="text-sm text-slate-800">{dressCode}</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 md:max-w-md">
                {mensajeFinal}
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ================= NUESTRA HISTORIA ================= */}
      <FadeIn delay={240}>
        <section className="bg-[#F8F4E3] py-10 px-4">
          <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[2.2fr,1.8fr] items-center">
            <div>
              <p className="text-3xl text-[#2C3E50] mb-1 font-serif">
                Nuestra historia
              </p>
              <h2 className="text-2xl text-[#2C3E50] mb-4 font-serif">
                De {boda?.ciudad || "nuestra ciudad"} al altar
              </h2>
              <p className="text-sm text-slate-700 mb-3">
                {configuracion?.texto_historia ||
                  "Este espacio está pensado para contar, con tus propias palabras, cómo se conocieron y qué los une. Puedes hablar de los inicios, los retos que superaron juntos y los motivos por los que decidieron dar este gran paso."}
              </p>
              <p className="text-sm text-slate-700 mb-3">
                "La idea es que cada invitado sienta que está entrando a un
                momento íntimo y significativo, más allá de una fiesta."
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#F8F4E3] shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  {/* Icono anillo */}
                  <span className="text-[#2C3E50] text-lg">💍</span>
                </div>
                <div>
                  <p className="text-base text-[#2C3E50] font-semibold">
                    El compromiso
                  </p>
                  <p className="text-xs text-slate-600">
                    Un pequeño resumen del momento en que decidieron dar este
                    paso (puedes ajustar el texto en configuración).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[#2C3E50] text-lg">✈️</span>
                </div>
                <div>
                  <p className="text-base text-[#2C3E50] font-semibold">
                    Aventuras juntos
                  </p>
                  <p className="text-xs text-slate-600">
                    Viajes, proyectos y sueños compartidos que los han traído
                    hasta aquí.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[#2C3E50] text-lg">🌴</span>
                </div>
                <div>
                  <p className="text-base text-[#2C3E50] font-semibold">
                    {boda?.ciudad || "Quillabamba"} en el corazón
                  </p>
                  <p className="text-xs text-slate-600">
                    La ciudad, el clima y la gente que hacen especial esta
                    celebración.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ================= PADRES Y PADRINOS (OPCIONAL) ================= */}
      <FadeIn delay={280}>
        <section className="bg-[#E6E7E3]/70 py-10 px-4">
          <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-3xl border border-[#F8F4E3] shadow-md p-6 md:p-8">
            <h2 className="text-2xl text-[#2C3E50] mb-4 text-center font-serif">
              Nuestros padres y padrinos
            </h2>
            <p className="text-xs text-slate-600 text-center mb-6 max-w-2xl mx-auto">
              Puedes usar este espacio para mencionar a quienes los han
              acompañado, cuidado y guiado hasta este momento tan especial.
            </p>
            <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-800">
              <div className="space-y-3">
                <p className="font-semibold text-[#2C3E50]">Novios</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {boda?.nombre_pareja ||
                      `${boda?.nombre_novio_1 ?? ""} ${boda?.nombre_novio_2 ?? ""}`}
                  </li>
                </ul>

                <p className="font-semibold text-[#2C3E50] mt-3">
                  Padres del novio
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{configuracion?.padres_novio || "Por definir"}</li>
                </ul>

                <p className="font-semibold text-[#2C3E50] mt-3">
                  Padres de la novia
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{configuracion?.padres_novia || "Por definir"}</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-[#2C3E50]">Padrinos</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{configuracion?.padrinos_mayores || "Padrinos principales"}</li>
                  <li>{configuracion?.padrinos_civiles || "Padrinos civiles"}</li>
                </ul>

                <p className="font-semibold text-[#2C3E50] mt-4">
                  Día y horarios
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>{fechaLarga || "Fecha principal por confirmar"}</li>
                  {horaCeremonia && (
                    <li>Matrimonio religioso: {horaCeremonia}</li>
                  )}
                  {horaRecepcion && (
                    <li>Matrimonio civil / recepción: {horaRecepcion}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ================= GALERÍA ================= */}
      {fotosLimpias.length > 0 && (
        <FadeIn delay={320}>
          <section className="bg-[#F8F4E3] py-10 px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-3">
                Momentos
              </p>
              <h2 className="text-xl sm:text-2xl font-serif text-[#2C3E50] mb-4">
                Nuestra historia en fotos
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {fotosLimpias.slice(0, 9).map((foto, idx) => {
                  const url =
                    foto.url_publica || foto.url || foto.ruta || undefined;
                  if (!url) return null;

                  return (
                    <button
                      type="button"
                      key={foto.id ?? idx}
                      onClick={() => openLightbox(idx)}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group"
                    >
                      <img
                        src={url}
                        alt="Foto de la boda"
                        className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* ================= RSVP ================= */}
      <FadeIn delay={360}>
        <section className="bg-[#2C3E50] text-[#F8F4E3] border-t border-[#1f2a35]">
          <div className="max-w-xl mx-auto px-4 py-10 sm:py-12 text-center">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37]/90 uppercase mb-2">
              Confirmar asistencia
            </p>
            <h2 className="text-xl sm:text-2xl font-serif mb-2">
              ¿Tienes un código de invitación?
            </h2>
            <p className="text-sm text-[#F8F4E3]/90 mb-5">
              Ingresa el código que aparece en tu invitación para registrar tu
              asistencia y el número de acompañantes.
            </p>

            <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#F8F4E3]/80 mb-1">
                    Código de invitación
                  </label>
                  <input
                    type="text"
                    value={codigoRsvp}
                    onChange={(e) =>
                      setCodigoRsvp(e.target.value.toUpperCase())
                    }
                    placeholder="Ej: AB39KLP"
                    className="w-full rounded-full border border-[#F8F4E3]/40 bg-[#1f2a35]/70 text-[#F8F4E3] placeholder:text-[#F8F4E3]/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    maxLength={16}
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="block text-xs font-medium text-[#F8F4E3]/80 mb-1">
                    Personas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rsvpCantidad}
                    onChange={(e) => setRsvpCantidad(e.target.value)}
                    className="w-full rounded-full border border-[#F8F4E3]/40 bg-[#1f2a35]/70 text-[#F8F4E3] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8F4E3]/80 mb-1">
                  Mensaje (opcional)
                </label>
                <textarea
                  rows={3}
                  value={rsvpMensaje}
                  onChange={(e) => setRsvpMensaje(e.target.value)}
                  placeholder="Ej: Iré con mi pareja :)"
                  className="w-full rounded-2xl border border-[#F8F4E3]/40 bg-[#1f2a35]/70 text-[#F8F4E3] placeholder:text-[#F8F4E3]/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={rsvpEstado === "loading"}
                  className="inline-flex justify-center items-center rounded-full bg-[#D4AF37] text-[#2C3E50] text-sm font-semibold px-5 py-2 hover:bg-[#d4b84d] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {rsvpEstado === "loading"
                    ? "Enviando..."
                    : "Confirmar asistencia"}
                </button>

                {rsvpMensajeEstado && (
                  <p
                    className={`text-xs text-center sm:text-right ${
                      rsvpEstado === "ok"
                        ? "text-emerald-300"
                        : "text-[#FFC9C9]"
                    }`}
                  >
                    {rsvpMensajeEstado}
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>
      </FadeIn>

      {/* ================= FOOTER ================= */}
      <FadeIn delay={400}>
        <footer className="bg-[#121821] border-t border-[#1f2a35] text-[#F8F4E3]/80">
          <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[11px]">
              Con todo nuestro cariño,{" "}
              {boda?.nombre_pareja ||
                `${boda?.nombre_novio_1 ?? ""} ${boda?.nombre_novio_2 ?? ""}`}
            </p>
            <p className="text-[11px]">
              Página creada con ♥ en nuestra plataforma de bodas.
            </p>
          </div>
        </footer>
      </FadeIn>

      {/* ================= LIGHTBOX GALERÍA ================= */}
      {lightboxOpen && fotoLightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-3xl w-full mx-4 rounded-3xl overflow-hidden border border-[#D4AF37]/60 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-3 right-3 text-[#F8F4E3]/80 hover:text-white text-xl leading-none px-2"
            >
              ×
            </button>
            <img
              src={fotoLightbox}
              alt="Foto ampliada"
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            <div className="flex items-center justify-between px-4 py-3 text-xs text-[#F8F4E3]/80 bg-[#111827]/90">
              <button
                type="button"
                onClick={prevLightbox}
                className="hover:text-white"
              >
                ◀ Anterior
              </button>
              <span>
                {lightboxIndex + 1}/{fotosLimpias.length}
              </span>
              <button
                type="button"
                onClick={nextLightbox}
                className="hover:text-white"
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
