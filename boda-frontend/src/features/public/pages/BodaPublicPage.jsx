// src/features/public/pages/BodaPublicPage.jsx
import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";
import Plantilla01 from "../templates/Plantilla01";
import SEOHead from "../../../shared/components/SEOHead";
import { useLoadingOverlay } from "../../../shared/context/LoadingOverlayContext"; 

const LOADER_COLOR = "#1E293B"; // azul para ícono y texto
const COLOR_DORADO = "#D4AF37";

function BodaPublicPage() {
  const { slug } = useParams();

  const [boda, setBoda] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [invitadosResumen, setInvitadosResumen] = useState(null);

  const [estado, setEstado] = useState("loading"); // loading | ok | error
  const [mensajeError, setMensajeError] = useState("");
  const { showLoader, hideLoader } = useLoadingOverlay();

  useEffect(() => {
    if (estado === "loading") showLoader("Cargando la boda...");
    else hideLoader();

    return () => hideLoader();
  }, [estado]);

  const fetchData = useCallback(async () => {
    try {
      setEstado("loading");
      setMensajeError("");

      let url = "/public/boda";
      if (slug) url = `/public/boda/slug/${slug}`;

      const response = await axiosClient.get(url);

      const {
        boda: apiBoda = null,
        configuracion: apiConfig,
        fotos: apiFotosRaw,
        invitados_resumen: apiInvitadosResumen,
      } = response.data;

      const fotosNormalizadas =
        (Array.isArray(apiFotosRaw) ? apiFotosRaw : []) || [];

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
  }, [slug]);

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
    // Apenas entro a /boda/:slug
    if (slug) document.title = "Cargando… | MiWebDeBodas";
    else document.title = "MiWebDeBodas";
  }, [slug]);

  useEffect(() => {
    // Cuando ya tengo datos
    const nombre = boda?.nombre_pareja?.trim();
    document.title = nombre ? `${nombre}` : "MiWebDeBodas";
  }, [boda?.nombre_pareja]);

  // ============= Datos para SEO dinámico =============
  const seoData = useMemo(() => {
    if (!boda) return null;

    const currentUrl = window.location.href;

    // Obtener nombre de la pareja (priorizando nombres individuales)
    const nombrePareja =
      boda.nombre_novio_1 && boda.nombre_novio_2
        ? `${boda.nombre_novio_1} & ${boda.nombre_novio_2}`
        : boda.nombre_pareja || "Nuestra boda";

    // Descripción personalizada
    const descripcion =
      configuracion?.texto_bienvenida ||
      `Te invitamos a celebrar nuestra boda. ${nombrePareja}. ¡Confirma tu asistencia!`;

    // Imagen para compartir (usar la primera foto de hero o una por defecto)
    const imagen =
      fotos && fotos.length > 0 && fotos[0]?.url
        ? fotos[0].url
        : "https://miwebdebodas.com/og-image.png";

    return {
      title: `${nombrePareja} - Nuestra Boda | MiWebDeBodas`,
      description: descripcion.substring(0, 160), // Limitar a 160 caracteres
      image: imagen,
      url: currentUrl,
    };
  }, [boda, configuracion, fotos]);

  // ================== LOADING PREMIUM ==================
  if (estado === "loading") {
    return (
      <PremiumShell>
        <div className="min-h-screen" />
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

  // ================== NO BODA ==================
  if (!boda) {
    return (
      <PremiumShell>
        <div
          className="w-full max-w-lg rounded-[2rem] border bg-white/80 backdrop-blur-md shadow-xl p-7 sm:p-9"
          style={{ borderColor: `${COLOR_DORADO}40` }}
        >
          <h2 className="text-xl font-semibold text-slate-900">
            Boda no encontrada
          </h2>
          <p className="mt-2 text-slate-600">
            No se encontró información para mostrar.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 rounded-full font-semibold border bg-white hover:bg-slate-50 transition"
            style={{ borderColor: `${COLOR_DORADO}60`, color: LOADER_COLOR }}
          >
            Intentar nuevamente
          </button>
        </div>
      </PremiumShell>
    );
  }

  return (
    <>
      {/* Meta tags dinámicos para compartir en redes sociales */}
      {seoData && (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          image={seoData.image}
          url={seoData.url}
        />
      )}

      <Plantilla01
        boda={boda}
        configuracion={configuracion}
        fotos={fotos}
        invitadosResumen={invitadosResumen}
      />
    </>
  );
}

export default BodaPublicPage;
