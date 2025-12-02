// src/features/bodas/pages/BodaConfigPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMiBodaActual } from "../hooks/useBodas";
import { useConfiguracionBoda } from "../hooks/useConfiguracionBoda";
import axiosClient from "../../../shared/config/axiosClient";

/* Iconos simples (no dependencias extras) */
function IconChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M15 18L9 12L15 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSparkles(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M12 3l1.3 3.3L16.5 8 13.3 9.3 12 12l-1.3-2.7L7.5 8l3.2-1.7L12 3zM6 13l.7 1.8L9 15l-1.3.7L7 17l-.7-1.3L5 15l1.3-.2L6 13zm10 3l.7 1.8L19 18l-1.3.7L17 20l-.7-1.3L15 18l1.3-.2L16 16z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 3.5v3M16 3.5v3M3.5 9.5h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGift(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <rect
        x="3.5"
        y="9"
        width="17"
        height="11.5"
        rx="1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 4v16.5M3.5 9h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.2 4.5C8.2 3.7 7 3.5 6.2 4.3 5.4 5.1 5.5 6.3 6.3 7.2 7.1 8 8.6 8.3 9.9 8.1c.1-1.2-.3-2.4-.7-3.6zM14.8 4.5c1-0.8 2.2-1 3-0.2.8.8.7 2-0.1 2.9-0.8.9-2.3 1.2-3.6 1 0-1.2.3-2.4.7-3.7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconStory(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M6 5.5C7.7 5 9.5 4.7 12 4.7s4.3.3 6 0.8v11.5c-1.7-.5-3.5-.8-6-.8s-4.3.3-6 .8V5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.5L12 11l2.8-1.5M12 11v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCamera(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <rect
        x="3.5"
        y="6.5"
        width="17"
        height="13"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 6.5l1-2h4l1 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="13"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconFAQ(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M4.5 5.5A2.5 2.5 0 0 1 7 3h10a2.5 2.5 0 0 1 2.5 2.5v7.5A2.5 2.5 0 0 1 17 15.5h-4.2L9 19.5v-4H7A2.5 2.5 0 0 1 4.5 13V5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 8.5a1.8 1.8 0 0 1 3.1-1.2c.3.3.4.7.4 1.1 0 .9-.6 1.3-1.1 1.6-.6.3-1 .7-1 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="13.9" r="0.8" fill="currentColor" />
    </svg>
  );
}

const MAX_MB = 3;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export function BodaConfigPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    boda,
    cargando: cargandoBoda,
    error: errorBoda,
  } = useMiBodaActual();

  const bodaId = boda?.id ?? searchParams.get("boda") ?? null;

  const {
    config,
    cargando,
    guardando,
    error,
    mensajeOk,
    guardar,
  } = useConfiguracionBoda(bodaId);

  // -------- FOTOS BODA ----------
  const [fotos, setFotos] = useState([]);
  const [cargandoFotos, setCargandoFotos] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFotos, setErrorFotos] = useState("");

    

// modal para subida
const [showUploadModal, setShowUploadModal] = useState(false);
const [filesToUpload, setFilesToUpload] = useState([]);
const [tituloFoto, setTituloFoto] = useState("");
const [descripcionFoto, setDescripcionFoto] = useState("");

// NUEVO: previews de las imágenes
const [filePreviews, setFilePreviews] = useState([]);

