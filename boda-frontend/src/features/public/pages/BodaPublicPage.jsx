import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../../shared/config/axiosClient";
import Plantilla01 from "../templates/Plantilla01";

// import Plantilla02 from "../templates/Plantilla02"; // para futuro

function BodaPublicPage() {
  const { slug } = useParams(); // para /demo-boda/:slug
  const [data, setData] = useState(null);
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

        setData(response.data);
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

  const { boda, configuracion, fotos } = data;

  // En el futuro, podrías cambiar según boda.plantilla.slug
  return (
    <Plantilla01
      boda={boda}
      configuracion={configuracion}
      fotos={fotos}
    />
  );
}

export default BodaPublicPage;
