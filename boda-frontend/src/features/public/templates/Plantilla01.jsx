// src/features/public/templates/Plantilla01.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useMemo as useReactMemo } from "react";
import anillosBoda from "../../../../public/img/anillos-boda.png";
import parejaBoda from "../../../../public/img/pareja-boda.png";
import parejaBoda2 from "../../../../public/img/pareja-boda_2.png";
import {
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiX,
  FiGift,
  FiUsers,
} from "react-icons/fi";
import { LuFlower2, LuSparkles } from "react-icons/lu";
import { GiPeaceDove } from "react-icons/gi";
import { ConfirmationSuccess } from "../components/ConfirmationSuccess";
import { PostConfirmationDetails } from "../components/PostConfirmationDetails";
import { useFaqs } from "../../faqs/hooks/useFaqs";
import { useBodaFaqs } from "../../faqs/hooks/useBodaFaqs";
import { RsvpModal } from "../components/RsvpModal";
import {
  COLOR_AZUL,
  COLOR_MARFIL,
  COLOR_DORADO,
  COLOR_CORAL,
  COLOR_AZUL_OSCURO_FONDO,
} from "../../../shared/styles/colors";
const FLORES_LATERAL = "/img/flores.png";
/** =================== BASE URL PARA FOTOS =================== */
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_URL || "/storage";

