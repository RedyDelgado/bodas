// src/features/public/pages/BodaPublicPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";
import Plantilla01 from "../templates/Plantilla01";

const LOADER_COLOR = "#1E293B"; // azul para ícono y texto

function BodaPublicPage() {
  const { slug } = useParams(); // /boda/:slug

  const [boda, setBoda] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [invitadosResumen, setInvitadosResumen] = useState(null);

  const [estado, setEstado] = useState("loading"); // loading | ok | error
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setEstado("loading");

        let url = "/public/boda";
        if (slug) {
          url = `/public/boda/slug/${slug}`;
        }

        const response = await axiosClient.get(url);
        console.log("RESPUESTA API BODA PUBLICA ===>", response.data);

        const {
          boda: apiBoda = null,
          configuracion: apiConfig,
          fotos: apiFotosRaw,
          invitados_resumen: apiInvitadosResumen,
        } = response.data;

        const fotosNormalizadas =
          (Array.isArray(apiFotosRaw) ? apiFotosRaw : []) || [];

        console.log(
          "FOTOS QUE SE ENVIAN A PLANTILLA01 ===>",
          fotosNormalizadas
        );

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
    };

    fetchData();
  }, [slug]);
// ================== LOADING CON PNG DE NOVIOS ==================
if (estado === "loading") {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* Contenedor redondo con la imagen */}
        <div className="w-28 h-28 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center">
          <img
            src="/img/pareja-boda.png"     
            alt="Pareja de novios"
            className="w-24 h-24 object-contain animate-bounce"
          />
        </div>

        <p className="text-lg font-medium text-sky-800" style={{ color: LOADER_COLOR }}>
          Cargando la boda...
        </p>
      </div>
    </div>
  );
}
  // ================================================================

  if (estado === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-2">Ups...</h1>
          <p className="text-slate-600">{mensajeError}</p>
        </div>
      </div>
    );
  }

  if (!boda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-700">No se encontró información de la boda.</p>
      </div>
    );
  }

  return (
    <Plantilla01
      boda={boda}
      configuracion={configuracion}
      fotos={fotos}
      invitadosResumen={invitadosResumen}
    />
  );
}

export default BodaPublicPage;
