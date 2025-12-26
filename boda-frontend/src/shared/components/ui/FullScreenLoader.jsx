// // src/shared/components/ui/FullScreenLoader.jsx
// import React from "react";
// import { createPortal } from "react-dom";

// export function FullScreenLoader({ message = "Cargando..." }) {
//   if (typeof document === "undefined") return null;

//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
//       <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900/80 px-10 py-8 shadow-xl border border-white/10">
//         {/* Zona visual principal */}
//         <div className="relative">
//           {/* Anillo giratorio */}
//           <div className="w-24 h-24 rounded-full border-4 border-pink-300/40 border-t-transparent animate-spin" />

//           {/* Icono de novios al centro */}
//           <div className="absolute inset-2 flex items-center justify-center">
//             <img
//               src="/loader-novios.svg"
//               alt="Cargando tu web de boda"
//               className="h-14 w-14 drop-shadow-md"
//             />
//           </div>
//         </div>

//         {/* Mensaje principal */}
//         <p className="text-sm font-medium tracking-wide text-slate-100 uppercase">
//           {message}
//         </p>

//         {/* Mensaje secundario opcional */}
//         <p className="text-xs text-slate-300/80 text-center max-w-xs">
//           Preparando tu experiencia de boda personalizada...
//         </p>
//       </div>
//     </div>,
//     document.body
//   );
// }
// src/shared/components/ui/FullScreenLoader.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * FullScreenLoader (Intro + Contención)
 * - Fase 1: Intro (abre una vez, ~4s)
 * - Fase 2: Loop (abre/cierra suave en bucle) mientras siga cargando
 * - Desaparece cuando tu app deja de renderizarlo (LoadingOverlayContext)
 */