/** Normaliza la URL de la foto (tolera distintas variantes del backend) */
function resolveFotoUrl(inputPath) {
  if (!inputPath) return "";

  // Aseguramos string y limpiamos espacios/backslashes
  let path = String(inputPath).trim().replace(/\\/g, "/");

  // URLs absolutas
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Normalizaciones de prefijo comunes que llegan del backend
  // "storage/..." -> "/storage/..."
  if (path.startsWith("storage/")) path = `/${path}`;
  // "fotos_boda/..." -> "/storage/fotos_boda/..."
  if (path.startsWith("fotos_boda/")) path = `/storage/${path}`;
  // "/fotos_boda/..." -> "/storage/fotos_boda/..."
  if (path.startsWith("/fotos_boda/")) path = `/storage${path}`;

  // Si ya viene como "/storage/..." déjalo tal cual (ruta relativa válida)
  if (path.startsWith("/storage/")) return path;

  // Fallback: concatenar con STORAGE_BASE_URL sin duplicar slashes
  const base = (STORAGE_BASE_URL || "/storage").replace(/\/+$/, "");
  const tail = path.replace(/^\/+/, "");
  // Evitar duplicar "/storage/storage/..."
  if (base.endsWith("/storage") && tail.startsWith("storage/")) {
    return `/${tail}`; // => "/storage/..."
  }
  return `${base}/${tail}`;
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

/**
 * Componente que muestra un fondo para hero usando la misma imagen.
 * Si la imagen es vertical, renderiza un fondo difuminado (cover) y la
 * imagen centrada sin deformar; si es horizontal usa background-size: cover.
 */
function HeroBackground({
  url,
  position = "center",
  zClass = "-z-20",
  extraClass = "",
}) {
  const [isVertical, setIsVertical] = useState(false);
  const [ratio, setRatio] = useState(null); // naturalWidth/naturalHeight
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!url) return;
    let mounted = true;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      if (!mounted) return;
      const vertical = img.naturalHeight > img.naturalWidth;
      setIsVertical(vertical);
      setRatio(img.naturalWidth / img.naturalHeight);
    };

    img.onerror = () => {
      if (!mounted) return;
      setIsVertical(false);
    };
    return () => {
      mounted = false;
    };
  }, [url]);

  const TARGET_VW = 0.93; // 0.90–0.96
  const MAX_SCALE = 1.75; // 1.55–1.90

  useEffect(() => {
    if (!isVertical || !ratio) return;

    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Si dibujas la imagen con h = vh, su ancho base sería:
      const baseW = vh * ratio;

      // Queremos que ocupe aprox. 88% del ancho del viewport
      const targetW = vw * TARGET_VW;

      // Scale necesario (limitado para no exagerar)
      const raw = targetW / baseW;
      const next = Math.max(1, Math.min(raw, MAX_SCALE));

      setScale(next);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [isVertical, ratio]);

  if (!url) return null;

  if (isVertical) {
    return (
      <div
        className={`absolute inset-0 ${zClass} overflow-hidden ${extraClass}`}
      >
        {/* Fondo blur full */}
        <img
          src={url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover blur-3xl"
          style={{ transform: "scale(1.18)" }}
        />

        {/* Foto principal: alto completo + zoom para “ensanchar” (sin deformar) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <img
            src={url}
            alt=""
            className="h-[92svh] w-auto object-contain"
            style={{
              objectPosition: position, // ej: "center 35%"
              transform: `scale(${scale})`, // ensancha sin deformar
              willChange: "transform",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 ${zClass} ${extraClass}`}
      style={{
        backgroundImage: `url('${url}')`,
        backgroundSize: "cover",
        backgroundPosition: position,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
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
export default function Plantilla01({
  boda,
  configuracion,
  fotos,
  invitadosResumen,
}) {
  // ====================== AUDIO ======================
  const audioRef = useRef(null);

  const playCelebration = () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      a.pause(); // por si ya estaba sonando
      a.currentTime = 0; // reinicia
      a.muted = false;
      a.volume = 1;

      const p = a.play(); // importante: debe dispararse por un click del usuario
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (e) {}
  };

const stopCelebration = () => {
  const a = audioRef.current;
  if (!a) return;

  try {
    a.pause();
    a.currentTime = 0; // opcional: reinicia para la próxima vez
  } catch (e) {}
};


  // (Opcional pero recomendado) fuerza preload real
  useEffect(() => {
    audioRef.current?.load?.();
  }, []);

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
    configuracion?.local_religioso ||
    configuracion?.lugar_ceremonia ||
    configuracion?.lugar_evento ||
    "";

  const direccionCeremonia =
    configuracion?.direccion_ceremonia || configuracion?.direccion_evento;
  const horaCeremonia = configuracion?.hora_ceremonia
    ? formatHoraCorta(configuracion.hora_ceremonia)
    : "";

  const lugarRecepcion =
    configuracion?.localRecepcion ||
    configuracion?.local_recepcion ||
    configuracion?.lugar_recepcion ||
    "";

  const direccionRecepcion = configuracion?.direccion_recepcion;
  const horaRecepcion = configuracion?.hora_recepcion
    ? formatHoraCorta(configuracion.hora_recepcion)
    : "";

  const dressCode = configuracion?.dress_code || "Elegante / Formal";

  const mensajeFinal =
    configuracion?.textoMensajeFinal ||
    configuracion?.texto_mensaje_final ||
    configuracion?.frase_final ||
    "Tu presencia es nuestro mejor regalo. Gracias por acompañarnos en este día irrepetible.";

  const textoHistoria =
    configuracion?.textoHistoriaPareja ||
    configuracion?.texto_historia_pareja ||
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

  // ===================== MÉTRICAS DE INVITADOS (PÚBLICO) =====================
  const totalInvitadosPublic =
    invitadosResumen?.total_invitados ?? boda?.total_invitados ?? 0;

  const totalConfirmadosPublic =
    invitadosResumen?.total_confirmados ?? boda?.total_confirmados ?? 0;

  const porcentajeConfirmadosPublic =
    invitadosResumen?.porcentaje_confirmados ??
    (totalInvitadosPublic > 0
      ? Math.round((totalConfirmadosPublic * 100) / totalInvitadosPublic)
      : 0);

  // ===================== FOTOS / HERO CARRUSEL (PREMIUM) =====================
  const fotosPublicas = useMemo(() => {
    const limpias = Array.isArray(fotos) ? fotos : [];

    // Primero intentamos filtrar públicas
    const publicas = limpias.filter((f) => {
      if (!f) return false;
      const v = f.es_galeria_privada;
      return (
        v === 0 ||
        v === "0" ||
        v === false ||
        v === null ||
        typeof v === "undefined"
      );
    });

    // Si no hay públicas, usamos todo
    const base = publicas.length ? publicas : limpias;

    // IMPORTANTE: no mutar (slice)
    return base.slice().sort((a, b) => {
      const portadaA = a.es_portada ? 1 : 0;
      const portadaB = b.es_portada ? 1 : 0;
      if (portadaA !== portadaB) return portadaB - portadaA;

      const ordenA = a.orden ?? 999;
      const ordenB = b.orden ?? 999;
      if (ordenA !== ordenB) return ordenA - ordenB;

      return (a.id || 0) - (b.id || 0);
    });
  }, [fotos]);
  const fotosPrivadas = useMemo(() => {
    const arr = Array.isArray(fotos) ? fotos : [];

    const privadas = arr.filter((f) => {
      const v = f?.es_galeria_privada;
      return v === 1 || v === "1" || v === true;
    });

    return privadas.slice().sort((a, b) => {
      const ordenA = a.orden ?? 999;
      const ordenB = b.orden ?? 999;
      if (ordenA !== ordenB) return ordenA - ordenB;
      return (a.id || 0) - (b.id || 0);
    });
  }, [fotos]);

  const heroSlides = useMemo(() => {
    if (fotosPublicas.length > 0) {
      return fotosPublicas.map((f, idx) => {
        const img = resolveFotoUrl(
          f.url_publica || f.url || f.ruta || f.url_imagen || ""
        );
        return {
          id: f.id ?? idx,
          title: tituloPrincipal || "Un día para celebrar el amor",
          subtitle:
            fechaLarga ||
            boda?.ciudad ||
            "Quillabamba, clima tropical y gente que queremos.",
          image: img,
        };
      });
    }

    return [
      {
        id: 1,
        title: "Un día para celebrar el amor",
        subtitle: "Quillabamba, clima tropical y gente que queremos.",
        image:
          "https://images.pexels.com/photos/3137077/pexels-photo-3137077.jpeg?auto=compress&cs=tinysrgb&w=1600",
      },
    ];
  }, [fotosPublicas, tituloPrincipal, fechaLarga, boda?.ciudad]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPrevIndex, setHeroPrevIndex] = useState(null);

  const heroActual = heroSlides[heroIndex] || heroSlides[0];
  const urlHero = heroActual?.image || "";

  // Foto para "Nuestra historia": evita repetir el hero
  const historiaFoto = useMemo(() => {
    // 1) PRIORIDAD: una foto marcada como “galeria privada” (no se usa en el hero)
    if (fotosPrivadas.length > 0) {
      const f = fotosPrivadas[0];
      return resolveFotoUrl(
        f.url_publica || f.url || f.ruta || f.url_imagen || ""
      );
    }

    // 2) Fallback: como estaba antes (2da/3ra del hero o portada)
    const segunda = heroSlides?.[1]?.image;
    const tercera = heroSlides?.[2]?.image;
    return tercera || segunda || urlHero || "";
  }, [fotosPrivadas, heroSlides, urlHero]);

  // Permite posición configurable (si lo guardas en BD)
  const heroPosicion = configuracion?.heroPosicion || "center 35%";

  useEffect(() => {
    if (!heroSlides.length) return;

    const id = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % heroSlides.length;
        setHeroPrevIndex(prev);
        return next;
      });
    }, 9000);

    return () => clearInterval(id);
  }, [heroSlides.length]);

  // ===================== RSVP =====================
  const [mostrarModalRsvp, setMostrarModalRsvp] = useState(false);
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  const [datosConfirmacion, setDatosConfirmacion] = useState(null);

 const manejadorExitoRsvp = (datos) => {
  stopCelebration();               
  setDatosConfirmacion(datos);
  setMostrarModalRsvp(false);
  setMostrarCelebracion(true);
};

  const manejadorCerrarCelebracion = () => {
    setMostrarCelebracion(false);

    // Scroll suave hacia la sección pública de detalles (siempre renderizada)
    setTimeout(() => {
      const el = document.getElementById("detalles-celebracion");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" });
      }
    }, 250);
  };

  // Cargar FAQs (plataforma/public) y las específicas de la boda
  const { faqs: platformFaqs } = useFaqs();
  const { faqs: bodaFaqs } = useBodaFaqs(
    boda?.id ?? boda?.id_boda ?? boda?.bodaId
  );

  // ===================== RENDER =====================
  return (
    <div className="min-h-screen bg-marfil text-slate-900 overflow-x-hidden">
      <audio ref={audioRef} src="/sounds/marcha-nupcial-rock.mp3" preload="auto" loop/>
      {/* ================= HERO ================= */}
      <section className="relative min-h-[92svh] lg:min-h-[100vh] flex items-center justify-center">
        {/* Animación del corazón */}
        <style>{`
          @keyframes heartbeat-soft {
            0%, 100% {
              transform: scale(1);
            }
            15% {
              transform: scale(1.18);
            }
            30% {
              transform: scale(1);
            }
            45% {
              transform: scale(1.18);
            }
            60% {
              transform: scale(1);
            }
          }
          .heartbeat-soft {
            animation: heartbeat-soft 2.6s ease-in-out infinite;
            transform-origin: center;
          }
        `}</style>

        <style>{`
          @keyframes heroFade {
            from { opacity: 0; transform: scale(1.02); }
            to   { opacity: 1; transform: scale(1); }
          }
          .hero-fade { animation: heroFade 1100ms ease-out both; }
        `}</style>

        {/* Fondo anterior (debajo) */}
        {heroPrevIndex !== null && heroSlides?.[heroPrevIndex]?.image && (
          <HeroBackground
            url={heroSlides[heroPrevIndex].image}
            position={heroPosicion}
            zClass="z-[1]"
          />
        )}

        {/* Fondo actual (fade arriba) */}
        {urlHero && (
          <HeroBackground
            key={urlHero}
            url={urlHero}
            position={heroPosicion}
            zClass="z-[2]"
            extraClass="hero-fade"
          />
        )}

        {/* Overlay premium: asegura contraste siempre */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: `
      radial-gradient(ellipse at center,
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) 58%,
        rgba(0,0,0,0.22) 75%,
        rgba(0,0,0,0.55) 100%
      ),
      linear-gradient(180deg,
        rgba(0,0,0,0.14) 0%,
        rgba(0,0,0,0.06) 40%,
        rgba(0,0,0,0.16) 100%
      )
    `,
          }}
        />

        {/* SEPARADOR INFERIOR EN FORMA DE OLA */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] overflow-hidden">
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

        {/* CONTENEDOR PRINCIPAL: DOS BLOQUES VERTICALES */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-between h-[72svh] sm:h-[70vh]">
            {/* ===== BLOQUE SUPERIOR: CORAZÓN + TÍTULO + “NOS CASAMOS” ===== */}
            <div className="flex flex-col items-center text-center">
              {/* Corazón animado */}

              {/* PLACA PREMIUM (glass) */}
              {/* NOMBRES (SIN GLASS, con halo sutil y sin recorte) */}
              <div className="relative inline-flex flex-col items-center px-2 sm:px-3 py-2 overflow-visible">
                {/* Halo sutil SOLO detrás del texto (no es panel / no es glass) */}
                <div
                  className="pointer-events-none absolute -inset-x-12 -inset-y-8 blur-2xl opacity-60"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(0,0,0,0.60), rgba(0,0,0,0.00))",
                  }}
                />

                {/* Nombres (mantiene el color dorado, mejora contraste, no recorta) */}
                <h1
                  className="text-4xl sm:text-5xl lg:text-[4.4rem] leading-[1.15] font-normal text-center"
                  style={{
                    fontFamily:
                      "'Great Vibes','Cormorant Garamond','Times New Roman',serif",
                    letterSpacing: "0.04em",

                    // Blanco elegante
                    color: "#FFFFFF",

                    // Contorno sutil para que no se pierda en fondos claros
                    WebkitTextStroke: "1.2px rgba(0,0,0,0.40)",

                    // Sombra profunda (define bien el trazo en cualquier foto)
                    textShadow:
                      "0 2px 2px rgba(0,0,0,0.55), 0 18px 42px rgba(0,0,0,0.45)",

                    // Anti-recorte
                    paddingTop: "0.25rem",
                    paddingBottom: "0.32rem",
                  }}
                >
                  {tituloPrincipal}
                </h1>

                {/* Ornamento minimal */}
                <div className="mt-1 mb-2 flex items-center gap-3 opacity-90">
                  <span className="h-px w-14 bg-white/70 rounded-full" />
                  <span className="heartbeat-soft inline-flex items-center justify-center">
                    <span
                      className="text-white text-2xl sm:text-3xl leading-none"
                      style={{
                        textShadow:
                          "0 2px 6px rgba(0,0,0,0.55), 0 0 18px rgba(255,255,255,0.20)",
                        filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.25))",
                      }}
                    >
                      ♥
                    </span>
                  </span>
                  <span className="h-px w-14 bg-white/70 rounded-full" />
                </div>

                <p className="text-sm sm:text-base text-white/90">
                  {configuracion?.subtituloHero || "¡Nos casamos!"}
                </p>
              </div>
            </div>

            {/* ===== BLOQUE INFERIOR: FECHA + COUNTDOWN + BOTÓN ===== */}
            <div className="flex flex-col items-center text-center pb-8 gap-3">
              {/* Fecha */}
              {fechaLarga && (
                <div>
                  <p className="font-serif text-sm sm:text-base flex items-center justify-center gap-2 text-[#F8F4E3]/95">
                    <FiCalendar className="w-4 h-4" />
                    <span>{fechaLarga}</span>
                  </p>
                </div>
              )}
              {/* COUNTDOWN */}
              {fechaBoda && (
                <div className="inline-flex rounded-2xl bg-black/65 border border-white/25 px-4 py-3 backdrop-blur-sm mx-auto">
                  <div className="flex gap-4 text-center text-sm items-center">
                    <FiClock className="w-4 h-4 text-[#FDE68A]" />
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

              {/* Botón Confirmar asistencia */}
              <button
                type="button"
                onClick={() => {
                  playCelebration();  
                  setMostrarModalRsvp(true);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-full text-[#111827] text-sm font-semibold px-7 py-2.5 shadow-md transition-colors"
                style={{ backgroundColor: COLOR_DORADO }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.filter = "brightness(1.06)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
              >
                <FiCheckCircle className="w-4 h-4" />
                Confirmar asistencia
              </button>
            </div>
          </div>
        </div>

        {/* Indicador hacia abajo */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#F8F4E3]/80 text-[11px] flex flex-col items-center z-20">
          <span>Desplázate para conocer más</span>
          <span className="mt-1 animate-bounce">▼</span>
        </div>
      </section>

      {/* ====== CONTENIDO CON MARCO (DESDE AQUÍ HASTA ANTES DEL FOOTER) ====== */}
      <main className="relative">
        {/* Contenido real */}
        <div className="relative z-20">
          {/* AQUÍ VA TODO: NUESTRA HISTORIA, PADRES, mostrarDetalles, etc. */}

          {/* ================= NUESTRA HISTORIA (PREMIUM) ================= */}
          <FadeIn delay={240}>
            <section
              className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-hidden"
              style={{ backgroundColor: COLOR_MARFIL, color: COLOR_AZUL }}
            >
              {/* “Luz” superior suave (sin línea) */}

              {/* Anillos en medallón (mismo estilo que el de novios) */}
              <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 z-30">
                <div
                  className="h-16 w-16 rounded-3xl bg-white/95 border shadow-lg flex items-center justify-center"
                  style={{ borderColor: `${COLOR_DORADO}40` }}
                >
                  <img
                    src={anillosBoda}
                    alt="Anillos de boda"
                    className="w-10 h-10 sm:w-11 sm:h-11 opacity-95"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              {/* Glows suaves (como “luces” de tu modal pero en versión marfil) */}
              <div
                className="pointer-events-none absolute -right-24 top-10 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
                style={{ background: `${COLOR_DORADO}22` }}
              />
              <div
                className="pointer-events-none absolute -left-28 bottom-0 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
                style={{ background: `${COLOR_CORAL}18` }}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  {/* ===== IZQUIERDA: Texto en card editorial ===== */}
                  <div className="lg:col-span-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                        style={{
                          backgroundColor: "#FFF7E6",
                          borderColor: `${COLOR_DORADO}40`,
                        }}
                      >
                        <LuFlower2
                          className="w-5 h-5"
                          style={{ color: COLOR_DORADO }}
                        />
                      </span>

                      <div>
                        <h2
                          className="text-3xl sm:text-4xl font-serif leading-tight"
                          style={{ color: COLOR_AZUL }}
                        >
                          Nuestra historia
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          Un pedacito de nosotros, contado con cariño.
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-3xl border bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-7"
                      style={{ borderColor: `${COLOR_DORADO}2B` }}
                    >
                      <p className="text-base sm:text-lg leading-relaxed text-slate-700 whitespace-pre-line">
                        {textoHistoria}
                      </p>

                      {/* Firma + línea fina (premium) */}
                      <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className="inline-block w-10 h-px"
                          style={{ background: `${COLOR_DORADO}80` }}
                        />
                        <span className="tracking-[0.30em] uppercase">
                          Con amor
                        </span>
                        <span
                          className="inline-block w-10 h-px"
                          style={{ background: `${COLOR_DORADO}80` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== DERECHA: Foto REAL + overlay estilo modal ===== */}
                  <div className="lg:col-span-6">
                    <div
                      className="relative overflow-hidden rounded-3xl border shadow-lg"
                      style={{
                        borderColor: `${COLOR_DORADO}33`,
                        backgroundColor: "white",
                      }}
                    >
                      {/* Foto - altura ajustada para mobile (más alta) */}
                      <div className="relative h-[420px] sm:h-[480px] lg:h-[520px]">
                        {historiaFoto ? (
                          <img
                            src={historiaFoto}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ objectPosition: "center 30%" }}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-200" />
                        )}

                        {/* Overlay premium (consistente con tu modal: oscuro + dorado/coral) */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              `linear-gradient(180deg, rgba(10,19,32,0.10) 0%, rgba(10,19,32,0.70) 100%),` +
                              `radial-gradient(900px 420px at 70% 20%, ${COLOR_DORADO}20, transparent 55%),` +
                              `radial-gradient(900px 420px at 30% 85%, ${COLOR_CORAL}16, transparent 55%)`,
                          }}
                        />

                        {/* Etiqueta (tipo “badge”) */}
                        <div className="absolute top-5 left-5">
                          <span
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.10)",
                              borderColor: `${COLOR_DORADO}55`,
                              color: "#F8F4E3",
                            }}
                          >
                            <LuSparkles
                              className="w-4 h-4"
                              style={{ color: COLOR_DORADO }}
                            />
                            Un capítulo que recién empieza
                          </span>
                        </div>

                        {/* Bloque inferior (mini detalles) */}
                        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                              className="rounded-2xl border p-3 backdrop-blur"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.08)",
                                borderColor: "rgba(255,255,255,0.16)",
                                color: "#F8F4E3",
                              }}
                            >
                              <div className="text-[11px] opacity-80 flex items-center gap-2">
                                <FiCalendar
                                  className="w-4 h-4"
                                  style={{ color: COLOR_DORADO }}
                                />
                                Fecha
                              </div>
                              <div className="mt-1 text-sm font-semibold">
                                {fechaLarga || "Por confirmar"}
                              </div>
                            </div>

                            <div
                              className="rounded-2xl border p-3 backdrop-blur"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.08)",
                                borderColor: "rgba(255,255,255,0.16)",
                                color: "#F8F4E3",
                              }}
                            >
                              <div className="text-[11px] opacity-80 flex items-center gap-2">
                                <FiMapPin
                                  className="w-4 h-4"
                                  style={{ color: COLOR_CORAL }}
                                />
                                Ceremonia
                              </div>
                              <div className="mt-1 text-sm font-semibold truncate">
                                {lugarCeremonia || "Por confirmar"}
                              </div>
                            </div>

                            <div
                              className="rounded-2xl border p-3 backdrop-blur"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.08)",
                                borderColor: "rgba(255,255,255,0.16)",
                                color: "#F8F4E3",
                              }}
                            >
                              <div className="text-[11px] opacity-80 flex items-center gap-2">
                                <FiMapPin
                                  className="w-4 h-4"
                                  style={{ color: COLOR_DORADO }}
                                />
                                Recepción
                              </div>
                              <div className="mt-1 text-sm font-semibold truncate">
                                {lugarRecepcion || "Por confirmar"}
                              </div>
                            </div>

                            <div
                              className="rounded-2xl border p-3 backdrop-blur"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.08)",
                                borderColor: "rgba(255,255,255,0.16)",
                                color: "#F8F4E3",
                              }}
                            >
                              <div className="text-[11px] opacity-80 flex items-center gap-2">
                                <FiUsers
                                  className="w-4 h-4"
                                  style={{ color: "#E5E7EB" }}
                                />
                                Dress code
                              </div>
                              <div className="mt-1 text-sm font-semibold truncate">
                                {dressCode || "Elegante / Formal"}
                              </div>
                            </div>
                          </div>

                          <p className="mt-4 text-[12px] text-white/80">
                            Un día, un lugar y la gente que más queremos. ✨
                          </p>
                        </div>
                      </div>

                      {/* Línea inferior decorativa */}
                      <div
                        className="h-1"
                        style={{
                          background: `linear-gradient(90deg, ${COLOR_CORAL}, ${COLOR_DORADO}, ${COLOR_AZUL})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>
          {/* ================= PADRES Y PADRINOS (PREMIUM + CONSISTENTE) ================= */}
          <FadeIn delay={280}>
            <section
              className="relative py-14 sm:py-16 overflow-hidden"
              style={{
                background: `linear-gradient(180deg, #F1E5D3 0%, ${COLOR_MARFIL} 70%, ${COLOR_MARFIL} 100%)`,
              }}
            >
              {/* Barra superior premium (igual lenguaje visual que otras secciones) */}
              {/* <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${COLOR_CORAL}, ${COLOR_DORADO}, ${COLOR_AZUL})`,
            }}
          /> */}

              {/* Glows sutiles */}
              <div
                className="pointer-events-none absolute -right-28 top-10 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
                style={{ background: `${COLOR_DORADO}1A` }}
              />
              <div
                className="pointer-events-none absolute -left-28 bottom-0 w-[520px] h-[520px] rounded-full blur-3xl opacity-25"
                style={{ background: `${COLOR_CORAL}14` }}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                <div
                  className="relative bg-white/90 backdrop-blur rounded-[2.2rem] border shadow-lg pt-12 sm:pt-14 pb-8 px-5 sm:px-8 lg:px-10"
                  style={{ borderColor: `${COLOR_DORADO}2B` }}
                >
                  {/* Ícono flotante consistente (medallón) */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2">
                    <div
                      className="h-16 w-16 rounded-3xl bg-white/95 border shadow-lg flex items-center justify-center"
                      style={{ borderColor: `${COLOR_DORADO}40` }}
                    >
                      <img
                        src={parejaBoda2}
                        alt="Pareja de novios"
                        className="w-10 h-10 opacity-90"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h2
                      className="text-2xl sm:text-3xl font-serif leading-tight"
                      style={{ color: COLOR_AZUL }}
                    >
                      Nuestros padres y padrinos
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                      Queremos compartir también con ustedes a las personas que
                      nos han acompañado, cuidado y guiado hasta este momento
                      tan especial.
                    </p>
                  </div>

                  {/* Helper visual: separador fino */}
                  <div
                    className="mt-7 h-px w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${COLOR_DORADO}55, transparent)`,
                    }}
                  />

                  {/* Grid premium: móvil 1 col, desktop 2 col */}
                  <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* NOTA: min-w-0 + break-words evita que texto largo rompa el diseño */}
                    <div className="min-w-0 space-y-4">
                      <div
                        className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                        style={{ borderColor: `${COLOR_DORADO}2B` }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2">
                          Novios
                        </div>
                        <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed break-words">
                          {(boda?.nombre_novio_1 && boda?.nombre_novio_2)
                            ? `${boda.nombre_novio_1.trim()} & ${boda.nombre_novio_2.trim()}`
                            : (boda?.nombre_pareja || "Por definir")}
                        </div>
                      </div>

                      <div
                        className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                        style={{ borderColor: `${COLOR_DORADO}2B` }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2">
                          Padres del novio
                        </div>
                        <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed break-words whitespace-pre-line">
                          {textoPadresNovio ? (
                            <TextoConPaloma texto={textoPadresNovio} />
                          ) : (
                            "Por definir"
                          )}
                        </div>
                      </div>

                      <div
                        className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                        style={{ borderColor: `${COLOR_DORADO}2B` }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2">
                          Padres de la novia
                        </div>
                        <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed break-words whitespace-pre-line">
                          {textoPadresNovia ? (
                            <TextoConPaloma texto={textoPadresNovia} />
                          ) : (
                            "Por definir"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-4">
                      <div
                        className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                        style={{ borderColor: `${COLOR_DORADO}2B` }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2">
                          Padrinos Religiosos
                        </div>
                        <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed break-words whitespace-pre-line">
                          {textoPadrinosMayores ? (
                            <TextoConPaloma texto={textoPadrinosMayores} />
                          ) : (
                            "Por definir"
                          )}
                        </div>
                      </div>

                      <div
                        className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                        style={{ borderColor: `${COLOR_DORADO}2B` }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mb-2">
                          Padrinos civiles
                        </div>
                        <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed break-words whitespace-pre-line">
                          {textoPadrinosCiviles ? (
                            <TextoConPaloma texto={textoPadrinosCiviles} />
                          ) : (
                            "Por definir"
                          )}
                        </div>
                      </div>

                      {/* Pie premium (opcional pero suma) */}
                      <div className="text-[12px] text-slate-600 px-1">
                        Gracias por ser parte de nuestra historia. 
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={280}>
            <section id="detalles-celebracion" className="scroll-mt-24">
              <PostConfirmationDetails
                boda={boda}
                configuracion={configuracion}
                faqs={bodaFaqs && bodaFaqs.length ? bodaFaqs : platformFaqs}
                invitadosResumen={invitadosResumen}
              />
            </section>
          </FadeIn>
        </div>

        {/* FLORES: SOLO EN LOS MÁRGENES (CENTRO ENMASCARADO) */}
        <div        
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
          style={{
            // Sin máscara CSS - solo vamos a mostrar imágenes en los laterales
          }}
        >
          {/* Izquierda arriba */}
          <img
            src={FLORES_LATERAL}
            alt=""
            aria-hidden="true"
            className="hidden lg:block absolute left-0 top-10 w-[340px] -translate-x-[45%] opacity-[0.22]"
            style={{ filter: "drop-shadow(0 12px 28px rgba(15,23,42,0.10))" }}
          />

          {/* Derecha arriba (espejo) */}
          <img
            src={FLORES_LATERAL}
            alt=""
            aria-hidden="true"
            className="hidden lg:block absolute right-0 top-12 w-[340px] translate-x-[45%] scale-x-[-1] opacity-[0.22]"
            style={{ filter: "drop-shadow(0 12px 28px rgba(15,23,42,0.10))" }}
          />

          {/* Izquierda abajo */}
          <img
            src={FLORES_LATERAL}
            alt=""
            aria-hidden="true"
            className="hidden lg:block absolute left-0 bottom-[-40px] w-[380px] -translate-x-[48%] rotate-[6deg] opacity-[0.18]"
            style={{ filter: "drop-shadow(0 16px 34px rgba(15,23,42,0.10))" }}
          />

          {/* Derecha abajo (espejo) */}
          <img
            src={FLORES_LATERAL}
            alt=""
            aria-hidden="true"
            className="hidden lg:block absolute right-0 bottom-[-40px] w-[380px] translate-x-[48%] rotate-[-6deg] scale-x-[-1] opacity-[0.18]"
            style={{ filter: "drop-shadow(0 16px 34px rgba(15,23,42,0.10))" }}
          />
        </div>

        {/* MARCO (encima de todo) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2
               w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)]
               max-w-7xl rounded-[2.75rem] border z-40 mb-5"
          style={{
            borderColor: "rgba(15, 23, 42, 0.06)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.35), 0 18px 50px rgba(15,23,42,0.10)",
          }}
        />
      </main>

      {/* ================= FOOTER ================= */}
      <FadeIn delay={400}>
        <footer className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-black/95   overflow-hidden text-white">
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

      {/* ================= MODAL RSVP NUEVO ================= */}
   <RsvpModal
  isOpen={mostrarModalRsvp}
  onClose={() => {
    stopCelebration();            
    setMostrarModalRsvp(false);
  }}
  bodaNombre={
    boda?.nombre_pareja ||
    `${boda?.nombre_novio_1 ?? ""} ${boda?.nombre_novio_2 ?? ""}`
  }
  onSuccess={manejadorExitoRsvp}
  onPlayCelebration={playCelebration}
/>

      {/* ================= OVERLAY CELEBRACIÓN NUEVO ================= */}
      {mostrarCelebracion && (
        <ConfirmationSuccess
          nombreInvitado={datosConfirmacion?.nombre}
          cantidadPersonas={datosConfirmacion?.cantidad || 1}
          onClose={manejadorCerrarCelebracion}
        />
      )}
    </div>
  );
}
