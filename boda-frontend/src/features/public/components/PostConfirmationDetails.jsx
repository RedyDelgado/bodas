// src/features/public/components/PostConfirmationDetails.jsx
import React, { useMemo, useState } from "react";
import {
  FiClock,
  FiGift,
  FiCreditCard,
  FiSmartphone,
  FiUsers,
  FiHelpCircle,
  FiChevronDown,
  FiCopy,
  FiCheck,
  FiInfo,
  FiMapPin,
} from "react-icons/fi";
import {
  COLOR_DORADO,
  COLOR_CORAL,
  COLOR_AZUL,
} from "../../../shared/styles/colors";

/** Pool PNG (public/img) */
const PNG = {
  MEDALLON: "/img/preguntas.png",
  ANILLOS: "/img/anillos-boda.png",
  RELIGIOSA: "/img/boda_religiosa.png",
  CIVIL: "/img/boda_civil.png",
  RECEPCION: "/img/recepcion.png",
  CENA: "/img/cena.png",
  CELEBRACION: "/img/celebracion.png",
  UBICACION: "/img/localizacion.png",
  PAREJA: "/img/pareja-boda.png",
  VESTIMENTA: "/img/codigo_bestimenta.png",
  DETALLES: "/img/detalles.png",
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function parseCronograma(texto = "") {
  const raw = (texto || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return raw.map((line, i) => {
    // Formatos soportados:
    // 1) "19:30 - Recepción"
    // 2) "19:30 Recepción"
    // 3) "Recepción" (sin hora)
    const m = line.match(/^(\d{1,2}):(\d{2})\s*-?\s*(.+)/);
    return m
      ? { id: i, hora: `${m[1].padStart(2, "0")}:${m[2]}`, actividad: m[3] }
      : { id: i, hora: null, actividad: line };
  });
}

function iconPngForActivity(text) {
  if (!text) return PNG.ANILLOS;
  const t = text.toLowerCase();

  if (t.includes("relig") || t.includes("misa") || t.includes("igles"))
    return PNG.RELIGIOSA;

  if (t.includes("civil") || t.includes("municip") || t.includes("registro"))
    return PNG.CIVIL;

  if (t.includes("recep") || t.includes("brind") || t.includes("coctel"))
    return PNG.RECEPCION;

  if (t.includes("cena") || t.includes("comida") || t.includes("almuerzo"))
    return PNG.CENA;

  if (t.includes("celebr") || t.includes("fiesta") || t.includes("baile"))
    return PNG.CELEBRACION;

  if (
    t.includes("ubic") ||
    t.includes("local") ||
    t.includes("salón") ||
    t.includes("lugar")
  )
    return PNG.UBICACION;

  return PNG.ANILLOS;
}

function parseLatLngFromMapsUrl(url) {
  if (!url) return null;

  // 1) ?q=lat,lng  |  ?ll=lat,lng  |  ?query=lat,lng  |  center=lat,lng
  const qMatch = url.match(
    /[?&](?:q|ll|query|center)=\s*([-\d.]+),\s*([-\d.]+)/i
  );
  if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };

  // 2) @lat,lng (típico)
  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };

  // 3) links largos con pb=... !3dLAT!4dLNG (muy común)
  const pbMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (pbMatch) return { lat: pbMatch[1], lng: pbMatch[2] };

  return null;
}
function buildGoogleEmbedUrl(originalUrl) {
  if (!originalUrl) return null;

  // Si ya es embed, úsalo tal cual
  if (/google\.com\/maps\/embed/i.test(originalUrl)) return originalUrl;

  // Si podemos extraer coords, armamos embed por coordenadas
  const c = parseLatLngFromMapsUrl(originalUrl);
  if (c) {
    return `https://www.google.com/maps?q=${c.lat},${c.lng}&z=16&output=embed`;
  }

  // Si es google maps “normal”, intentamos forzar output=embed (a veces funciona)
  if (/google\.com\/maps/i.test(originalUrl)) {
    return (
      originalUrl + (originalUrl.includes("?") ? "&" : "?") + "output=embed"
    );
  }

  // Links cortos maps.app.goo.gl NO se pueden embedear sin resolver redirección (CORS)
  return null;
}

