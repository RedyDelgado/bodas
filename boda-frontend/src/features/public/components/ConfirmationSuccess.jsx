// src/features/public/components/ConfirmationSuccess.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { LuSparkles, LuPartyPopper } from "react-icons/lu";
import {
  COLOR_DORADO,
  COLOR_CORAL,
  COLOR_MARFIL,
  COLOR_AZUL,
} from "../../../shared/styles/colors";

/**
 * Componente de éxito de confirmación con animación celebratoria
 * Muestra confeti, luces, y un mensaje personalizado
 */
export function ConfirmationSuccess({
  nombreInvitado,
  cantidadPersonas,
  onClose,
}) {
  const refAudio = useRef(null);

  // Generar confeti aleatorio
  const particulasConfeti = useMemo(() => {
    const colores = [COLOR_DORADO, COLOR_CORAL, COLOR_MARFIL, COLOR_AZUL];
    return Array.from({ length: 60 }).map((_, i) => {
      const retrasoAleatorio = Math.random() * 0.8;
      const duracionAleatoria = 2.5 + Math.random() * 1;
      const izquierdaAleatoria = Math.random() * 100;
      const tamañoAleatorio = 4 + Math.random() * 8;

      return {
        id: i,
        izquierda: izquierdaAleatoria,
        retraso: retrasoAleatorio,
        duracion: duracionAleatoria,
        tamaño: tamañoAleatorio,
        color: colores[Math.floor(Math.random() * colores.length)],
      };
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes confetti-pop {
          0% {
            transform: translate3d(0, -100%, 0) rotateZ(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 110vh, 0) rotateZ(720deg) scale(0);
            opacity: 0;
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-30vh) scale(0.5);
            opacity: 0;
          }
        }

        .confetti-particle {
          position: absolute;
          top: -10px;
          width: 100%;
          pointer-events: none;
        }

        .pulse-ring {
          animation: pulse-ring 0.8s ease-out infinite;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/60 via-black/50 to-black/40 backdrop-blur-sm px-4 overflow-hidden">
        {/* Audio de celebración */}
        <audio ref={refAudio} src="/sounds/celebration.mp3" />

        {/* Confeti cayendo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particulasConfeti.map((particula) => (
            <div
              key={particula.id}
              style={{
                position: "absolute",
                left: `${particula.izquierda}%`,
                top: "-20px",
                width: particula.tamaño,
                height: particula.tamaño * 0.6,
                backgroundColor: particula.color,
                borderRadius: "50%",
                animation: `confetti-pop ${particula.duracion}s linear ${particula.retraso}s forwards`,
              }}
            />
          ))}
        </div>

        {/* Contenedor central */}
        <div className="relative z-10 max-w-2xl w-full">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Tarjeta de celebración */}
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-black/95 border border-yellow-500/40 rounded-3xl shadow-2xl overflow-hidden">
            {/* Línea decorativa superior */}
            <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

            <div className="p-8 sm:p-12 text-center">
              {/* Ícono animado */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full bg-yellow-500/20 pulse-ring"
                    style={{ animation: "pulse-ring 0.8s ease-out" }}
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                    <FiCheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Etiqueta */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                <LuSparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-widest">
                  Confirmado
                </span>
              </div>

              {/* Título principal */}
              <h2 className="text-3xl sm:text-4xl font-serif text-white mb-3 drop-shadow-lg">
                ¡Gracias por decir que sí!
              </h2>

              {/* Subtítulo con nombre */}
              <p className="text-base sm:text-lg text-slate-200 mb-6">
                {nombreInvitado && (
                  <>
                    Nos hace mucha felicidad que{" "}
                    <span className="font-semibold text-yellow-300">
                      {nombreInvitado}
                    </span>{" "}
                    {cantidadPersonas > 1
                      ? `(junto a ${cantidadPersonas - 1} persona(s) más) `
                      : ""}
                    acompañe este día tan especial.
                  </>
                )}
                {!nombreInvitado && "Estamos felices de que confirmes tu asistencia."}
              </p>

              {/* Mensaje romántico */}
              <div className="bg-white/5 border border-yellow-500/20 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-sm">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed italic">
                  "Tu presencia es el regalo más valioso que podemos recibir.
                  Estamos ansiosos de compartir este momento inolvidable contigo."
                </p>
              </div>

              {/* Información útil */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                    Personas confirmadas
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {cantidadPersonas || 1}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                    Estado
                  </p>
                  <p className="text-lg font-bold text-emerald-400">Confirmado</p>
                </div>
              </div>

              {/* Próximos pasos */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <LuPartyPopper className="w-4 h-4" />
                  Próximos pasos
                </p>
                <ul className="text-sm text-blue-100 space-y-1.5">
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">→</span>
                    <span>Desplázate para ver el cronograma del día</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">→</span>
                    <span>Revisa preguntas frecuentes y detalles</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">→</span>
                    <span>Consulta opciones de regalo si lo deseas</span>
                  </li>
                </ul>
              </div>

              {/* Botón para cerrar */}
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <span>Ver detalles de la boda</span>
                <span>→</span>
              </button>

              {/* Línea decorativa inferior */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-500/50" />
                <span className="text-xs text-slate-500">♥</span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-500/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
