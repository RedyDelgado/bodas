// src/shared/components/ui/FullScreenLoader.jsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function FullScreenLoader({ message = "Cargando..." }) {
  if (typeof document === "undefined") return null;

  // Ajustes finos
  const START_DELAY_MS = 280;     // arranque suave del intro
  const INTRO_TOTAL_MS = 3950;    // duración total del intro (según tu CSS)
  const AUX_SHOW_GAP_MS = 200;    // delay para mostrar auxiliar tras el intro
  const LONG_WAIT_MS = 7000;      // a los 7s muestra mensaje "demora"

  const [open, setOpen] = useState(false);
  const [showAux, setShowAux] = useState(false);
  const [showLong, setShowLong] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setOpen(true), START_DELAY_MS);

    // Si el loader sigue montado al finalizar el intro, mostramos auxiliar
    const t1 = setTimeout(() => setShowAux(true), START_DELAY_MS + INTRO_TOTAL_MS + AUX_SHOW_GAP_MS);

    // Mensaje extra si sigue demorando (contención)
    const t2 = setTimeout(() => setShowLong(true), LONG_WAIT_MS);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 50% -10%, rgba(15,23,42,.06), transparent 60%), linear-gradient(180deg, #fff, #f8fafc)",
        }}
      />

      {/* CSS embebido para animación del sobre */}
      <style>{`
        :root{
          --env:#f5f1e6;
          --env2:#efe8d8;
          --crease: rgba(15,23,42,.10);

          --seal:#9b1417;
          --seal2:#c21f26;

          --ease: cubic-bezier(.2,.9,.2,1);
          --ease2: cubic-bezier(.16,1,.3,1);

          /* cinemático */
          --sealDur: 1050ms;
          --sideDur: 1600ms;
          --topDur: 1450ms;
          --bottomDur: 1400ms;

          /* delays */
          --dSeal: 220ms;
          --dSides: 950ms;
          --dTop: 1240ms;
          --dBottom: 1320ms;
        }

        .stage{
          position:absolute;
          inset:0;
          display:grid;
          place-items:center;
          perspective:1600px;
        }

        /* Sobre oversized para no ver bordes */
        .envelope{
          position:absolute;
          inset:-20vh -20vw;
          transform-style:preserve-3d;
        }

        .env-base{
          position:absolute;
          inset:0;
          background: linear-gradient(180deg, var(--env), var(--env2));
          transform: translateZ(0);
        }

        .env-base::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            linear-gradient(135deg, transparent 49.3%, var(--crease) 50%, transparent 50.7%),
            linear-gradient(225deg, transparent 49.3%, var(--crease) 50%, transparent 50.7%);
          opacity:.55;
          mix-blend-mode:multiply;
          pointer-events:none;
        }

        .flap{
          position:absolute;
          inset:0;
          transform-style:preserve-3d;
          pointer-events:none;
        }

        .flap-top, .flap-bottom, .flap-left, .flap-right{
          position:absolute;
          inset:0;
          background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.05));
          background-color: var(--env);
          backface-visibility: visible; /* clave para que no “desaparezca” */
          transform-style:preserve-3d;
        }

        .flap-top{
          clip-path: polygon(0 0, 100% 0, 50% 52%);
          transform-origin: 50% 0%;
          transform: rotateX(0deg) translateZ(8px);
          box-shadow: inset 0 -30px 60px rgba(2,6,23,.07);
        }

        .flap-left{
          clip-path: polygon(0 0, 52% 50%, 0 100%);
          transform-origin: 0% 50%;
          transform: rotateY(0deg) translateZ(10px);
          box-shadow: inset -30px 0 60px rgba(2,6,23,.06);
          opacity:.985;
        }

        .flap-right{
          clip-path: polygon(100% 0, 48% 50%, 100% 100%);
          transform-origin: 100% 50%;
          transform: rotateY(0deg) translateZ(10px);
          box-shadow: inset 30px 0 60px rgba(2,6,23,.06);
          opacity:.985;
        }

        /* Bottom con cara trasera */
        .flap-bottom{
          clip-path: polygon(0 100%, 100% 100%, 50% 48%);
          transform-origin: 50% 100%;
          transform: rotateX(0deg) translateZ(6px);
          box-shadow: inset 0 30px 60px rgba(2,6,23,.06);
          opacity:.97;
        }

        .flap-bottom::after{
          content:"";
          position:absolute;
          inset:0;
          clip-path: polygon(0 100%, 100% 100%, 50% 48%);
          background: linear-gradient(180deg, rgba(2,6,23,.06), rgba(255,255,255,.02));
          background-color: var(--env2);
          transform: rotateX(180deg);
          transform-origin: 50% 50%;
          box-shadow: inset 0 -20px 45px rgba(2,6,23,.05);
        }

        /* Sello centrado */
        .seal{
          position:absolute;
          left:50%;
          top:50%;
          transform: translate(-50%,-50%);
          width: clamp(120px, 10vw, 170px);
          height: clamp(120px, 10vw, 170px);
          border-radius:999px;
          background:
            radial-gradient(circle at 30% 22%, rgba(255,255,255,.22), transparent 46%),
            radial-gradient(circle at 60% 75%, rgba(255,255,255,.10), transparent 55%),
            linear-gradient(180deg, var(--seal2), var(--seal));
          box-shadow: 0 22px 55px rgba(2,6,23,.30);
          z-index:10;
          display:grid;
          place-items:center;
          user-select:none;
          pointer-events:none; /* loader: no clickeable */
        }

        .seal::before{
          content:"";
          position:absolute;
          inset:-10px;
          border-radius:999px;
          background:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,.12), transparent 55%),
            radial-gradient(circle at 80% 70%, rgba(0,0,0,.10), transparent 60%),
            linear-gradient(180deg, #c3262c, #861015);
          clip-path: polygon(
            50% 0%, 64% 4%, 76% 12%, 86% 24%, 92% 40%, 90% 55%, 82% 70%,
            70% 82%, 54% 92%, 40% 94%, 26% 88%, 14% 76%, 8% 60%, 6% 44%,
            10% 28%, 20% 14%, 34% 6%
          );
          z-index:-1;
          box-shadow: 0 12px 25px rgba(2,6,23,.18);
        }

        .seal .ring{
          position:absolute;
          inset:16%;
          border-radius:999px;
          border: 2px solid rgba(0,0,0,.18);
          opacity:.35;
          pointer-events:none;
        }

        .seal svg{
          width: clamp(52px, 4vw, 72px);
          height: clamp(52px, 4vw, 72px);
          filter: drop-shadow(0 8px 14px rgba(0,0,0,.20));
        }

        /* ───────── INTRO: abre una vez ───────── */
        .openOnce .seal{
          animation: sealBreak var(--sealDur) var(--ease2) forwards;
          animation-delay: var(--dSeal);
        }
        .openOnce .flap-left{
          animation: flapLeft var(--sideDur) var(--ease) forwards;
          animation-delay: var(--dSides);
        }
        .openOnce .flap-right{
          animation: flapRight var(--sideDur) var(--ease) forwards;
          animation-delay: calc(var(--dSides) + 80ms);
        }
        .openOnce .flap-top{
          animation: flapTop var(--topDur) var(--ease) forwards;
          animation-delay: var(--dTop);
        }
        .openOnce .flap-bottom{
          animation: flapBottom var(--bottomDur) var(--ease) forwards;
          animation-delay: var(--dBottom);
        }

        @keyframes sealBreak{
          0%   { transform: translate(-50%,-50%) scale(1); opacity:1; }
          18%  { transform: translate(-50%,-50%) scale(1.06); }
          40%  { transform: translate(-50%,-50%) scale(1.00); }
          70%  { transform: translate(-50%,-50%) scale(.78) rotate(-8deg); opacity:.65; }
          100% { transform: translate(-50%,-50%) scale(.58) translateY(12px) rotate(-12deg); opacity:0; }
        }
        @keyframes flapLeft{
          0%   { transform: rotateY(0deg) translateZ(10px); }
          30%  { transform: rotateY(-28deg) translateZ(10px); }
          100% { transform: rotateY(-128deg) translateX(-12px) translateZ(10px); opacity:.95; }
        }
        @keyframes flapRight{
          0%   { transform: rotateY(0deg) translateZ(10px); }
          30%  { transform: rotateY(28deg) translateZ(10px); }
          100% { transform: rotateY(128deg) translateX(12px) translateZ(10px); opacity:.95; }
        }
        @keyframes flapTop{
          0%   { transform: rotateX(0deg) translateZ(8px); }
          30%  { transform: rotateX(26deg) translateZ(8px); }
          100% { transform: rotateX(165deg) translateY(-6px) translateZ(8px); opacity:.92; }
        }
        @keyframes flapBottom{
          0%   { transform: rotateX(0deg) translateZ(6px); }
          20%  { transform: rotateX(-10deg) translateZ(6px); }
          100% { transform: rotateX(-165deg) translateY(10px) translateZ(6px); opacity:.96; }
        }

        @media (prefers-reduced-motion: reduce){
          .openOnce .seal, .openOnce .flap-left, .openOnce .flap-right, .openOnce .flap-top, .openOnce .flap-bottom{
            animation:none !important;
          }
        }
      `}</style>

      {/* Capa visual del sobre (siempre bloquea interacción) */}
      <div className="stage" aria-hidden="true">
        <div className="envelope">
          <div className="env-base" />
          <div className={`flap ${open ? "openOnce" : ""}`}>
            <div className="flap-top" />
            <div className="flap-left" />
            <div className="flap-right" />
            <div className="flap-bottom" />
          </div>
        </div>

        {/* Sello (se rompe en el intro) */}
        <div className={`seal ${open ? "openOnce" : ""}`}>
          <div className="ring" />
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="rgba(255,255,255,.92)" />
                <stop offset=".55" stopColor="rgba(255,255,255,.70)" />
                <stop offset="1" stopColor="rgba(255,255,255,.92)" />
              </linearGradient>
            </defs>
            <path
              fill="url(#g)"
              d="M32 55s-18-11.7-24-22.8C2.5 21.1 9.2 10 20.7 10c5.7 0 9.1 3 11.3 6.2C34.2 13 37.6 10 43.3 10 54.8 10 61.5 21.1 56 32.2 50 43.3 32 55 32 55z"
            />
          </svg>
        </div>
      </div>

      {/* AUXILIAR: aparece solo si sigue cargando después del intro */}
      {showAux && (
        <div className="absolute inset-x-0 bottom-10 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl px-4 py-3 max-w-[560px] w-full sm:w-auto">
            <div className="h-9 w-9 rounded-full border-2 border-slate-400/40 border-t-slate-700 animate-spin" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-700 truncate">
                {message}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Espera un momento, estamos cargando la web de los novios...
                {showLong ? " (Está demorando más de lo normal)" : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