useEffect(() => {
  if (!filesToUpload.length) {
    setFilePreviews([]);
    return;
  }

  const urls = filesToUpload.map((file) => ({
    name: file.name,
    size: file.size,
    url: URL.createObjectURL(file),
  }));

  setFilePreviews(urls);

  // limpiar URLs al cambiar archivos o desmontar
  return () => {
    urls.forEach((item) => URL.revokeObjectURL(item.url));
  };
}, [filesToUpload]);


  const cargarFotos = useCallback(
    async (id) => {
      if (!id) return;
      try {
        setCargandoFotos(true);
        setErrorFotos("");
        const res = await axiosClient.get(`/mis-bodas/${id}/fotos`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFotos(data);
      } catch (e) {
        console.error(e);
        setErrorFotos("No se pudieron cargar las fotos de la boda.");
      } finally {
        setCargandoFotos(false);
      }
    },
    []
  );

  const handleSelectFiles = (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length || !bodaId) return;

  // Validación tamaño 3MB
  const tooBig = files.find((f) => f.size > MAX_BYTES);
  if (tooBig) {
    setErrorFotos(
      `La imagen "${tooBig.name}" supera el tamaño máximo permitido de ${MAX_MB} MB.`
    );
    e.target.value = "";
    return;
  }

  setFilesToUpload(files);
  setTituloFoto("");
  setDescripcionFoto("");
  setShowUploadModal(true);
  e.target.value = "";
};



  // -------- FAQs (tabla faqs_boda) ----------
  const [faqs, setFaqs] = useState([{ pregunta: "", respuesta: "" }]);
  const [cargandoFaqs, setCargandoFaqs] = useState(false);
  const [guardandoFaqs, setGuardandoFaqs] = useState(false);
  const [errorFaqs, setErrorFaqs] = useState("");

  const cargarFaqs = useCallback(
    async (id) => {
      if (!id) return;
      try {
        setCargandoFaqs(true);
        setErrorFaqs("");
        const res = await axiosClient.get(`/mis-bodas/${id}/faqs`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

        if (!data.length) {
          setFaqs([{ pregunta: "", respuesta: "" }]);
        } else {
          setFaqs(
            data.map((f) => ({
              pregunta: f.pregunta || "",
              respuesta: f.respuesta || "",
            }))
          );
        }
      } catch (e) {
        console.error(e);
        setErrorFaqs("No se pudieron cargar las preguntas frecuentes.");
        setFaqs([{ pregunta: "", respuesta: "" }]);
      } finally {
        setCargandoFaqs(false);
      }
    },
    []
  );

  // Cargar fotos + faqs cuando tengamos bodaId
  useEffect(() => {
    if (bodaId) {
      cargarFotos(bodaId);
      cargarFaqs(bodaId);
    }
  }, [bodaId, cargarFotos, cargarFaqs]);

  const actualizarOrdenServidor = useCallback(
    async (listaOrdenada) => {
      if (!bodaId) return;
      try {
        setErrorFotos("");
        const payload = {
          fotos: listaOrdenada.map((f, idx) => ({
            id: f.id,
            orden: idx + 1,
          })),
        };
        await axiosClient.put(`/mis-bodas/${bodaId}/fotos/orden`, payload);
      } catch (e) {
        console.error(e);
        setErrorFotos("No se pudo guardar el nuevo orden de las fotos.");
        // opcional: recargar orden original
        await cargarFotos(bodaId);
      }
    },
    [bodaId, cargarFotos]
  );

  const handleSubirFotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !bodaId) return;

    // Validación tamaño 3MB
    const tooBig = files.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      setErrorFotos(
        `La imagen "${tooBig.name}" supera el tamaño máximo permitido de ${MAX_MB} MB.`
      );
      e.target.value = "";
      return;
    }

    try {
      setSubiendoFoto(true);
      setErrorFotos("");

      for (const file of files) {
        const formData = new FormData();
        formData.append("imagen", file);
        await axiosClient.post(`/mis-bodas/${bodaId}/fotos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await cargarFotos(bodaId);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 422) {
        setErrorFotos(
          "La imagen no es válida o excede el tamaño permitido (máx. 3 MB)."
        );
      } else {
        setErrorFotos(
          "Ocurrió un problema al subir las fotos. Inténtalo nuevamente."
        );
      }
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const handleMarcarPortada = async (fotoId) => {
    try {
      await axiosClient.put(`/fotos-boda/${fotoId}`, { es_portada: true });
      await cargarFotos(bodaId);
    } catch (e) {
      console.error(e);
      setErrorFotos("No se pudo marcar la foto como portada.");
    }
  };

  const handleEliminarFoto = async (fotoId) => {
    if (!window.confirm("¿Eliminar esta foto de la galería?")) return;
    try {
      await axiosClient.delete(`/fotos-boda/${fotoId}`);
      await cargarFotos(bodaId);
    } catch (e) {
      console.error(e);
      setErrorFotos("No se pudo eliminar la foto.");
    }
  };

  const handleDropFoto = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setFotos((prev) => {
      const copia = [...prev];
      const [moved] = copia.splice(fromIndex, 1);
      copia.splice(toIndex, 0, moved);
      // enviar nuevo orden al backend (fire & forget)
      actualizarOrdenServidor(copia);
      return copia;
    });
  };

  // -------- FORMULARIO CONFIG --------
  const [form, setForm] = useState({
    frasePrincipal: "",
    textoFechaReligioso: "",
    textoFechaCivil: "",
    localReligioso: "",
    localRecepcion: "",
    // Cronograma estructurado
    cronogramaMatrimonio: "",
    cronogramaRecepcion: "",
    cronogramaBodaCivil: "",
    cronogramaCena: "",
    cronogramaCelebracion: "",
    cronogramaTextoLibre: "",
    // Regalos / cuentas
    textoCuentasBancarias: "",
    textoYape: "",
    // Historia / mensaje final
    textoHistoriaPareja: "",
    textoMensajeFinal: "",
    // Preguntas frecuentes (intro)
    textoPreguntasFrecuentes: "",
  });

  // efecto para config (solo config, ya no faqs)
  useEffect(() => {
    if (config) {
      setForm((prev) => ({
        ...prev,
        frasePrincipal: config.frasePrincipal || "",
        textoFechaReligioso: config.textoFechaReligioso || "",
        textoFechaCivil: config.textoFechaCivil || "",
        localReligioso: config.localReligioso || "",
        localRecepcion: config.localRecepcion || "",
        cronogramaMatrimonio: "",
        cronogramaRecepcion: "",
        cronogramaBodaCivil: "",
        cronogramaCena: "",
        cronogramaCelebracion: "",
        cronogramaTextoLibre: config.cronogramaTexto || "",
        textoCuentasBancarias: config.textoCuentasBancarias || "",
        textoYape: config.textoYape || "",
        textoHistoriaPareja: config.textoHistoriaPareja || "",
        textoMensajeFinal: config.textoMensajeFinal || "",
        textoPreguntasFrecuentes: config.textoPreguntasFrecuentes || "",
      }));
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers FAQs
  const handleFaqChange = (index, field, value) => {
    setFaqs((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { pregunta: "", respuesta: "" }]);
  };

  const handleRemoveFaq = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bodaId) return;

    // Componemos el cronograma en un solo string
    const partesCronograma = [
      form.cronogramaMatrimonio &&
        `MATRIMONIO: ${form.cronogramaMatrimonio.trim()}`,
      form.cronogramaRecepcion &&
        `RECEPCIÓN: ${form.cronogramaRecepcion.trim()}`,
      form.cronogramaBodaCivil &&
        `BODA CIVIL: ${form.cronogramaBodaCivil.trim()}`,
      form.cronogramaCena && `CENA: ${form.cronogramaCena.trim()}`,
      form.cronogramaCelebracion &&
        `CELEBRACIÓN: ${form.cronogramaCelebracion.trim()}`,
      form.cronogramaTextoLibre?.trim(),
    ].filter(Boolean);

    const cronogramaTexto = partesCronograma.join("\n");

    // FAQs limpias (sin filas totalmente vacías)
    const faqsLimpias = faqs
      .map((f) => ({
        pregunta: (f.pregunta || "").trim(),
        respuesta: (f.respuesta || "").trim(),
      }))
      .filter((f) => f.pregunta || f.respuesta);

    const payload = {
      ...(config || {}),
      frasePrincipal: form.frasePrincipal,
      textoFechaReligioso: form.textoFechaReligioso,
      textoFechaCivil: form.textoFechaCivil,
      localReligioso: form.localReligioso,
      localRecepcion: form.localRecepcion,
      cronogramaTexto,
      textoCuentasBancarias: form.textoCuentasBancarias,
      textoYape: form.textoYape,
      textoHistoriaPareja: form.textoHistoriaPareja,
      textoMensajeFinal: form.textoMensajeFinal,
      textoPreguntasFrecuentes: form.textoPreguntasFrecuentes,
    };

    try {
      setGuardandoFaqs(true);
      setErrorFaqs("");

      await Promise.all([
        guardar(payload), // config de la boda
        axiosClient.put(`/mis-bodas/${bodaId}/faqs`, { faqs: faqsLimpias }), // tabla faqs_boda
      ]);

      await cargarFaqs(bodaId);
    } catch (e) {
      console.error(e);
      setErrorFaqs("No se pudieron guardar las preguntas frecuentes.");
    } finally {
      setGuardandoFaqs(false);
    }
  };

  const handleIrDashboard = () => {
    if (!bodaId) return;
    navigate(`/panel?boda=${bodaId}`);
  };

  const handleIrInvitados = () => {
    if (!bodaId) return;
    navigate(`/panel/invitados?boda=${bodaId}`);
  };

  const handleVerPublica = () => {
    if (!boda?.subdominio) return;
    window.open(`/boda/${boda.subdominio}`, "_blank");
  };

  // -------- ESTADOS GENERALES --------
  if (cargandoBoda && !boda) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Cargando datos de la boda...</p>
      </div>
    );
  }

  if (errorBoda) {
    return (
      <div className="p-6">
        <div className="max-w-lg bg-white border border-rose-200 rounded-2xl px-4 py-3">
          <h1 className="text-base font-semibold text-rose-700 mb-1">
            No se pudo cargar la información de la boda
          </h1>
          <p className="text-sm text-slate-700">{errorBoda}</p>
        </div>
      </div>
    );
  }

const handleConfirmUpload = async () => {
  if (!filesToUpload.length || !bodaId) {
    setShowUploadModal(false);
    return;
  }

  try {
    setSubiendoFoto(true);
    setErrorFotos("");

    for (const file of filesToUpload) {
      if (file.size > MAX_BYTES) {
        setErrorFotos(
          `La imagen "${file.name}" supera el tamaño máximo permitido de ${MAX_MB} MB.`
        );
        continue;
      }

      const formData = new FormData();
      formData.append("imagen", file);
      if (tituloFoto.trim()) {
        formData.append("titulo", tituloFoto.trim());
      }
      if (descripcionFoto.trim()) {
        formData.append("descripcion", descripcionFoto.trim());
      }

      await axiosClient.post(`/mis-bodas/${bodaId}/fotos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    await cargarFotos(bodaId);
    setShowUploadModal(false);
    setFilesToUpload([]);
    setTituloFoto("");
    setDescripcionFoto("");
  } catch (e) {
    console.error(e);
    if (e.response?.status === 422) {
      setErrorFotos(
        "La imagen no es válida o excede el tamaño permitido (máx. 3 MB)."
      );
    } else {
      setErrorFotos(
        "Ocurrió un problema al subir las fotos. Inténtalo nuevamente."
      );
    }
  } finally {
    setSubiendoFoto(false);
  }
};

const handleCancelUpload = () => {
  setShowUploadModal(false);
  setFilesToUpload([]);
  setTituloFoto("");
  setDescripcionFoto("");
};



  return (
    <div className="space-y-6">
      {/* Barra superior: navegación rápida entre secciones de la boda */}
      <div className="bg-white border border-slate-200 rounded-3xl px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleIrDashboard}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            title="Volver al dashboard"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Configuración de la boda
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                {boda?.nombre_pareja || "Mi boda"}
              </h1>
              {boda?.fecha_boda && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600">
                  <IconCalendar className="w-3.5 h-3.5" />
                  {boda.fecha_boda}
                </span>
              )}
              {boda?.subdominio && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-2.5 py-1 text-[11px] font-medium">
                  <IconSparkles className="w-3.5 h-3.5" />
                  {boda.subdominio}
                </span>
              )}
            </div>
            {boda?.ciudad && (
              <p className="mt-1 text-xs text-slate-500">{boda.ciudad}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleIrDashboard}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Configuración
          </button>
          <button
            type="button"
            onClick={handleIrInvitados}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Invitados y links RSVP
          </button>
          <button
            type="button"
            onClick={handleVerPublica}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Ver página pública
          </button>
        </div>
      </div>

      {/* Mensajes de estado config */}
      {cargando && !config && (
        <p className="text-sm text-slate-500">
          Cargando configuración de la boda...
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {mensajeOk && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
          {mensajeOk}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 text-sm"
        autoComplete="off"
      >
        {/* GRID PROFESIONAL DE CARDS */}
        <div className="grid lg:grid-cols-12 gap-5">
          {/* CARD: Portada y fechas */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <IconSparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Portada y mensaje principal
                </h2>
                <p className="text-xs text-slate-500">
                  Texto que verán primero tus invitados en la web pública.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Frase principal en la portada
                </label>
                <input
                  type="text"
                  name="frasePrincipal"
                  value={form.frasePrincipal}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Ej: Un día para celebrar el amor"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Texto fecha ceremonia religiosa
                  </label>
                  <input
                    type="text"
                    name="textoFechaReligioso"
                    value={form.textoFechaReligioso}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej: 26/11/2026 – 4:00 p. m. Parroquia ..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Texto fecha ceremonia civil
                  </label>
                  <input
                    type="text"
                    name="textoFechaCivil"
                    value={form.textoFechaCivil}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej: 27/11/2026 – 11:00 a. m. Municipalidad ..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* CARD: Regalos */}
          <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <IconGift className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Regalos y cuentas bancarias
                </h2>
                <p className="text-xs text-slate-500">
                  Información para transferencias, Yape / Plin u otros detalles
                  de regalo.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Cuentas bancarias / CCI
              </label>
              <textarea
                name="textoCuentasBancarias"
                rows={3}
                value={form.textoCuentasBancarias}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder={`Ej:\nBCP: 123-4567890-1\nCCI: 002-123456789012345678`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Texto para Yape / Plin
              </label>
              <textarea
                name="textoYape"
                rows={2}
                value={form.textoYape}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Ej: Yape al número 999 999 999 a nombre de ..."
              />
            </div>
          </section>

          {/* CARD: Lugares y cronograma */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <IconCalendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Lugares y cronograma del día
                </h2>
                <p className="text-xs text-slate-500">
                  Organiza los momentos clave: MATRIMONIO, RECEPCIÓN, BODA
                  CIVIL, CENA y CELEBRACIÓN.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Local religioso
                </label>
                <input
                  type="text"
                  name="localReligioso"
                  value={form.localReligioso}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Local de recepción
                </label>
                <input
                  type="text"
                  name="localRecepcion"
                  value={form.localRecepcion}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Matrimonio
                </label>
                <input
                  type="text"
                  name="cronogramaMatrimonio"
                  value={form.cronogramaMatrimonio}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Ej: 4:00 p. m. Ceremonia religiosa"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Recepción
                </label>
                <input
                  type="text"
                  name="cronogramaRecepcion"
                  value={form.cronogramaRecepcion}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Ej: 6:00 p. m. Recepción de invitados"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Boda civil
                </label>
                <input
                  type="text"
                  name="cronogramaBodaCivil"
                  value={form.cronogramaBodaCivil}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Cena
                </label>
                <input
                  type="text"
                  name="cronogramaCena"
                  value={form.cronogramaCena}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  Celebración / fiesta
                </label>
                <input
                  type="text"
                  name="cronogramaCelebracion"
                  value={form.cronogramaCelebracion}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Texto libre de cronograma (opcional)
              </label>
              <textarea
                name="cronogramaTextoLibre"
                rows={3}
                value={form.cronogramaTextoLibre}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder={`Ej:\n• Recepción de invitados\n• Ceremonia\n• Brindis\n• Baile de los novios`}
              />
            </div>
          </section>

          {/* CARD: Historia */}
          <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <IconStory className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Historia y mensaje para tus invitados
                </h2>
                <p className="text-xs text-slate-500">
                  Da contexto a tu historia y deja un mensaje final que se verá
                  en la parte inferior de la web.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Historia de la pareja
              </label>
              <textarea
                name="textoHistoriaPareja"
                rows={4}
                value={form.textoHistoriaPareja}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Cuenta brevemente cómo se conocieron, momentos especiales, etc."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Mensaje final para los invitados
              </label>
              <textarea
                name="textoMensajeFinal"
                rows={2}
                value={form.textoMensajeFinal}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Ej: Gracias por acompañarnos en este día tan especial."
              />
            </div>
          </section>

          {/* CARD: Fotos */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <IconCamera className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Fotos de la boda
                </h2>
                <p className="text-xs text-slate-500">
                  Sube fotos para la portada y la galería. Puedes marcarlas
                  como portada, eliminarlas y reordenarlas arrastrando con el
                  mouse.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <input
  type="file"
  accept="image/*"
  multiple
  className="hidden"
  onChange={handleSelectFiles}
/>
                <span>Subir fotos</span>
                {subiendoFoto && (
                  <span className="text-[11px] text-slate-500">
                    Subiendo...
                  </span>
                )}
              </label>
              {cargandoFotos && (
                <p className="text-xs text-slate-500">
                  Cargando fotos existentes...
                </p>
              )}
            </div>

            {errorFotos && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {errorFotos}
              </p>
            )}

            {fotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fotos.map((foto, index) => {
                  const url =
                    foto.url_publica ||
                    foto.url ||
                    foto.ruta ||
                    foto.url_imagen ||
                    "";
                  if (!url) return null;

                  const esPortada = !!foto.es_portada;

                  return (
                    <div
                      key={foto.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", String(index))
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const fromIndex = parseInt(
                          e.dataTransfer.getData("text/plain"),
                          10
                        );
                        handleDropFoto(fromIndex, index);
                      }}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-move"
                    >
                      <img
                        src={url}
                        alt={foto.titulo || "Foto de la boda"}
                        className="w-full h-32 sm:h-36 md:h-40 object-cover group-hover:scale-[1.03] transition-transform"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 flex items-end justify-between gap-2">
                        <p className="text-[11px] text-white line-clamp-2">
                          {foto.titulo || "Foto de la boda"}
                        </p>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-between">
                          {esPortada && (
                            <span className="inline-flex rounded-full bg-emerald-500/90 text-white text-[10px] px-2 py-0.5">
                              Portada
                            </span>
                          )}
                          <span className="inline-flex rounded-full bg-black/50 text-white text-[10px] px-2 py-0.5">
                            Arrastra para ordenar
                          </span>
                        </div>
                        <div className="flex justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleMarcarPortada(foto.id)}
                            className="flex-1 inline-flex items-center justify-center rounded-full bg-white/95 text-[11px] font-medium text-slate-900 px-2 py-1 hover:bg-white"
                          >
                            Portada
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarFoto(foto.id)}
                            className="inline-flex items-center justify-center rounded-full bg-rose-600/95 text-[11px] font-medium text-white px-2 py-1 hover:bg-rose-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              
            ) : (
              <p className="text-xs text-slate-500">
                Aún no hay fotos cargadas para esta boda.
              </p>
            )}
          </section>
{showUploadModal && (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-7 shadow-2xl">
      <div className="flex justify-between items-start gap-3 mb-4">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-slate-900">
            Detalles de las fotos
          </h3>
          <p className="text-xs md:text-[13px] text-slate-600 mt-1">
            Las imágenes se{" "}
            <span className="font-semibold">redimensionarán automáticamente</span>{" "}
            a un máximo de{" "}
            <span className="font-semibold">1600 × 1600 píxeles</span>,
            se <span className="font-semibold">convertirán a JPG optimizado</span>{" "}
            y no deben superar los{" "}
            <span className="font-semibold">{MAX_MB} MB</span> por archivo.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* COLUMNA IZQUIERDA: archivos + preview */}
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-medium text-slate-600 mb-1">
              Archivos seleccionados
            </p>
            <ul className="max-h-24 overflow-auto text-[11px] text-slate-700 list-disc list-inside bg-slate-50 rounded-xl px-3 py-2">
              {filesToUpload.map((f) => (
                <li key={f.name}>
                  {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>

         <div>
  <p className="text-[11px] font-medium text-slate-600 mb-2">
    Vista previa
  </p>

  {filePreviews.length > 0 ? (
    filePreviews.length === 1 ? (
      // UN SOLO ARCHIVO → PREVIEW GRANDE
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
        <img
          src={filePreviews[0].url}
          alt={filePreviews[0].name}
          className="w-full h-52 md:h-64 object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-1.5">
          <p className="text-[11px] text-white truncate">
            {filePreviews[0].name}
          </p>
        </div>
      </div>
    ) : (
      // VARIOS ARCHIVOS → GRID CON PREVIEW MÁS ALTA
      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-auto">
        {filePreviews.map((item) => (
          <div
            key={item.url}
            className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
          >
            <img
              src={item.url}
              alt={item.name}
              className="w-full h-32 md:h-40 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1">
              <p className="text-[10px] text-white truncate">
                {item.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  ) : (
    <p className="text-[11px] text-slate-500">
      Selecciona una imagen para ver la vista previa.
    </p>
  )}
</div>

        </div>

        {/* COLUMNA DERECHA: título y descripción */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">
              Título para las fotos (opcional)
            </label>
            <input
              type="text"
              value={tituloFoto}
              onChange={(e) => setTituloFoto(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ej: Sesión pre boda, recepción, etc."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">
              Descripción (opcional)
            </label>
            <textarea
              rows={4}
              value={descripcionFoto}
              onChange={(e) => setDescripcionFoto(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ej: Fotos de la ceremonia religiosa."
            />
          </div>
{errorFotos && (
  <p className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
    {errorFotos}
  </p>
)}

          <div className="pt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelUpload}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmUpload}
              disabled={subiendoFoto}
              className="px-4 py-1.5 text-xs rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {subiendoFoto ? "Subiendo..." : "Subir fotos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


          {/* CARD: Preguntas frecuentes */}
          <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <IconFAQ className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Preguntas frecuentes para tus invitados
                </h2>
                <p className="text-xs text-slate-500">
                  Aclara dudas típicas: código de vestimenta, si pueden llevar
                  niños, horarios clave, etc.
                </p>
              </div>
            </div>

            {cargandoFaqs && (
              <p className="text-[11px] text-slate-500">
                Cargando preguntas frecuentes...
              </p>
            )}

            {errorFaqs && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {errorFaqs}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Texto introductorio (opcional)
              </label>
              <textarea
                name="textoPreguntasFrecuentes"
                rows={2}
                value={form.textoPreguntasFrecuentes}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Ej: Aquí respondemos algunas preguntas frecuentes sobre nuestro gran día."
              />
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      Pregunta {index + 1}
                    </span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="text-[11px] text-rose-600 hover:text-rose-700"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Pregunta
                    </label>
                    <input
                      type="text"
                      value={faq.pregunta}
                      onChange={(e) =>
                        handleFaqChange(index, "pregunta", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="Ej: ¿Hay código de vestimenta?"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Respuesta
                    </label>
                    <textarea
                      rows={2}
                      value={faq.respuesta}
                      onChange={(e) =>
                        handleFaqChange(index, "respuesta", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="Ej: Semi-formal. Recomendamos colores claros y cómodos."
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                + Agregar pregunta
              </button>
            </div>
          </section>
        </div>

        {/* Botón guardar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando || guardandoFaqs}
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {guardando || guardandoFaqs
              ? "Guardando cambios..."
              : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
