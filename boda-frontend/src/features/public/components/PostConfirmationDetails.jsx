// src/features/public/components/PostConfirmationDetails.jsx
import React, { useState } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiGift,
  FiHelpCircle,
  FiChevronDown,
  FiCreditCard,
  FiSmartphone,
  FiUsers,
} from "react-icons/fi";
import { LuFlower2 } from "react-icons/lu";
import {
  COLOR_DORADO,
  COLOR_CORAL,
  COLOR_AZUL,
} from "../../../shared/styles/colors";

/**
 * Componente que muestra detalles después de confirmar
 * - Cronograma del día
 * - FAQs
 * - Información de regalo
 * - Cuentas bancarias
 */
export function PostConfirmationDetails({
  configuracion,
  faqs = [],
}) {
  const [idPreguntaExpandida, setIdPreguntaExpandida] = useState(null);
  const [pestaañaRegalosSeleccionada, setPestaañaRegalosSeleccionada] = useState("transfer");

  // Colores (usados desde tokens compartidos)

  // ===== CRONOGRAMA =====
  const cronogramaTexto =
    configuracion?.cronogramaTexto ||
    configuracion?.cronograma_texto ||
    configuracion?.cronograma ||
    "";

  const cronogramaItems = cronogramaTexto
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      // Intenta extraer hora si está en formato HH:MM
      const match = line.match(/^(\d{1,2}):(\d{2})\s*-?\s*(.+)/);
      if (match) {
        return {
          id: idx,
          hora: `${match[1]}:${match[2]}`,
          actividad: match[3],
          original: line,
        };
      }
      return {
        id: idx,
        hora: null,
        actividad: line,
        original: line,
      };
    });

    // Selección de icono según actividad (palabras clave)
    function getIconForActivity(actividad) {
      if (!actividad) return null;
      const a = actividad.toLowerCase();
      if (a.includes("ceremon") || a.includes("misa") || a.includes("altar") || a.includes("boda")) {
        return <LuFlower2 className="w-4 h-4" style={{ color: COLOR_DORADO }} />;
      }
      if (a.includes("recep") || a.includes("recepción") || a.includes("recepcion")) {
        return <FiCalendar className="w-4 h-4" style={{ color: COLOR_CORAL }} />;
      }
      if (a.includes("cena") || a.includes("banquete") || a.includes("comida")) {
        return <FiGift className="w-4 h-4" style={{ color: COLOR_DORADO }} />;
      }
      if (a.includes("baile") || a.includes("música") || a.includes("musica") || a.includes("fiesta")) {
        return <FiUsers className="w-4 h-4" style={{ color: COLOR_CORAL }} />;
      }
      if (a.includes("cerro") || a.includes("lugar") || a.includes("local") || a.includes("zona") || a.includes("salon") || a.includes("salón")) {
        return <FiMapPin className="w-4 h-4" style={{ color: COLOR_AZUL }} />;
      }
      // fallback
      return null;
    }

  // ===== FAQs =====
  const renderFaqItem = (faq) => {
    const estaExpandida = idPreguntaExpandida === faq.id;

    return (
      <div
        key={faq.id}
        className="rounded-2xl border border-slate-200 overflow-hidden transition-all hover:border-slate-300"
      >
        <button
          onClick={() =>
            setIdPreguntaExpandida(estaExpandida ? null : faq.id)
          }
          className="w-full px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-base">
              {faq.pregunta || faq.question || "Pregunta sin título"}
            </h4>
          </div>
          <FiChevronDown
            className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform ${
              estaExpandida ? "rotate-180" : ""
            }`}
          />
        </button>

        {estaExpandida && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {faq.respuesta || faq.answer || "Respuesta no disponible"}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ===== REGALOS / TRANSFERENCIAS =====
  const textoCuentasBancarias =
    configuracion?.textoCuentasBancarias ||
    configuracion?.texto_cuentas_bancarias ||
    "";
  const textoYape =
    configuracion?.textoYape || configuracion?.texto_yape || "";

  return (
    <div className="space-y-6 py-8">
      {/* ===== CRONOGRAMA ===== */}
      {cronogramaItems.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900/10">
              <FiClock className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cronograma del día
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Aquí está el paso a paso de la celebración
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative p-6 md:p-8">
            <div className="space-y-6">
              {cronogramaItems.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  {/* Línea vertical */}
                  {index < cronogramaItems.length - 1 && (
                    <div
                      className="absolute left-11 top-24 w-0.5 h-12 bg-gradient-to-b from-slate-300 to-slate-100"
                      style={{
                        top: `${56 + index * 100}px`,
                        height: "60px",
                      }}
                    />
                  )}

                  {/* Marcador */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                      {getIconForActivity(item.actividad) || (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 pt-1.5">
                    {item.hora && (
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">
                        {item.hora}
                      </p>
                    )}
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {item.actividad}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== PREGUNTAS FRECUENTES ===== */}
      {faqs.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-5 border-b border-amber-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-900/10">
              <FiHelpCircle className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Preguntas frecuentes
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Resolvemos tus dudas sobre el evento
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className="p-6 md:p-8 space-y-3">
            {faqs.map((faq) => renderFaqItem(faq))}
          </div>
        </section>
      )}

      {/* ===== REGALO / TRANSFERENCIAS ===== */}
      {(textoCuentasBancarias || textoYape) && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-100 px-6 py-5 border-b border-pink-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-900/10">
              <FiGift className="w-5 h-5 text-pink-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Si deseas acompañarnos con un detalle
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tu presencia es lo más importante, pero aquí las opciones
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {textoCuentasBancarias && (
              <button
                onClick={() => setPestaañaRegalosSeleccionada("transfer")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  pestaañaRegalosSeleccionada === "transfer"
                    ? "text-slate-900 border-b-2 border-slate-900 bg-slate-50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiCreditCard className="w-4 h-4" />
                Transferencia
              </button>
            )}
            {textoYape && (
              <button
                onClick={() => setPestaañaRegalosSeleccionada("yape")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  pestaañaRegalosSeleccionada === "yape"
                    ? "text-slate-900 border-b-2 border-slate-900 bg-slate-50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiSmartphone className="w-4 h-4" />
                Yape / Plin
              </button>
            )}
          </div>

          {/* Contenido */}
          <div className="p-6 md:p-8">
            {pestaañaRegalosSeleccionada === "transfer" && textoCuentasBancarias && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                  <pre className="text-xs sm:text-sm text-slate-800 font-mono whitespace-pre-wrap break-words">
                    {textoCuentasBancarias}
                  </pre>
                </div>
                <p className="text-xs text-slate-600 italic">
                  Por favor, envía comprobante al WhatsApp de la pareja después
                  de realizar la transferencia.
                </p>
              </div>
            )}

            {pestaañaRegalosSeleccionada === "yape" && textoYape && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
                  <p className="text-sm sm:text-base text-slate-800 whitespace-pre-wrap">
                    {textoYape}
                  </p>
                </div>
                <p className="text-xs text-slate-600 italic">
                  Los datos de Yape/Plin están disponibles para tu comodidad.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-600 flex items-start gap-2">
              <span className="mt-0.5">♥</span>
              <span>
                Tu presencia es nuestro mejor regalo. El aporte es totalmente
                opcional.
              </span>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
