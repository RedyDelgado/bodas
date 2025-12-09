// src/features/public/pages/BodaPublicPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";
import Plantilla01 from "../templates/Plantilla01";

function BodaPublicPage() {
  const { slug } = useParams(); // /boda/:slug
  const [boda, setBoda] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [fotos, setFotos] = useState([]);
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

        // La API según tu captura: { boda: {...}, configuracion: {...}, fotos: [...] }
        const apiBoda = response.data.boda || null;
        const apiConfig =
          response.data.configuracion ||
          response.data.configuracion_boda ||
          apiBoda?.configuracion_boda ||
          null;

        const apiFotos =
          (Array.isArray(response.data.fotos)
            ? response.data.fotos
            : Array.isArray(response.data.fotos_boda)
            ? response.data.fotos_boda
            : Array.isArray(apiBoda?.fotos_boda)
            ? apiBoda.fotos_boda
            : []) || [];

        console.log("FOTOS QUE SE ENVIAN A PLANTILLA01 ===>", apiFotos);

        setBoda(apiBoda);
        setConfiguracion(apiConfig);
        setFotos(apiFotos);

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

  if (estado === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-700 text-lg">Cargando la boda...</p>
      </div>
    );
  }

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
    />
  );
}

export default BodaPublicPage;
