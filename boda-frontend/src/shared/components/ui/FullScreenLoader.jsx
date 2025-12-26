import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * SOBRE fullscreen (sin carta):
 * - El sello NO se mueve (solo se desvanece).
 * - Se abren los 4 pliegues.
 * - Cuando TOP y BOTTOM ya casi están abiertos (~85%), el sobre y sello se vuelven transparentes
 *   y se ve la web debajo.
 * - Sin “X” de pliegues.
 *
 * Props:
 *  done: boolean -> true cuando tu app ya terminó de cargar
 *  onHidden: () => void -> se llama cuando el overlay ya terminó el fade y puedes desmontarlo desde el Provider
 */
const ENVELOPE_CSS = `
  :root{
    --env:#f5f1e6;
    --env2:#efe8d8;

    --seal:#9b1417;
    --seal2:#c21f26;

    --ease: cubic-bezier(.2,.9,.2,1);

    --sideDur: 1600ms;
    --topDur: 1450ms;
    --bottomDur: 1400ms;

    --dSides: 950ms;
    --dTop: 1240ms;
    --dBottom: 1320ms;
  }

  *{ box-sizing:border-box; }

  .mw-intro{
    position:fixed;
    inset:0;
    z-index:9999;
    display:grid;
    place-items:center;
    background:
      radial-gradient(1100px 520px at 50% -10%, rgba(15,23,42,.06), transparent 60%),
      linear-gradient(180deg, #fff, #f8fafc);
    perspective: 1600px;

    pointer-events:auto;
    cursor: wait;

    opacity:1;

    /* REVEAL cuando TOP y BOTTOM casi están abiertos (≈ 2500ms) */
    --revealDelay: calc(var(--dBottom) + 1180ms);
  }

  /* Fade final del overlay completo */
  .mw-intro.mw-fadeout{
    animation: mwFadeOut var(--fadeMs) ease forwards;
  }
  @keyframes mwFadeOut{ to{ opacity:0; } }

  /* SOBRE oversized fullscreen */
  .mw-envelope{
    position:absolute;
    inset:-20vh -20vw;
    transform-style:preserve-3d;
    pointer-events:none;
    opacity:1;
  }

  .mw-env-base{
    position:absolute;
    inset:0;
    background: linear-gradient(180deg, var(--env), var(--env2));
    transform: translateZ(0);
  }

  /* QUITADO: la X fea de pliegues */
  .mw-env-base::before{ display:none; }

  .mw-flap{
    position:absolute;
    inset:0;
    transform-style:preserve-3d;
    pointer-events:none;
  }

  .mw-flap-top,.mw-flap-bottom,.mw-flap-left,.mw-flap-right{
    position:absolute;
    inset:0;
    background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.05));
    background-color: var(--env);
    backface-visibility: visible;
    transform-style:preserve-3d;
  }

  .mw-flap-top{
    clip-path: polygon(0 0, 100% 0, 50% 52%);
    transform-origin: 50% 0%;
    transform: rotateX(0deg) translateZ(8px);
    box-shadow: inset 0 -30px 60px rgba(2,6,23,.07);
  }

  .mw-flap-left{
    clip-path: polygon(0 0, 52% 50%, 0 100%);
    transform-origin: 0% 50%;
    transform: rotateY(0deg) translateZ(10px);
    box-shadow: inset -30px 0 60px rgba(2,6,23,.06);
    opacity:.985;
  }

  .mw-flap-right{
    clip-path: polygon(100% 0, 48% 50%, 100% 100%);
    transform-origin: 100% 50%;
    transform: rotateY(0deg) translateZ(10px);
    box-shadow: inset 30px 0 60px rgba(2,6,23,.06);
    opacity:.985;
  }

  .mw-flap-bottom{
    clip-path: polygon(0 100%, 100% 100%, 50% 48%);
    transform-origin: 50% 100%;
    transform: rotateX(0deg) translateZ(6px);
    box-shadow: inset 0 30px 60px rgba(2,6,23,.06);
    opacity:.97;
  }

  /* QUITADO: parte trasera del flap bottom */
  .mw-flap-bottom::after{ display:none; }

  /* SELLO fijo */
  .mw-seal{
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
    pointer-events:none;
    opacity:1;
  }

  .mw-seal::before{
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

  .mw-ring{
    position:absolute;
    inset:16%;
    border-radius:999px;
    border: 2px solid rgba(0,0,0,.18);
    opacity:.35;
  }

  .mw-seal svg{
    width: clamp(52px, 4vw, 72px);
    height: clamp(52px, 4vw, 72px);
    filter: drop-shadow(0 8px 14px rgba(0,0,0,.20));
  }

  /* Apertura */
  .mw-intro.open .mw-flap-left{
    animation: flapLeft var(--sideDur) var(--ease) forwards;
    animation-delay: var(--dSides);
  }
  .mw-intro.open .mw-flap-right{
    animation: flapRight var(--sideDur) var(--ease) forwards;
    animation-delay: calc(var(--dSides) + 80ms);
  }
  .mw-intro.open .mw-flap-top{
    animation: flapTop var(--topDur) var(--ease) forwards;
    animation-delay: var(--dTop);
  }
  .mw-intro.open .mw-flap-bottom{
    animation: flapBottom var(--bottomDur) var(--ease) forwards;
    animation-delay: var(--dBottom);
  }

  @keyframes flapLeft{
    0%{transform:rotateY(0deg) translateZ(10px);}
    30%{transform:rotateY(-28deg) translateZ(10px);}
    100%{transform:rotateY(-128deg) translateX(-12px) translateZ(10px);opacity:.95;}
  }
  @keyframes flapRight{
    0%{transform:rotateY(0deg) translateZ(10px);}
    30%{transform:rotateY(28deg) translateZ(10px);}
    100%{transform:rotateY(128deg) translateX(12px) translateZ(10px);opacity:.95;}
  }
  @keyframes flapTop{
    0%{transform:rotateX(0deg) translateZ(8px);}
    30%{transform:rotateX(26deg) translateZ(8px);}
    100%{transform:rotateX(165deg) translateY(-6px) translateZ(8px);opacity:.92;}
  }
  @keyframes flapBottom{
    0%{transform:rotateX(0deg) translateZ(6px);}
    20%{transform:rotateX(-10deg) translateZ(6px);}
    100%{transform:rotateX(-165deg) translateY(10px) translateZ(6px);opacity:.96;}
  }

  /* REVEAL: desaparece sobre + sello cuando TOP/BOTTOM casi abiertos */
  .mw-intro.open .mw-envelope{
    animation: envOut 220ms ease forwards;
    animation-delay: var(--revealDelay);
  }
  .mw-intro.open .mw-seal{
    animation: sealFade 180ms ease forwards;
    animation-delay: var(--revealDelay);
  }
  @keyframes envOut{ to{ opacity:0; } }
  @keyframes sealFade{ to{ opacity:0; } }

  @media (prefers-reduced-motion: reduce){
    .mw-intro.open .mw-flap-left,
    .mw-intro.open .mw-flap-right,
    .mw-intro.open .mw-flap-top,
    .mw-intro.open .mw-flap-bottom,
    .mw-intro.open .mw-envelope,
    .mw-intro.open .mw-seal{
      animation:none !important;
    }
  }
`;