function accentForActivity(text) {
  if (!text) return COLOR_AZUL;
  const t = text.toLowerCase();

  if (t.includes("relig") || t.includes("misa") || t.includes("igles"))
    return COLOR_DORADO;

  if (t.includes("civil")) return COLOR_AZUL;

  if (t.includes("recep") || t.includes("fiesta") || t.includes("celebr"))
    return COLOR_CORAL;

  if (t.includes("cena") || t.includes("comida")) return COLOR_DORADO;

  if (
    t.includes("ubic") ||
    t.includes("local") ||
    t.includes("salón") ||
    t.includes("lugar")
  )
    return COLOR_AZUL;

  return "#0f172a";
}

function Badge({ children }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{
        backgroundColor: "rgba(255,255,255,0.75)",
        borderColor: `${COLOR_DORADO}40`,
        color: COLOR_AZUL,
      }}
    >
      {children}
    </span>
  );
}

export function PostConfirmationDetails({
  configuracion = {},
  faqs = [],
  boda = {},
  invitadosResumen = {},
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const [tab, setTab] = useState("transfer");
  const [copied, setCopied] = useState(null); // "transfer" | "yape" | null

  const cuentas =
    configuracion.textoCuentasBancarias ||
    configuracion.texto_cuentas_bancarias ||
    "";
  const yape = configuracion.textoYape || configuracion.texto_yape || "";

  const cronogramaTexto =
    configuracion.cronogramaTexto ||
    configuracion.cronograma_texto ||
    configuracion.cronograma ||
    "";

  const cronograma = useMemo(() => {
    const parsed = parseCronograma(cronogramaTexto);
    // fallback elegante si está vacío
    if (parsed.length) return parsed;
    return [
      { id: 1, hora: null, actividad: "Ceremonia religiosa" },
      { id: 2, hora: null, actividad: "Recepción" },
      { id: 3, hora: null, actividad: "Boda civil" },
      { id: 4, hora: null, actividad: "Cena" },
      { id: 5, hora: null, actividad: "Celebración" },
    ];
  }, [cronogramaTexto]);

  const ceremoniaMapsUrl =
    configuracion.ceremoniaMapsUrl || configuracion.ceremonia_maps_url || "";
  const recepcionMapsUrl =
    configuracion.recepcionMapsUrl || configuracion.recepcion_maps_url || "";

  const total = invitadosResumen.total_invitados ?? boda.total_invitados ?? 0;
  const conf =
    invitadosResumen.total_confirmados ?? boda.total_confirmados ?? 0;
  const pend = Math.max(0, total - conf);
  const pct = total > 0 ? Math.round((conf * 100) / total) : 0;
  const pctSafe = clamp(pct, 0, 100);

  async function copyToClipboard(value, key) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch (e) {
      setCopied(null);
    }
  }
  const hasGifts = Boolean((cuentas || "").trim() || (yape || "").trim());
  const embedCeremonia = buildGoogleEmbedUrl(ceremoniaMapsUrl);
  const embedRecepcion = buildGoogleEmbedUrl(recepcionMapsUrl);
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, #F1E5D3 0%, #F8F4E3 70%, #F8F4E3 100%)`,
      }}
    >
      {/* Glows sutiles (misma vibra que Padres y Padrinos) */}
      <div
        className="pointer-events-none absolute -right-28 top-8 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
        style={{ background: `${COLOR_DORADO}1A` }}
      />
      <div
        className="pointer-events-none absolute -left-28 bottom-0 w-[520px] h-[520px] rounded-full blur-3xl opacity-25"
        style={{ background: `${COLOR_CORAL}14` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        {/* Card premium principal */}
        <div
          className="relative bg-white/90 backdrop-blur rounded-[2.2rem] border shadow-lg pt-12 sm:pt-14 pb-8 px-5 sm:px-8 lg:px-10"
          style={{ borderColor: `${COLOR_DORADO}2B` }}
        >
          {/* Medallón flotante */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2">
            <div
              className="h-16 w-16 rounded-3xl bg-white/95 border shadow-lg flex items-center justify-center"
              style={{ borderColor: `${COLOR_DORADO}40` }}
            >
              <img
                src={PNG.DETALLES}
                alt="Detalles importantes"
                className="w-10 h-10 opacity-90"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Header centrado */}
          <div className="flex flex-col items-center text-center gap-3">
            <h3
              className="text-2xl sm:text-3xl font-serif leading-tight"
              style={{ color: COLOR_AZUL }}
            >
              Detalles importantes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Cronograma, regalos y estado de invitados — todo en un solo lugar.
            </p>
          </div>

          {/* Separador fino */}
          <div
            className="mt-7 h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLOR_DORADO}55, transparent)`,
            }}
          />

          {/* GRID */}
          <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {/* CRONOGRAMA (secuencia) */}
            <section className="lg:col-span-6 min-w-0">
              <div
                className="rounded-3xl border bg-white/85 p-5 sm:p-6 shadow-sm"
                style={{ borderColor: `${COLOR_DORADO}2B` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: "#FFF7E6",
                      borderColor: `${COLOR_DORADO}40`,
                    }}
                  >
                    <FiClock
                      className="w-5 h-5"
                      style={{ color: COLOR_DORADO }}
                    />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Cronograma
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Secuencia de momentos clave (lectura rápida y elegante).
                    </p>
                  </div>
                </div>

                {/* Timeline zig-zag limpio (sin números, sin acento interno) */}
                <div className="mt-6 relative">
                  {/* Línea central sutil */}
                  <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
                    style={{ background: `${COLOR_DORADO}40` }}
                  />

                  <div className="space-y-8">
                    {cronograma.map((it, idx) => {
                      const iconPng = iconPngForActivity(it.actividad);

                      // 1 izquierda, 2 derecha...
                      const isLeft = idx % 2 === 0;

                      const Card = ({ side }) => (
                        <div
                          className="relative min-w-0 rounded-2xl border bg-white/85 p-4 sm:p-5"
                          style={{ borderColor: `${COLOR_DORADO}2B` }}
                        >
                          {/* Conector horizontal hacia el nodo */}
                          <span
                            className="hidden lg:block absolute top-1/2 -translate-y-1/2 h-px w-6"
                            style={{
                              background: `${COLOR_DORADO}55`,
                              ...(side === "left"
                                ? { right: "-24px" }
                                : { left: "-24px" }),
                            }}
                          />

                          {it.hora && (
                            <div className="text-xs font-semibold text-slate-600">
                              {it.hora}
                            </div>
                          )}

                          <div className="mt-1 text-sm font-semibold text-slate-800 leading-snug break-words">
                            {it.actividad}
                          </div>
                        </div>
                      );

                      return (
                        <div
                          key={it.id}
                          className="relative grid grid-cols-[72px_1fr] gap-4 lg:grid-cols-12 lg:items-center"
                        >
                          {/* IZQUIERDA (desktop) */}
                          <div className="hidden lg:flex lg:col-span-5 justify-end pr-2">
                            {isLeft && <Card side="left" />}
                          </div>

                          {/* NODO (solo icono) */}
                          <div className="relative flex items-center justify-center lg:col-span-2 lg:col-start-6">
                            <div
                              className="h-12 w-12 rounded-2xl bg-white border shadow-sm flex items-center justify-center"
                              style={{ borderColor: `${COLOR_DORADO}55` }}
                            >
                              <img
                                src={iconPng}
                                alt=""
                                aria-hidden="true"
                                className="w-8 h-8 sm:w-9 sm:h-9 opacity-90"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          </div>

                          {/* DERECHA */}
                          <div className="lg:col-span-5 lg:pl-2">
                            {/* Mobile siempre aquí */}
                            <div className="lg:hidden">
                              <Card side="right" />
                            </div>

                            {/* Desktop alterna */}
                            <div className="hidden lg:flex justify-start">
                              {!isLeft && <Card side="right" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* COLUMNA DERECHA */}
            <section className="lg:col-span-6 min-w-0 space-y-5">
              {/* REGALOS */}
              {hasGifts && (
                <div
                  className="rounded-3xl border bg-white/85 p-5 sm:p-6 shadow-sm"
                  style={{ borderColor: `${COLOR_DORADO}2B` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                      style={{
                        backgroundColor: "#FFF7E6",
                        borderColor: `${COLOR_DORADO}40`,
                      }}
                    >
                      <FiGift
                        className="w-5 h-5"
                        style={{ color: COLOR_DORADO }}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-semibold text-slate-900">
                        Regalos
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                       El mejor regalo es verte allí, acompañándonos con tu cariño. Estamos felices de compartir contigo este momento inolvidable. Y si deseas obsequiarnos algo adicional, aquí encontrarás nuestros números de cuenta.
                      </p>
                    </div>
                  </div>

                  {/* Tabs estilo segment control */}
                  <div className="mt-4 inline-flex rounded-2xl border bg-white/90 p-1">
                    {Boolean(cuentas.trim()) && (
                      <button
                        type="button"
                        onClick={() => setTab("transfer")}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
                        style={{
                          backgroundColor:
                            tab === "transfer" ? "#FFFFFF" : "transparent",
                          color: tab === "transfer" ? COLOR_AZUL : "#475569",
                          boxShadow:
                            tab === "transfer"
                              ? "0 8px 18px rgba(15,23,42,0.06)"
                              : "none",
                        }}
                      >
                        <FiCreditCard
                          className="w-4 h-4"
                          style={{
                            color:
                              tab === "transfer" ? COLOR_DORADO : "#94A3B8",
                          }}
                        />
                        Transferencia
                      </button>
                    )}

                    {Boolean(yape.trim()) && (
                      <button
                        type="button"
                        onClick={() => setTab("yape")}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
                        style={{
                          backgroundColor:
                            tab === "yape" ? "#FFFFFF" : "transparent",
                          color: tab === "yape" ? COLOR_AZUL : "#475569",
                          boxShadow:
                            tab === "yape"
                              ? "0 8px 18px rgba(15,23,42,0.06)"
                              : "none",
                        }}
                      >
                        <FiSmartphone
                          className="w-4 h-4"
                          style={{
                            color: tab === "yape" ? COLOR_DORADO : "#94A3B8",
                          }}
                        />
                        Yape
                      </button>
                    )}
                  </div>

                  {/* Panel */}
                  <div
                    className="mt-4 rounded-2xl border p-4 sm:p-5 bg-white/80"
                    style={{ borderColor: `${COLOR_DORADO}2B` }}
                  >
                    {tab === "transfer" && Boolean(cuentas.trim()) && (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900">
                              Datos para transferencia
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              Puedes copiar y pegar en tu banco/app.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(cuentas, "transfer")}
                            className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border bg-white hover:bg-white/95 transition"
                            style={{
                              borderColor: `${COLOR_DORADO}40`,
                              color: COLOR_AZUL,
                            }}
                          >
                            {copied === "transfer" ? (
                              <>
                                <FiCheck
                                  className="w-4 h-4"
                                  style={{ color: COLOR_CORAL }}
                                />
                                Copiado
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-4 h-4" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-800 break-words">
                          {cuentas}
                        </pre>
                      </>
                    )}

                    {tab === "yape" && Boolean(yape.trim()) && (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900">
                              Yape
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              Copia el número o datos mostrados.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(yape, "yape")}
                            className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border bg-white hover:bg-white/95 transition"
                            style={{
                              borderColor: `${COLOR_DORADO}40`,
                              color: COLOR_AZUL,
                            }}
                          >
                            {copied === "yape" ? (
                              <>
                                <FiCheck
                                  className="w-4 h-4"
                                  style={{ color: COLOR_CORAL }}
                                />
                                Copiado
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-4 h-4" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>

                        <div className="mt-4 text-sm text-slate-800 whitespace-pre-wrap break-words">
                          {yape}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* INVITADOS */}
              <div
                className="rounded-3xl border bg-white/85 p-5 sm:p-6 shadow-sm"
                style={{ borderColor: `${COLOR_DORADO}2B` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                      style={{
                        backgroundColor: "#FFF7E6",
                        borderColor: `${COLOR_DORADO}40`,
                      }}
                    >
                      <FiUsers
                        className="w-5 h-5"
                        style={{ color: COLOR_CORAL }}
                      />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-slate-900">
                        Invitados
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Resumen de confirmaciones en tiempo real.
                      </p>
                    </div>
                  </div>

                  <Badge>
                    <span className="font-bold">{pctSafe}%</span>
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                    style={{ borderColor: `${COLOR_DORADO}2B` }}
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Total
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">
                      {total}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                    style={{ borderColor: `${COLOR_DORADO}2B` }}
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Confirmados
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">
                      {conf}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border bg-white/85 p-4 sm:p-5"
                    style={{ borderColor: `${COLOR_DORADO}2B` }}
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Pendientes
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">
                      {pend}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* ====== NUEVA FILA: MAPAS (izquierda) + FAQ (derecha) ====== */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* MAPAS: una sola columna, un solo enmarcado */}
            <section className="lg:col-span-6 min-w-0">
              <div
                className="rounded-3xl border bg-white/85 p-5 sm:p-6 shadow-sm"
                style={{ borderColor: `${COLOR_DORADO}2B` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: "#FFF7E6",
                      borderColor: `${COLOR_DORADO}40`,
                    }}
                  >
                    <FiMapPin
                      className="w-5 h-5"
                      style={{ color: COLOR_DORADO }}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Ubicación
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Mapas de la ceremonia y recepción (abre en Google Maps).
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-5">
                  {/* Ceremonia */}
                  <div>
                    <div className="text-sm font-semibold text-slate-900 mb-2">
                      Ceremonia
                    </div>

                    <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-100">
                      {ceremoniaMapsUrl ? (
                        embedCeremonia ? (
                          <iframe
                            src={embedCeremonia}
                            title="Mapa ceremonia"
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-slate-600">
                            <a
                              href={ceremoniaMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              Abrir en Google Maps
                            </a>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-slate-600">
                          No hay enlace de mapa para la ceremonia.
                        </div>
                      )}
                    </div>

                    {ceremoniaMapsUrl && (
                      <div className="mt-2 text-right">
                        <a
                          href={ceremoniaMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          Abrir en Google Maps
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Recepción */}
                  <div>
                    <div className="text-sm font-semibold text-slate-900 mb-2">
                      Recepción
                    </div>

                    <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-100">
                      {recepcionMapsUrl ? (
                        embedRecepcion ? (
                          <iframe
                            src={embedRecepcion}
                            title="Mapa recepción"
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-slate-600">
                            <a
                              href={recepcionMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              Abrir en Google Maps
                            </a>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-slate-600">
                          No hay enlace de mapa para la recepción.
                        </div>
                      )}
                    </div>

                    {recepcionMapsUrl && (
                      <div className="mt-2 text-right">
                        <a
                          href={recepcionMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          Abrir en Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ: su propio card en la otra columna */}
            <section className="lg:col-span-6 min-w-0">
              {faqs.length > 0 && (
                <div
                  className="rounded-3xl border bg-white/85 p-5 sm:p-6 shadow-sm"
                  style={{ borderColor: `${COLOR_DORADO}2B` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                      style={{
                        backgroundColor: "#FFF7E6",
                        borderColor: `${COLOR_DORADO}40`,
                      }}
                    >
                      <FiHelpCircle
                        className="w-5 h-5"
                        style={{ color: COLOR_DORADO }}
                      />
                    </span>

                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-slate-900">
                        Preguntas frecuentes
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Respuestas rápidas para tus invitados.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {faqs.map((q) => {
                      const id = q.id ?? q._id ?? (q.pregunta || q.question);
                      const opened = openFaq === id;

                      return (
                        <div
                          key={id}
                          className="rounded-2xl border bg-white/80 overflow-hidden"
                          style={{ borderColor: `${COLOR_DORADO}2B` }}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(opened ? null : id)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                            aria-expanded={opened}
                          >
                            <div className="text-sm font-semibold text-slate-900">
                              {q.pregunta || q.question}
                            </div>
                            <FiChevronDown
                              className={`w-4 h-4 transition-transform ${
                                opened ? "rotate-180" : ""
                              }`}
                              style={{ color: COLOR_DORADO }}
                            />
                          </button>

                          <div
                            className={`grid transition-all duration-200 ease-out ${
                              opened ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                                {q.respuesta || q.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