export function FullScreenLoader({ message = "Cargando..." }) {
  if (typeof document === "undefined") return null;

  // Intro: arranca con un pequeño delay para que se renderice estable
  const START_DELAY = 280;
  const INTRO_TOTAL = 3950; // debe calzar con timings de intro
  const CROSSFADE = 450; // transición intro -> loop

  const [introOpen, setIntroOpen] = useState(false);
  const [showLoop, setShowLoop] = useState(false);
  const [introFadeOut, setIntroFadeOut] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const t1 = setTimeout(() => {
      if (!mountedRef.current) return;
      setIntroOpen(true);
    }, START_DELAY);

    // al terminar el intro, si sigue montado el loader => activar loop
    const t2 = setTimeout(() => {
      if (!mountedRef.current) return;
      setShowLoop(true);
      setIntroFadeOut(true);
    }, START_DELAY + INTRO_TOTAL);

    // luego ocultamos capa intro (para que no consuma nada)
    const t3 = setTimeout(() => {
      if (!mountedRef.current) return;
      // ya no necesitamos la capa intro
      // (simplemente la dejamos invisible)
    }, START_DELAY + INTRO_TOTAL + CROSSFADE);

    return () => {
      mountedRef.current = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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

      {/* CSS embebido (clip-path + keyframes) */}
      <style>{`
        :root{
          --env:#f5f1e6;
          --env2:#efe8d8;
          --crease: rgba(15,23,42,.10);
          --seal:#9b1417;
          --seal2:#c21f26;
          --ease: cubic-bezier(.2,.9,.2,1);
          --ease2: cubic-bezier(.16,1,.3,1);

          /* Intro cinemático */
          --sealDur: 1050ms;
          --sideDur: 1600ms;
          --topDur: 1450ms;
          --bottomDur: 1400ms;

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

        /* sobre oversized para que nunca se vean bordes */
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

        .flap-top,.flap-bottom,.flap-left,.flap-right{
          position:absolute;
          inset:0;
          background:
            linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.05));
          background-color: var(--env);
          backface-visibility: visible;
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
          border:2px solid rgba(0,0,0,.18);
          opacity:.35;
        }
        .seal svg{
          width: clamp(52px, 4vw, 72px);
          height: clamp(52px, 4vw, 72px);
          filter: drop-shadow(0 8px 14px rgba(0,0,0,.20));
        }

        /* ───────────── INTRO (una vez) ───────────── */
        .intro.open .seal{ animation: sealBreak var(--sealDur) var(--ease2) forwards; animation-delay: var(--dSeal); }
        .intro.open .flap-left{ animation: flapLeft var(--sideDur) var(--ease) forwards; animation-delay: var(--dSides); }
        .intro.open .flap-right{ animation: flapRight var(--sideDur) var(--ease) forwards; animation-delay: calc(var(--dSides) + 80ms); }
        .intro.open .flap-top{ animation: flapTop var(--topDur) var(--ease) forwards; animation-delay: var(--dTop); }
        .intro.open .flap-bottom{ animation: flapBottom var(--bottomDur) var(--ease) forwards; animation-delay: var(--dBottom); }

        @keyframes sealBreak{
          0%{ transform: translate(-50%,-50%) scale(1); opacity:1; }
          18%{ transform: translate(-50%,-50%) scale(1.06); }
          40%{ transform: translate(-50%,-50%) scale(1.00); }
          70%{ transform: translate(-50%,-50%) scale(.78) rotate(-8deg); opacity:.65; }
          100%{ transform: translate(-50%,-50%) scale(.58) translateY(12px) rotate(-12deg); opacity:0; }
        }
        @keyframes flapLeft{
          0%{ transform: rotateY(0deg) translateZ(10px); }
          30%{ transform: rotateY(-28deg) translateZ(10px); }
          100%{ transform: rotateY(-128deg) translateX(-12px) translateZ(10px); opacity:.95; }
        }
        @keyframes flapRight{
          0%{ transform: rotateY(0deg) translateZ(10px); }
          30%{ transform: rotateY(28deg) translateZ(10px); }
          100%{ transform: rotateY(128deg) translateX(12px) translateZ(10px); opacity:.95; }
        }
        @keyframes flapTop{
          0%{ transform: rotateX(0deg) translateZ(8px); }
          30%{ transform: rotateX(26deg) translateZ(8px); }
          100%{ transform: rotateX(165deg) translateY(-6px) translateZ(8px); opacity:.92; }
        }
        @keyframes flapBottom{
          0%{ transform: rotateX(0deg) translateZ(6px); }
          20%{ transform: rotateX(-10deg) translateZ(6px); }
          100%{ transform: rotateX(-165deg) translateY(10px) translateZ(6px); opacity:.96; }
        }

        /* ───────────── LOOP (contención) ───────────── */
        .loop .seal{ animation: sealPulse 1200ms var(--ease2) infinite; }

        .loop .flap-left  { animation: flapLeftLoop 4800ms var(--ease) infinite; }
        .loop .flap-right { animation: flapRightLoop 4800ms var(--ease) infinite; }
        .loop .flap-top   { animation: flapTopLoop 4800ms var(--ease) infinite; }
        .loop .flap-bottom{ animation: flapBottomLoop 4800ms var(--ease) infinite; }

        @keyframes sealPulse{
          0%,100%{ transform: translate(-50%,-50%) scale(1); }
          50%{ transform: translate(-50%,-50%) scale(1.04); }
        }
        @keyframes flapLeftLoop{
          0%,18%{ transform: rotateY(0deg) translateZ(10px); }
          40%{ transform: rotateY(-28deg) translateZ(10px); }
          60%,78%{ transform: rotateY(-128deg) translateX(-12px) translateZ(10px); opacity:.95; }
          100%{ transform: rotateY(0deg) translateZ(10px); opacity:1; }
        }
        @keyframes flapRightLoop{
          0%,18%{ transform: rotateY(0deg) translateZ(10px); }
          40%{ transform: rotateY(28deg) translateZ(10px); }
          60%,78%{ transform: rotateY(128deg) translateX(12px) translateZ(10px); opacity:.95; }
          100%{ transform: rotateY(0deg) translateZ(10px); opacity:1; }
        }
        @keyframes flapTopLoop{
          0%,22%{ transform: rotateX(0deg) translateZ(8px); }
          45%{ transform: rotateX(26deg) translateZ(8px); }
          62%,78%{ transform: rotateX(165deg) translateY(-6px) translateZ(8px); opacity:.92; }
          100%{ transform: rotateX(0deg) translateZ(8px); opacity:1; }
        }
        @keyframes flapBottomLoop{
          0%,25%{ transform: rotateX(0deg) translateZ(6px); }
          48%{ transform: rotateX(-10deg) translateZ(6px); }
          66%,78%{ transform: rotateX(-165deg) translateY(10px) translateZ(6px); opacity:.96; }
          100%{ transform: rotateX(0deg) translateZ(6px); opacity:1; }
        }

        @media (prefers-reduced-motion: reduce){
          .intro.open .seal,.intro.open .flap-left,.intro.open .flap-right,.intro.open .flap-top,.intro.open .flap-bottom{ animation:none !important; }
          .loop .flap-left,.loop .flap-right,.loop .flap-top,.loop .flap-bottom,.loop .seal{ animation:none !important; }
        }
      `}</style>

      {/* CAPA INTRO (se desvanece hacia loop si sigue cargando) */}
      <div
        className="stage"
        style={{
          opacity: introFadeOut ? 0 : 1,
          transition: `opacity ${CROSSFADE}ms cubic-bezier(.16,1,.3,1)`,
          pointerEvents: "none",
        }}
      >
        <div className={`envelope intro ${introOpen ? "open" : ""}`} aria-hidden="true">
          <div className="env-base" />
          <div className="flap">
            <div className="flap-top" />
            <div className="flap-left" />
            <div className="flap-right" />
            <div className="flap-bottom" />
          </div>
        </div>

        <div className={`seal intro ${introOpen ? "open" : ""}`} aria-hidden="true">
          <div className="ring" />
          <svg viewBox="0 0 64 64">
            <defs>
              <linearGradient id="gIntro" x1="0" x2="1">
                <stop offset="0" stopColor="rgba(255,255,255,.92)" />
                <stop offset=".55" stopColor="rgba(255,255,255,.70)" />
                <stop offset="1" stopColor="rgba(255,255,255,.92)" />
              </linearGradient>
            </defs>
            <path
              fill="url(#gIntro)"
              d="M32 55s-18-11.7-24-22.8C2.5 21.1 9.2 10 20.7 10c5.7 0 9.1 3 11.3 6.2C34.2 13 37.6 10 43.3 10 54.8 10 61.5 21.1 56 32.2 50 43.3 32 55 32 55z"
            />
          </svg>
        </div>
      </div>

      {/* CAPA LOOP (aparece solo si el loader aún sigue después del intro) */}
      <div
        className="stage"
        style={{
          opacity: showLoop ? 1 : 0,
          transition: `opacity ${CROSSFADE}ms cubic-bezier(.16,1,.3,1)`,
          pointerEvents: "none",
        }}
      >
        <div className="envelope loop" aria-hidden="true">
          <div className="env-base" />
          <div className="flap">
            <div className="flap-top" />
            <div className="flap-left" />
            <div className="flap-right" />
            <div className="flap-bottom" />
          </div>
        </div>

        <div className="seal loop" aria-hidden="true">
          <div className="ring" />
          <svg viewBox="0 0 64 64">
            <defs>
              <linearGradient id="gLoop" x1="0" x2="1">
                <stop offset="0" stopColor="rgba(255,255,255,.92)" />
                <stop offset=".55" stopColor="rgba(255,255,255,.70)" />
                <stop offset="1" stopColor="rgba(255,255,255,.92)" />
              </linearGradient>
            </defs>
            <path
              fill="url(#gLoop)"
              d="M32 55s-18-11.7-24-22.8C2.5 21.1 9.2 10 20.7 10c5.7 0 9.1 3 11.3 6.2C34.2 13 37.6 10 43.3 10 54.8 10 61.5 21.1 56 32.2 50 43.3 32 55 32 55z"
            />
          </svg>
        </div>
      </div>

      {/* Texto (siempre visible) */}
      <div className="absolute inset-x-0 top-[62%] px-4 text-center">
        <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-slate-700">
          {message}
        </p>
        <p className="mt-2 text-[11px] md:text-xs text-slate-500">
          Preparando tu experiencia de boda personalizada...
        </p>
      </div>
    </div>,
    document.body
  );
}
