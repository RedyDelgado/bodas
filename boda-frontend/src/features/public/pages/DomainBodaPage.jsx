// src/features/public/pages/DomainBodaPage.jsx
/**
 * Página para dominio personalizado.
 * Detecta automáticamente el dominio y carga la boda correspondiente.
 * Esencialmente es igual a BodaPublicPage, pero sin slug (usa Host detection).
 */

import { useCallback, useEffect, useState } from "react";
import axiosClient from "../../../shared/config/axiosClient";
import Plantilla01 from "../templates/Plantilla01";

const LOADER_COLOR = "#1E293B";
const COLOR_DORADO = "#D4AF37";

function DomainBodaPage() {
  const [boda, setBoda] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [invitadosResumen, setInvitadosResumen] = useState(null);
  const [estado, setEstado] = useState("loading");
  const [mensajeError, setMensajeError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setEstado("loading");
      setMensajeError("");

      // Llama a /api/public/boda SIN slug
      // El backend detecta por Host (dominio personalizado)
      const response = await axiosClient.get("/public/boda");

      const {
        boda: apiBoda = null,
        configuracion: apiConfig,
        fotos: apiFotosRaw,
        invitados_resumen: apiInvitadosResumen,
      } = response.data;

      const fotosNormalizadas = (Array.isArray(apiFotosRaw) ? apiFotosRaw : []) || [];

      setBoda(apiBoda);
      setConfiguracion(apiConfig);
      setFotos(fotosNormalizadas);
      setInvitadosResumen(apiInvitadosResumen || null);

      setEstado("ok");
    } catch (error) {
      console.error(error);
      setEstado("error");

      if (error.response?.status === 404) {
        setMensajeError("Esta boda no existe o aún no ha sido publicada.");
      } else {
        setMensajeError("Ocurrió un problema al cargar la boda.");
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====== Layout base premium reutilizable ======
  const PremiumShell = ({ children }) => (
    <div className="min-h-screen relative overflow-hidden bg-[#F8F4E3]">
      {/* Glows */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
        style={{ background: `${COLOR_DORADO}33` }}
      />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 bg-rose-300" />

      {/* textura suave */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(212,175,55,0.18),transparent_55%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );

  useEffect(() => {
    const dominio = window.location.hostname;
    const nombre = boda?.nombre_pareja?.trim();
    if (nombre) {
      document.title = `${nombre} | ${dominio}`;
    } else {
      document.title = "Cargando… | " + dominio;
    }
  }, [boda?.nombre_pareja]);

  // ================== LOADING PREMIUM ==================
  if (estado === "loading") {
    return (
      <PremiumShell>
        <div
          className="w-full max-w-lg rounded-[2rem] border bg-white/80 backdrop-blur-md shadow-xl p-7 sm:p-9"
          style={{ borderColor: `${COLOR_DORADO}40` }}
        >
          <div className="flex items-center gap-5">
            {/* Loader ring */}
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border-2 opacity-40"
                style={{ borderColor: `${COLOR_DORADO}55` }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: COLOR_DORADO,
                  borderRightColor: `${COLOR_DORADO}55`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/img/pareja-boda.png"
                  alt="Pareja de novios"
                  className="w-12 h-12 object-contain animate-[float_2.2s_ease-in-out_infinite]"
                />
              </div>
            </div>

            <div className="min-w-0">
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: LOADER_COLOR }}
              >
                Cargando la boda…
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Estamos preparando tu invitación con estilo ✨
              </p>

              {/* dots */}
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          </div>

          {/* hint */}
          <div
            className="mt-6 h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLOR_DORADO}55, transparent)`,
            }}
          />
          <p className="mt-4 text-xs text-slate-500">
            Tip: si subiste fotos en alta resolución, puede tardar un poco más.
          </p>

          {/* keyframes float */}
          <style>{`
            @keyframes float {
              0%,100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      </PremiumShell>
    );
  }

  // ================== ERROR PREMIUM ==================
  if (estado === "error") {
    return (
      <PremiumShell>
        <div
          className="w-full max-w-lg rounded-[2rem] border bg-white/80 backdrop-blur-md shadow-xl p-7 sm:p-9"
          style={{ borderColor: `${COLOR_DORADO}40` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl border bg-white flex items-center justify-center"
              style={{ borderColor: `${COLOR_DORADO}55` }}
            >
              <span className="text-xl">⚠️</span>
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                No pudimos cargar la página
              </h1>
              <p className="mt-2 text-slate-600">{mensajeError}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={fetchData}
                  className="px-5 py-2.5 rounded-full font-semibold border bg-white hover:bg-slate-50 transition"
                  style={{
                    borderColor: `${COLOR_DORADO}60`,
                    color: LOADER_COLOR,
                  }}
                >
                  Reintentar
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-full font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Recargar página
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Si el problema persiste, revisa tu conexión o intenta más tarde.
              </p>
            </div>
          </div>
        </div>
      </PremiumShell>
    );
  }

  // ================== DISPLAY BODA ==================
  return (
    <div>
      {boda && configuracion && fotos ? (
        <Plantilla01
          boda={boda}
          configuracion={configuracion}
          fotos={fotos}
          invitadosResumen={invitadosResumen}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">No hay datos disponibles.</p>
        </div>
      )}
    </div>
  );
}

export default DomainBodaPage;
