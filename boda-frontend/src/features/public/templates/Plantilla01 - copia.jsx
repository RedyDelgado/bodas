// src/features/public/templates/Plantilla01.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useMemo as useReactMemo } from "react";
import { registrarRsvp } from "../services/publicRsvpService";
import {
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiX,
  FiGift,
} from "react-icons/fi";
import { LuFlower2, LuSparkles } from "react-icons/lu";
import { GiPeaceDove } from "react-icons/gi";

/** =================== COLORES PALETA REDY & PATRICIA =================== */
const COLOR_AZUL = "#1E293B"; // Azul marino más cercano al sobre
const COLOR_MARFIL = "#F8F4E3"; // Blanco marfil
const COLOR_DORADO = "#D4AF37"; // Dorado suave
const COLOR_CORAL = "#E67E73"; // Acento cálido

/** =================== BASE URL PARA FOTOS =================== */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STORAGE_BASE_URL =
  import.meta.env.VITE_STORAGE_URL || API_BASE_URL.replace(/\/+$/, "");

/** Normaliza la URL de la foto */
function resolveFotoUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) {
    return `${STORAGE_BASE_URL}${path}`;
  }
  return `${STORAGE_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

/** Fecha larga "jueves, 2 de julio de 2026" */
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

/** Hora corta HH:MM */
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

/** Texto que reemplaza (QEPD)/† por la paloma */
function TextoConPaloma({ texto }) {
  if (!texto) return null;
  const regex = /\(?\s*q\.?\s*e\.?\s*p\.?\s*d\.?\s*\)?|†/gi;
  const partes = texto.split(regex);
  const coincidencias = texto.match(regex) || [];
  const resultado = [];

  for (let i = 0; i < partes.length; i++) {
    if (partes[i]) resultado.push(<span key={`t-${i}`}>{partes[i]}</span>);
    if (i < coincidencias.length) {
      resultado.push(
        <GiPeaceDove
          key={`d-${i}`}
          className="inline-block w-4 h-4 ml-1 text-[#D4AF37] align-text-bottom"
        />
      );
    }
  }
  return <>{resultado}</>;
}

/** Hook fade-in */
function useFade(delayMs = 0) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";
}

/** Wrapper animado */
function FadeIn({ delay = 0, children }) {
  const cls = useFade(delay);
  return (
    <div className={`transition-all duration-700 ease-out ${cls}`}>
      {children}
    </div>
  );
}

/** Overlay de celebración con "chispas" */
function CelebrationOverlay({ nombres, onClose }) {
  const particles = useReactMemo(() => {
    const colors = [COLOR_DORADO, COLOR_CORAL, COLOR_MARFIL];
    return Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -100%, 0) rotateZ(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translate3d(0, 120vh, 0) rotateZ(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: "-10%",
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.45,
              backgroundColor: p.color,
              borderRadius: 999,
              opacity: 0,
              animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="relative max-w-xl mx-auto text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex items-center justify-center mb-3 text-[#FDE68A] text-xs tracking-[0.3em] uppercase">
          <LuSparkles className="w-4 h-4 mr-1" />
          Confirmado
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3 drop-shadow">
          ¡Tu asistencia ha sido confirmada!
        </h2>
        <p className="text-sm sm:text-base text-[#F8F4E3]/90 mb-4 max-w-lg mx-auto">
          Gracias por decir{" "}
          <span className="font-semibold">“sí, estaré ahí”</span>. Estamos muy
          felices de poder compartir este momento con personas tan importantes
          como tú.
        </p>
        {nombres && (
          <p className="text-sm text-[#F8F4E3]/85 mb-6">
            Con cariño, <span className="font-semibold">{nombres}</span>.
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md hover:shadow-lg transition"
          style={{ backgroundColor: COLOR_MARFIL, color: COLOR_AZUL }}
        >
          Ver detalles de la celebración
        </button>
      </div>
    </div>
  );
}

/** ====================== COMPONENTE PRINCIPAL ====================== */
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
      const ahora = Date.now();
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
    if (configuracion?.frasePrincipal) return configuracion.frasePrincipal;
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

  const textoFechaReligioso =
    configuracion?.textoFechaReligioso ||
    configuracion?.texto_fecha_religioso ||
    "";
  const textoFechaCivil =
    configuracion?.textoFechaCivil || configuracion?.texto_fecha_civil || "";

  const lugarCeremonia =
    configuracion?.localReligioso ||
    configuracion?.lugar_ceremonia ||
    configuracion?.lugar_evento;
  const direccionCeremonia =
    configuracion?.direccion_ceremonia || configuracion?.direccion_evento;
  const horaCeremonia = configuracion?.hora_ceremonia
    ? formatHoraCorta(configuracion.hora_ceremonia)
    : "";

  const lugarRecepcion =
    configuracion?.localRecepcion || configuracion?.lugar_recepcion;
  const direccionRecepcion = configuracion?.direccion_recepcion;
  const horaRecepcion = configuracion?.hora_recepcion
    ? formatHoraCorta(configuracion.hora_recepcion)
    : "";

  const dressCode = configuracion?.dress_code || "Elegante / Formal";

  const mensajeFinal =
    configuracion?.textoMensajeFinal ||
    configuracion?.frase_final ||
    "Tu presencia es nuestro mejor regalo. Gracias por acompañarnos en este día irrepetible.";

  const textoHistoria =
    configuracion?.textoHistoriaPareja ||
    configuracion?.texto_historia ||
    "Este espacio está pensado para contar, con tus propias palabras, cómo se conocieron y qué los une.";

  const cronogramaTexto =
    configuracion?.cronogramaTexto ||
    configuracion?.cronograma_texto ||
    configuracion?.cronograma ||
    "";

  const textoCuentasBancarias =
    configuracion?.textoCuentasBancarias ||
    configuracion?.texto_cuentas_bancarias ||
    "";
  const textoYape = configuracion?.textoYape || configuracion?.texto_yape || "";

  const textoPadresNovio =
    configuracion?.textoPadresNovio ||
    configuracion?.texto_padres_novio ||
    configuracion?.padres_novio ||
    "";
  const textoPadresNovia =
    configuracion?.textoPadresNovia ||
    configuracion?.texto_padres_novia ||
    configuracion?.padres_novia ||
    "";
  const textoPadrinosMayores =
    configuracion?.textoPadrinosMayores ||
    configuracion?.texto_padrinos_mayores ||
    configuracion?.padrinos_mayores ||
    "";
  const textoPadrinosCiviles =
    configuracion?.textoPadrinosCiviles ||
    configuracion?.texto_padrinos_civiles ||
    configuracion?.padrinos_civiles ||
    "";

  // ===================== FOTOS / HERO CARRUSEL =====================
  const fotosLimpias = Array.isArray(fotos) ? fotos : [];

  let fotosPublicas = fotosLimpias.filter((f) => {
    if (!f) return false;
    const valor = f.es_galeria_privada;
    return (
      valor === 0 ||
      valor === "0" ||
      valor === false ||
      valor === null ||
      typeof valor === "undefined"
    );
  });

  if (!fotosPublicas.length) {
    fotosPublicas = fotosLimpias;
  }

  fotosPublicas.sort((a, b) => {
    const portadaA = a.es_portada ? 1 : 0;
    const portadaB = b.es_portada ? 1 : 0;
    if (portadaA !== portadaB) return portadaB - portadaA;
    const ordenA = a.orden ?? 999;
    const ordenB = b.orden ?? 999;
    if (ordenA !== ordenB) return ordenA - ordenB;
    return (a.id || 0) - (b.id || 0);
  });

  const heroSlides =
    fotosPublicas.length > 0
      ? fotosPublicas.map((f, idx) => {
          const img = resolveFotoUrl(
            f.url_publica || f.url || f.ruta || f.url_imagen || ""
          );
          console.log("HERO URL RESUELTA =>", img);
          return {
            id: f.id ?? idx,
            title: tituloPrincipal || "Un día para celebrar el amor",
            subtitle:
              fechaLarga ||
              boda?.ciudad ||
              "Quillabamba, clima tropical y gente que queremos.",
            image: img,
          };
        })
      : [
          {
            id: 1,
            title: "Un día para celebrar el amor",
            subtitle: "Quillabamba, clima tropical y gente que queremos.",
            image:
              "https://images.pexels.com/photos/3137077/pexels-photo-3137077.jpeg?auto=compress&cs=tinysrgb&w=1600",
          },
        ];

  const [heroIndex, setHeroIndex] = useState(0);
  const heroActual = heroSlides[heroIndex] || heroSlides[0];
  const urlHero = heroActual?.image || "";
 

// Permite posición configurable, si algún día la guardas en BD
const heroPosicion =
  configuracion?.heroPosicion || "center 42%"; 
  // 42% = centrado un poquito hacia arriba, para que no corte tanto la parte baja

const heroBgStyle = urlHero
  ? {
      backgroundImage: `url('${urlHero}')`,
      backgroundSize: "cover",
      backgroundPosition: "center 30%", // 30% desde arriba
      backgroundRepeat: "no-repeat",
    }
  : { backgroundColor: "#111827" };




  useEffect(() => {
    if (!heroSlides.length) return;
    const id = setInterval(
      () => setHeroIndex((prev) => (prev + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(id);
  }, [heroSlides.length]);

  // ===================== RSVP =====================
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [codigoRsvp, setCodigoRsvp] = useState("");
  const [rsvpMensaje, setRsvpMensaje] = useState("");
  const [rsvpCelular, setRsvpCelular] = useState("");
  const [rsvpEstado, setRsvpEstado] = useState("idle");
  const [rsvpMensajeEstado, setRsvpMensajeEstado] = useState("");

  const [showCelebration, setShowCelebration] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();

    if (!codigoRsvp.trim()) {
      setRsvpEstado("error");
      setRsvpMensajeEstado("Por favor ingresa el código de invitación.");
      return;
    }

    if (!rsvpCelular.trim() || rsvpCelular.trim().length < 6) {
      setRsvpEstado("error");
      setRsvpMensajeEstado(
        "Por favor ingresa un número de celular válido para enviarte la confirmación."
      );
      return;
    }

    try {
      setRsvpEstado("loading");
      setRsvpMensajeEstado("");

      const payload = {
        codigo: codigoRsvp.trim(),
        mensaje: rsvpMensaje.trim(),
        celular: rsvpCelular.trim(),
      };

      const data = await registrarRsvp(payload);

      setRsvpEstado("ok");
      setRsvpMensajeEstado(
        data?.message ||
          "¡Gracias! Tu asistencia ha sido confirmada. Nos vemos en la boda."
      );

      setShowRsvpModal(false);
      setShowCelebration(true);
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

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setMostrarDetalles(true);
  };

  // ===================== RENDER =====================
  return (
    <div className="min-h-screen bg-marfil text-slate-900">

        {/* ================= HERO ================= */}
<section
  className="relative min-h-[92vh] lg:min-h-[100vh] flex items-center justify-center overflow-hidden"
>
  {/* FONDO DIFUMINADO CON LA MISMA FOTO */}
  {urlHero && (
    <>
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `url('${urlHero}')`,
          backgroundSize: "cover",
          backgroundPosition: heroPosicion,
          backgroundRepeat: "no-repeat",
          filter: "blur(10px)",
          transform: "scale(1.08)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/45" />
    </>
  )}

  {/* SEPARADOR INFERIOR */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="block w-full h-[60px] sm:h-[75px] md:h-[90px]"
    >
      <path
        fill={COLOR_MARFIL}
        d="
          M0,96
          C60,88,120,72,180,68
          C260,63,340,72,420,80
          C520,90,620,102,720,100
          C820,98,920,82,1020,74
          C1120,66,1220,68,1320,76
          C1380,80,1420,88,1440,92
          L1440,120
          L0,120
          Z
        "
      />
    </svg>
  </div>

  {/* CONTENIDO PRINCIPAL: FOTO + TARJETA */}
  <div className="relative z-10 w-full max-w-[1600px] mx-auto px-3 lg:px-8 xl:px-10 py-8 lg:py-12">
    <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-10 lg:justify-between">

      {/* ====== IZQUIERDA: FOTO ENMARCADA (MUY GRANDE) ====== */}
      <div className="w-full lg:w-[58%] xl:w-[60%] flex justify-center lg:justify-start">
        <div className="relative w-full xl:w-[105%] aspect-[16/10]">
          {/* Fondo acuarela */}
          <svg
            viewBox="0 0 400 300"
            className="absolute inset-0 w-full h-full text-[#1E293B]"
          >
            <defs>
              <radialGradient id="acuarelaAzul" cx="30%" cy="15%" r="80%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#1E293B" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.2" />
              </radialGradient>
            </defs>
            <path
              d="
                M10,80
                C40,10,140,0,220,20
                C310,40,360,80,380,140
                C400,200,360,260,280,280
                C200,300,100,290,40,240
                C-10,200,-10,150,10,80
              "
              fill="url(#acuarelaAzul)"
              opacity="0.9"
            />
          </svg>

          {/* Marcos dobles, con menos margen para que la foto se vea más grande */}
          <div className="absolute inset-2 rounded-[2.6rem] border border-white/75 shadow-[0_20px_55px_rgba(15,23,42,0.85)]" />
          <div className="absolute inset-5 rounded-[2.2rem] border border-[#FDE68A]/85" />

          {/* Foto casi a full */}
          <div className="absolute inset-4 rounded-[2.4rem] overflow-hidden bg-[#020617]">
            <img
              src={urlHero}
              alt={tituloPrincipal}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ====== DERECHA: TARJETA INFORMATIVA ====== */}
      <div className="w-full lg:w-[42%] xl:w-[40%] flex justify-center lg:justify-end">
        <div
          className="
            w-full
            max-w-md lg:max-w-md xl:max-w-lg
            lg:mr-1 xl:mr-4
            bg-[#020617]/72
            border border-[#FDE68A]/25
            rounded-[2.5rem]
            shadow-2xl
            backdrop-blur-md
            px-7 md:px-9
            py-7 md:py-9
          "
        >
                {/* --- aquí dentro deja TODO tu contenido actual del card tal cual lo tienes --- */}

                {/* Línea de eventos tipo invitación física */}
                <div className="flex flex-col gap-2 mb-4 border-b border-white/15 pb-3">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#F8F4E3]/80 uppercase tracking-[0.18em]">
                    <div className="flex items-center gap-2">
                      <LuSparkles className="w-4 h-4 text-[#FDE68A]" />
                      <span>Boda en {boda?.ciudad || "Quillabamba"}</span>
                    </div>
                    <span>{fechaLarga || ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-between text-[10px] sm:text-xs text-[#F8F4E3]/85">
                    {horaCeremonia && (
                      <div className="flex items-center gap-1.5">
                        <FiMapPin className="w-3.5 h-3.5" />
                        <span>Religioso {horaCeremonia}</span>
                      </div>
                    )}
                    {horaRecepcion && (
                      <div className="flex items-center gap-1.5">
                        <FiGift className="w-3.5 h-3.5" />
                        <span>Recepción {horaRecepcion}</span>
                      </div>
                    )}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>Cena 6:30 p.m.</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>Vals 7:00 p.m.</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>Fiesta 7:20 p.m.</span>
                    </div>
                  </div>
                </div>

                {/* Título parejas */}
                <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] leading-tight mb-2 text-[#F8F4E3]">
                  {tituloPrincipal}
                </h1>

                {fechaLarga && (
                  <p className="font-serif text-sm md:text-base mb-3 flex items-center gap-2 text-[#F8F4E3]/90">
                    <FiCalendar className="w-4 h-4" />
                    <span>{fechaLarga}</span>
                  </p>
                )}

                {/* Bloques R / C */}
                <div className="space-y-1 text-[11px] sm:text-xs text-[#F8F4E3]/85 mb-3">
                  {textoFechaReligioso && (
                    <p className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px]">
                        R
                      </span>
                      {textoFechaReligioso}
                    </p>
                  )}
                  {textoFechaCivil && (
                    <p className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px]">
                        C
                      </span>
                      {textoFechaCivil}
                    </p>
                  )}
                </div>

                {/* COUNTDOWN */}
                {fechaBoda && (
                  <div className="inline-flex rounded-2xl bg-[#020617]/70 border border-[#F8F4E3]/25 px-4 py-3 backdrop-blur-sm mb-4">
                    <div className="flex gap-4 text-center text-sm items-center">
                      <FiClock className="w-4 h-4 text-[#D4AF37]" />
                      {[
                        ["DÍAS", "dias"],
                        ["HORAS", "horas"],
                        ["MIN", "minutos"],
                        ["SEG", "segundos"],
                      ].map(([label, key]) => (
                        <div
                          key={label}
                          className="flex flex-col items-center min-w-[2.6rem]"
                        >
                          <span className="text-lg font-semibold text-[#F8F4E3]">
                            {countdown[key]}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-[#F8F4E3]/70">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm md:text-[15px] text-[#F8F4E3]/95 mb-5">
                  {textoBienvenida}
                </p>

                {/* BLOQUE RSVP / CÓDIGO */}
                <div className="bg-white/6 backdrop-blur-sm border border-white/18 rounded-2xl p-4">
                  <p className="text-xs sm:text-sm text-[#F8F4E3]/90 mb-3">
                    Ingresa con tu código personal de invitación y confirma tu
                    asistencia. Esto nos ayudará a organizar mejor todos los
                    detalles del gran día.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <button
                      type="button"
                      onClick={() => setShowRsvpModal(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] text-[#111827] text-xs sm:text-sm font-semibold px-6 py-2.5 shadow-md hover:bg-[#e0be4d] transition-colors"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Confirmar asistencia
                    </button>
                    <div className="text-[10px] sm:text-[11px] text-[#F8F4E3]/75">
                      Dress code:{" "}
                      <span className="font-semibold text-[#FDE68A]">
                        {dressCode}
                      </span>
                      <br />
                      Desplázate para conocer nuestra historia, padres, padrinos
                      y detalles de la celebración.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador hacia abajo */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#F8F4E3]/80 text-[11px] flex flex-col items-center z-20">
          <span>Desplázate para conocer más</span>
          <span className="mt-1 animate-bounce">▼</span>
        </div>
      </section>




      {/* ================= NUESTRA HISTORIA ================= */}
      <FadeIn delay={240}>
        <section className="bg-[#F8F4E3] text-[#111827] py-12 px-4">
          <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[2.2fr,1.8fr] items-center">
            <div>
              <p className="text-3xl text-[#111827] mb-1 font-serif flex items-center gap-2">
                <LuFlower2 className="w-6 h-6 text-[#D4AF37]" />
                <span>Nuestra historia</span>
              </p>
              <h2 className="text-2xl text-[#111827] mb-4 font-serif">
                De {boda?.ciudad || "nuestra ciudad"} al altar
              </h2>
              <p className="text-sm text-slate-700 mb-3">{textoHistoria}</p>
              <p className="text-sm text-slate-700 mb-3">
                La idea es que cada invitado sienta que está entrando a un
                momento íntimo y significativo, más allá de una fiesta.
              </p>
              <p className="text-sm text-slate-700">
                Gracias por ser parte de este capítulo tan importante en nuestra
                historia.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#F1E5D3] shadow-md p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <LuSparkles className="w-6 h-6 text-[#111827]" />
                </div>
                <div>
                  <p className="text-base text-[#111827] font-semibold">
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
                  <FiMapPin className="w-5 h-5 text-[#111827]" />
                </div>
                <div>
                  <p className="text-base text-[#111827] font-semibold">
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
                  <LuFlower2 className="w-5 h-5 text-[#111827]" />
                </div>
                <div>
                  <p className="text-base text-[#111827] font-semibold">
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

      {/* ================= PADRES Y PADRINOS ================= */}
      <FadeIn delay={280}>
        <section className="bg-[#F1E5D3] py-10 px-4">
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur rounded-3xl border border-[#F1E5D3] shadow-md p-6 md:p-8">
            <h2 className="text-2xl text-[#111827] mb-4 text-center font-serif">
              Nuestros padres y padrinos
            </h2>
            <p className="text-xs text-slate-600 text-center mb-6 max-w-2xl mx-auto">
              Queremos compartir también con ustedes a las personas que nos han
              acompañado, cuidado y guiado hasta este momento tan especial.
            </p>
            <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-800">
              <div className="space-y-3">
                <p className="font-semibold text-[#111827]">Novios</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {boda?.nombre_pareja ||
                      `${boda?.nombre_novio_1 ?? ""} ${
                        boda?.nombre_novio_2 ?? ""
                      }`}
                  </li>
                </ul>

                <p className="font-semibold text-[#111827] mt-3">
                  Padres del novio
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {textoPadresNovio ? (
                      <TextoConPaloma texto={textoPadresNovio} />
                    ) : (
                      "Por definir"
                    )}
                  </li>
                </ul>

                <p className="font-semibold text-[#111827] mt-3">
                  Padres de la novia
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {textoPadresNovia ? (
                      <TextoConPaloma texto={textoPadresNovia} />
                    ) : (
                      "Por definir"
                    )}
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-[#111827]">Padrinos</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {textoPadrinosMayores ? (
                      <TextoConPaloma texto={textoPadrinosMayores} />
                    ) : (
                      "Padrinos principales"
                    )}
                  </li>
                  <li>
                    {textoPadrinosCiviles ? (
                      <TextoConPaloma texto={textoPadrinosCiviles} />
                    ) : (
                      "Padrinos civiles"
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ================= DETALLES (DESPUÉS DE CONFIRMAR) ================= */}
      {mostrarDetalles && (
        <FadeIn delay={320}>
          <section className="bg-[#F8F4E3] py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="bg-white rounded-3xl border border-[#F1E5D3] shadow-sm p-6 md:p-7 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-1 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-[#D4AF37]" />
                      Detalles de la celebración
                    </p>
                    <h3 className="font-serif text-xl text-[#111827]">
                      Día, hora y lugares
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                    <span className="px-4 py-2 rounded-full bg-[#E6E7E3] text-[#2C3E50] font-semibold">
                      {fechaLarga || "Fecha por confirmar"}
                    </span>
                    {boda?.ciudad && (
                      <span className="px-4 py-2 rounded-full bg-[#D4AF37]/20 text-[#2C3E50] font-semibold">
                        {boda.ciudad}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-800">
                  <div className="rounded-2xl border border-[#F1E5D3] bg-[#FFFCF6] p-4">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-1">
                      Ceremonia
                    </p>
                    {lugarCeremonia ? (
                      <>
                        <h4 className="font-semibold text-[#111827]">
                          {lugarCeremonia}
                        </h4>
                        {(horaCeremonia || direccionCeremonia) && (
                          <p className="mt-2 text-xs sm:text-sm text-slate-700">
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
                      <p className="text-xs text-slate-500">
                        Muy pronto confirmaremos los detalles de la ceremonia.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#F1E5D3] bg-[#FFFCF6] p-4">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-1">
                      Recepción
                    </p>
                    {lugarRecepcion ? (
                      <>
                        <h4 className="font-semibold text-[#111827]">
                          {lugarRecepcion}
                        </h4>
                        {(horaRecepcion || direccionRecepcion) && (
                          <p className="mt-2 text-xs sm:text-sm text-slate-700">
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
                      <p className="text-xs text-slate-500">
                        Estamos ultimando los detalles de la recepción.
                      </p>
                    )}
                  </div>
                </div>

                {cronogramaTexto && (
                  <div className="mt-2 rounded-2xl border border-dashed border-[#E5D5B8] bg-[#FFFBF3] p-4 text-xs sm:text-sm text-slate-700">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-2">
                      Cronograma del día
                    </p>
                    <ul className="space-y-1">
                      {cronogramaTexto
                        .split("\n")
                        .map((linea) => linea.trim())
                        .filter(Boolean)
                        .map((linea, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                            <span>{linea}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-700 mt-3">
                  {mensajeFinal}
                </p>
              </div>

              {(textoCuentasBancarias || textoYape) && (
                <div className="bg-white rounded-3xl border border-[#F1E5D3] shadow-sm p-6 md:p-7">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-1 flex items-center gap-2">
                        <FiGift className="w-4 h-4 text-[#D4AF37]" />
                        Nuestro regalo
                      </p>
                      <h3 className="font-serif text-xl text-[#111827]">
                        Si deseas acompañarnos con un detalle
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-800">
                    {textoCuentasBancarias && (
                      <div className="rounded-2xl border border-[#F1E5D3] bg-[#FFFCF6] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                          Cuentas bancarias / CCI
                        </p>
                        <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                          {textoCuentasBancarias}
                        </pre>
                      </div>
                    )}
                    {textoYape && (
                      <div className="rounded-2xl border border-[#F1E5D3] bg-[#FFF7E6] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
                          Yape / Plin
                        </p>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">
                          {textoYape}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-[11px] text-slate-600">
                    Tu presencia es lo más importante. El regalo es totalmente
                    opcional.
                  </p>
                </div>
              )}
            </div>
          </section>
        </FadeIn>
      )}

      {/* ================= FOOTER ================= */}
      <FadeIn delay={400}>
        <footer className="bg-[#020617] border-t border-[#020617] text-[#F8F4E3]/80">
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

      {/* ================= MODAL RSVP ================= */}
      {showRsvpModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowRsvpModal(false)}
        >
          <div
            className="relative max-w-xl w-full bg-[#F8F4E3] text-[#111827] rounded-3xl border border-[#D4AF37]/60 shadow-2xl p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowRsvpModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
            >
              <FiX className="w-5 h-5" />
            </button>

            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37]/90 uppercase mb-2 text-center flex items-center justify-center gap-1.5">
              <FiCheckCircle className="w-3.5 h-3.5" />
              Confirmar asistencia
            </p>
            <h2 className="text-xl sm:text-2xl font-serif mb-2 text-center">
              ¿Tienes un código de invitación?
            </h2>
            <p className="text-sm text-slate-700 mb-5 text-center">
              Ingresa el código que aparece en tu invitación y tu número de
              celular para registrar tu asistencia.
            </p>

            <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Código de invitación
                  </label>
                  <input
                    type="text"
                    value={codigoRsvp}
                    onChange={(e) =>
                      setCodigoRsvp(e.target.value.toUpperCase())
                    }
                    placeholder="Ej: AB39KLP"
                    className="w-full rounded-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={rsvpCelular}
                    onChange={(e) => setRsvpCelular(e.target.value)}
                    placeholder="Ej: 987 654 321"
                    className="w-full rounded-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mensaje (opcional)
                </label>
                <textarea
                  rows={3}
                  value={rsvpMensaje}
                  onChange={(e) => setRsvpMensaje(e.target.value)}
                  placeholder="Ej: Iré con mi pareja :)"
                  className="w-full rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={rsvpEstado === "loading"}
                  className="inline-flex justify-center items-center rounded-full bg-[#D4AF37] text-[#111827] text-sm font-semibold px-5 py-2 hover:bg-[#e0be4d] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {rsvpEstado === "loading"
                    ? "Enviando..."
                    : "Confirmar asistencia"}
                </button>

                {rsvpMensajeEstado && (
                  <p
                    className={`text-xs text-center sm:text-right ${
                      rsvpEstado === "ok" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {rsvpMensajeEstado}
                  </p>
                )}
              </div>
            </form>

            <div className="mt-5 text-[11px] sm:text-xs text-slate-700 bg-[#FFF9EA] border border-[#FACC15]/40 rounded-2xl px-4 py-3 flex gap-3 items-start">
              <div className="mt-[2px]">
                <FiClock className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p>
                Esta será una celebración pensada solo para adultos. Queremos
                que puedas disfrutar de la noche sin preocupaciones; los más
                pequeños, esta vez, nos acompañan desde casa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= OVERLAY CELEBRACIÓN ================= */}
      {showCelebration && (
        <CelebrationOverlay
          nombres={
            boda?.nombre_pareja ||
            `${boda?.nombre_novio_1 ?? ""} ${boda?.nombre_novio_2 ?? ""}`
          }
          onClose={handleCelebrationClose}
        />
      )}
    </div>
  );
}