export function FullScreenLoader({
  done = false,
  message = "Cargando...",
  startDelayMs = 200,
  introTotalMs = 3200, // escena mínima; si done llega antes, igual espera hasta esto para cerrar overlay
  fadeOutMs = 280,
  longWaitMs = 7000,
  onHidden,
}) {
  if (typeof document === "undefined") return null;

  const gradId = useId().replace(/:/g, "_");
  const startAtRef = useRef(0);
  const closeRef = useRef(null);
  const fadeRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [showAux, setShowAux] = useState(false);
  const [showLong, setShowLong] = useState(false);
  const [fading, setFading] = useState(false);

  const clearTimers = () => {
    if (closeRef.current) clearTimeout(closeRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);
    closeRef.current = null;
    fadeRef.current = null;
  };

  const doHide = () => {
    if (fading) return;
    setFading(true);
    fadeRef.current = setTimeout(() => {
      if (typeof onHidden === "function") onHidden();
    }, fadeOutMs);
  };

  useEffect(() => {
    startAtRef.current = performance.now();

    const t0 = setTimeout(() => setOpen(true), startDelayMs);
    const t1 = setTimeout(() => setShowAux(true), startDelayMs + introTotalMs);
    const t2 = setTimeout(() => setShowLong(true), longWaitMs);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimers();
    };
  }, [startDelayMs, introTotalMs, longWaitMs]);

  useEffect(() => {
    if (!done) return;

    const elapsed = performance.now() - startAtRef.current;
    const minScene = startDelayMs + introTotalMs;
    const remaining = Math.max(0, minScene - elapsed);

    clearTimers();
    closeRef.current = setTimeout(() => doHide(), remaining);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, startDelayMs, introTotalMs]);

  return createPortal(
    <div
      className={`mw-intro ${open ? "open" : ""} ${fading ? "mw-fadeout" : ""}`}
      style={{ ["--fadeMs"]: `${fadeOutMs}ms` }}
      aria-busy="true"
      role="status"
      aria-label="Cargando"
    >
      <style dangerouslySetInnerHTML={{ __html: ENVELOPE_CSS }} />

      <div className="mw-envelope" aria-hidden="true">
        <div className="mw-env-base" />
        <div className="mw-flap">
          <div className="mw-flap-top" />
          <div className="mw-flap-left" />
          <div className="mw-flap-right" />
          <div className="mw-flap-bottom" />
        </div>
      </div>

      <div className="mw-seal" aria-hidden="true">
        <div className="mw-ring" />
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id={`mw_g_${gradId}`} x1="0" x2="1">
              <stop offset="0" stopColor="rgba(255,255,255,.92)" />
              <stop offset=".55" stopColor="rgba(255,255,255,.70)" />
              <stop offset="1" stopColor="rgba(255,255,255,.92)" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#mw_g_${gradId})`}
            d="M32 55s-18-11.7-24-22.8C2.5 21.1 9.2 10 20.7 10c5.7 0 9.1 3 11.3 6.2C34.2 13 37.6 10 43.3 10 54.8 10 61.5 21.1 56 32.2 50 43.3 32 55 32 55z"
          />
        </svg>
      </div>

      {showAux && !done && (
        <div
          className="absolute inset-x-0 bottom-10 flex justify-center px-4"
          style={{ zIndex: 99999 }}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200 shadow-xl px-4 py-3 max-w-[620px] w-full sm:w-auto">
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
