// src/features/bodas/pages/BodaInvitadosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMiBodaActual } from "../hooks/useBodas";
import { invitadosApi } from "../services/invitadosApiService";
import * as XLSX from "xlsx";
import CardDesignerModal from "../components/CardDesignerModal";

import axiosClient from "../../../shared/config/axiosClient";
import GenerationProgressModal from "../components/GenerationProgressModal"; 

// React Icons
import {
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTrash2,
  FiMessageCircle,
  FiSearch,
  FiDownload,
} from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";

/* Iconos de la barra superior (coherentes con BodaConfigPage) */
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

function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11A1.5 1.5 0 0 0 19 18.5V15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconWhatsappSvg(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className}>
      <path
        d="M5 19l1.1-3.9A7 7 0 1 1 12 19a7.1 7.1 0 0 1-3.6-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.6c.2-.3.3-.7.2-1-.1-.3-.6-1-1-1H8c-.3 0-.7.1-1 .5-.3.4-1 1-1 2.4 0 1.4 1.1 2.7 1.3 2.9.2.3 2.1 3.2 5.2 4.3 2.6 1 3.1.8 3.7.8.6 0 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.2-.2-.3-.5-.4s-1.6-.8-1.9-.9c-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 .9-.3 0-.5 0-1-.3-.5-.3-1-1-1.1-1.1-.2-.2-.2-.4 0-.6.1-.2.3-.4.4-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.8-1-2.4-.2-.5-.5-.4-.7-.4-.2 0-.4 0-.6.1-.2.2-.6.5-.8.8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BodaInvitadosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { boda, cargando: cargandoBoda, error: errorBoda } = useMiBodaActual();

  const bodaId = boda?.id ?? searchParams.get("boda") ?? null;

  const [estado, setEstado] = useState("loading"); // loading | ok | error
  const [mensajeError, setMensajeError] = useState("");
  const [invitados, setInvitados] = useState([]);

  // formulario rápido para crear un invitado
  const [form, setForm] = useState({
    nombre_invitado: "",
    celular: "",
    pases: 1,
  });

  const [designerOpen, setDesignerOpen] = useState(false);
  const [cardStatus, setCardStatus] = useState(null);
  const [genOpen, setGenOpen] = useState(false);
  const [genProgress, setGenProgress] = useState({
    estado: "en_cola",
    generadas: 0,
    total: 0,
  });

  // búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [descargandoZip, setDescargandoZip] = useState(false);
  // --------- CARGA INICIAL ----------
  useEffect(() => {
    if (!bodaId) {
      setEstado("error");
      setMensajeError(
        "No se especificó la boda. Ingresa desde el dashboard o añade ?boda=ID en la URL."
      );
      return;
    }

    const fetchInvitados = async () => {
      try {
        setEstado("loading");
        const data = await invitadosApi.listarPorBoda(bodaId);
        setInvitados(Array.isArray(data) ? data : data.data ?? []);
        setEstado("ok");
      } catch (error) {
        console.error(error);
        setEstado("error");
        if (error.response?.status === 403) {
          setMensajeError(
            "No tienes permisos para ver los invitados de esta boda."
          );
        } else {
          setMensajeError("Ocurrió un error al cargar la lista de invitados.");
        }
      }
    };

    fetchInvitados();
    // fetch card design status
    (async () => {
  try {
    if (!bodaId) return;
    const { data } = await axiosClient.get(
      `/mis-bodas/${bodaId}/card-design/status`
    );
    setCardStatus(data?.card_design ?? null);
  } catch (e) {
    // ignore
  }
})();

  }, [bodaId]);

useEffect(() => {
  if (designerOpen) return;

  (async () => {
    try {
      if (!bodaId) return;
      const { data } = await axiosClient.get(
        `/mis-bodas/${bodaId}/card-design/status`
      );
      setCardStatus(data?.card_design ?? null);
    } catch (e) {
      // ignore
    }
  })();
}, [designerOpen, bodaId]);


  // --------- STATS ----------
  const stats = useMemo(() => {
    const totalInvitados = invitados.length;
    const totalPases = invitados.reduce((acc, i) => acc + (i.pases ?? 1), 0);
    const totalConfirmados = invitados.filter((i) => i.es_confirmado).length;
    const totalPendientes = invitados.filter(
      (i) => !i.es_confirmado && !i.fecha_confirmacion
    ).length;
    const totalNoAsiste = invitados.filter(
      (i) => !i.es_confirmado && i.fecha_confirmacion
    ).length;

    return {
      totalInvitados,
      totalPases,
      totalConfirmados,
      totalPendientes,
      totalNoAsiste,
    };
  }, [invitados]);

  // --------- HANDLERS FORM ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pases" ? Number(value) || 0 : value,
    }));
  };

  const handleCrearInvitado = async (e) => {
    e.preventDefault();
    if (!form.nombre_invitado) return;

    try {
      const payload = {
        nombre_invitado: form.nombre_invitado,
        celular: form.celular || null,
        pases: form.pases || 1,
        // codigo_clave: se genera automáticamente en el backend
      };

      const nuevo = await invitadosApi.crear(bodaId, payload);
      const invitado = nuevo.invitado ?? nuevo;

      setInvitados((prev) => [invitado, ...prev]);

      setForm({
        nombre_invitado: "",
        celular: "",
        pases: 1,
      });
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el invitado. Revisa los datos.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este invitado?")) return;

    try {
      await invitadosApi.eliminar(id);
      setInvitados((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el invitado.");
    }
  };

  const handleConfirmar = async (id) => {
    try {
      const resp = await invitadosApi.confirmar(id);
      const invitadoActualizado = resp.invitado ?? resp;

      setInvitados((prev) =>
        prev.map((i) => (i.id === id ? invitadoActualizado : i))
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar como confirmado.");
    }
  };

  // --------- IMPORTAR EXCEL / CSV ----------
  const handleImportarExcel = async (fileFromInput) => {
    // Usar el archivo que llega por parámetro o el que está en el estado
    const file = fileFromInput || archivoSeleccionado;

    if (!file) {
      alert("Primero selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const data = await invitadosApi.importarExcel(bodaId, formData);

      setInvitados(data.invitados);
      alert("Invitados importados correctamente.");

      setArchivoSeleccionado(null);
    } catch (error) {
      console.error(error.response?.data || error);
      alert(
        "No se pudo importar el archivo. Verifica la plantilla (Nombre invitado, Pases, Teléfono)."
      );
    }
  };

  const handleDescargarPlantilla = () => {
    const encabezados = [
      "Nombre invitado",
      "Pases",
      "Teléfono (WhatsApp, solo números)",
    ];
    const ejemplo = ["Juan Pérez", "2", "921234567"];

    const data = [encabezados, ejemplo];

    // Crear hoja a partir de un array de arrays
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Crear libro y agregar la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invitados");

    // Descargar como archivo Excel real
    XLSX.writeFile(wb, "plantilla_invitados.xlsx");
  };

async function fetchProgress() {
  if (!bodaId) return null;

  try {
    const { data } = await axiosClient.get(
      `/mis-bodas/${bodaId}/card-design/progress`
    );

    setGenProgress((p) => ({
      ...p,
      estado: data?.estado ?? "en_cola",
      generadas: data?.generadas ?? 0,
      total: data?.total ?? 0,
      mensaje: data?.mensaje ?? p.mensaje ?? "", // ✅ conserva mensaje si ya había
    }));

    return data;
  } catch (err) {
    console.error("progress error:", err);
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "No se pudo consultar el progreso.";

    setGenProgress((p) => ({
      ...p,
      estado: "error",
      mensaje: msg,
    }));

    throw err;
  }
}
  useEffect(() => {
    if (!genOpen) return;

    let alive = true;
    let timer = null;

    const tick = async () => {
      try {
        const info = await fetchProgress();
        if (!alive) return;

        const estado = info?.estado;
        console.log('✓ Progreso consultado:', { estado, generadas: info?.generadas, total: info?.total });
        
        if (estado === "finalizado" || estado === "error") {
          clearInterval(timer);
          console.log('✓ Generación completada/error, refrescando datos...');

          // refresca invitados para que cambie Pendiente -> Generada
          const dataInv = await invitadosApi.listarPorBoda(bodaId);
          setInvitados(Array.isArray(dataInv) ? dataInv : dataInv.data ?? []);

          // refresca cardStatus también
          const { data: st } = await axiosClient.get(
            `/mis-bodas/${bodaId}/card-design/status`
          );
          setCardStatus(st.card_design || null);
        }
      } catch (e) {
        console.error('✗ Error consultando progreso:', e);
        // si falla, no cierres el modal; solo marca error lógico si quieres
        setGenProgress((p) => ({ ...p, estado: "error" }));
        clearInterval(timer);
      }
    };

    // Primera consulta inmediata
    tick();
    // Consultar cada 500ms para ser más responsivo
    timer = setInterval(tick, 500);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [genOpen, bodaId]);

async function startGeneration({ skipConfirm = false } = {}) {
  if (!skipConfirm) {
    const confirmar = window.confirm(
      "Esto regenerará todas las tarjetas para todos los invitados.\n\nLas tarjetas anteriores se sobrescribirán.\n\n¿Deseas continuar?"
    );
    if (!confirmar) return;
  }

  setGenProgress({
    estado: "en_cola",
    generadas: 0,
    total: invitados.length,
    mensaje: "", // ✅ nuevo
  });
  setGenOpen(true);

  try {
    // opcional: para que la UI no quede “en cola” si tu backend demora en reflejar progreso
    setGenProgress((p) => ({ ...p, estado: "procesando" }));

    await axiosClient.post(`/mis-bodas/${bodaId}/card-design/generate`);
  } catch (err) {
    console.error("generate error:", err);
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Error al iniciar la generación.";

    setGenProgress((p) => ({
      ...p,
      estado: "error",
      mensaje: msg,
    }));
  }
}

  // --------- DESCARGAS ----------
  const handleDescargarTarjeta = async (invitado) => {
    try {
      const { data } = await axiosClient.get(
        `/invitados/${invitado.id}/rsvp-card/download`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      
      const ext = invitado.rsvp_card_path?.endsWith('.webp') ? 'webp' : 'png';
      const nombreArchivo = (invitado.nombre_invitado || 'invitado').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${nombreArchivo}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando tarjeta:', err);
      alert('No se pudo descargar la tarjeta.');
    }
  };

  const handleDescargarTodosZip = async () => {
    setDescargandoZip(true);
    try {
      const { data } = await axiosClient.get(
        `/mis-bodas/${bodaId}/tarjetas/descargar-zip`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      
      const nombrePareja = (boda?.nombre_pareja || 'tarjetas').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${nombrePareja}_tarjetas.zip`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando ZIP:', err);
      alert('No se pudo descargar el archivo ZIP. Revisa la consola.');
    } finally {
      setDescargandoZip(false);
    }
  };

  // --------- WHATSAPP ----------
  const handleEnviarWhatsapp = (invitado) => {
    const celular = invitado.celular ?? invitado.telefono;
    if (!celular)
      return alert("Este invitado no tiene número de teléfono registrado.");

    let telefonoLimpio = String(celular).replace(/\D/g, "");

    // Evita duplicar 51 si ya lo pusieron
    if (telefonoLimpio.startsWith("51")) {
      telefonoLimpio = telefonoLimpio.slice(2);
    }
    if (telefonoLimpio.length < 9)
      return alert("El número de teléfono no es válido.");

    const base = window.location.origin;
    const sub = boda?.subdominio;
    const codigo = invitado.codigo_clave;

    const enlaceRsvp =
      sub && codigo
        ? `${base}/boda/${sub}?rsvp=${encodeURIComponent(codigo)}`
        : "";

    const nombrePareja = boda?.nombre_pareja || "nuestra boda";
    const fecha = boda?.fecha_boda || "";

    let mensaje = [
      `¡Hola ${invitado.nombre_invitado}!`,
      `Te invitamos a acompañarnos en nuestra boda, ${nombrePareja}${
        fecha ? ` el ${fecha}` : ""
      }.`,
      enlaceRsvp
        ? `Por favor confirma tu asistencia aquí: ${enlaceRsvp}`
        : "Te agradecemos que nos confirmes tu asistencia.",
    ].join("\n\n"); 
     
    const url = `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  // --------- FILTRO BUSCADOR ----------
  const invitadosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return invitados;
    const term = busqueda.toLowerCase();
    return invitados.filter((i) => {
      const nombre = (i.nombre_invitado || "").toLowerCase();
      const codigo = (i.codigo_clave || "").toLowerCase();
      const tel = (i.celular || i.telefono || "").toString().toLowerCase();
      return (
        nombre.includes(term) || codigo.includes(term) || tel.includes(term)
      );
    });
  }, [busqueda, invitados]);

  // --------- NAVEGACIÓN ----------
  const handleIrDashboard = () => {
    if (!bodaId) return;
    navigate(`/panel?boda=${bodaId}`);
  };

  const handleIrConfig = () => {
    if (!bodaId) return;
    navigate(`/panel/configuracion?boda=${bodaId}`);
  };

  const handleVerPublica = () => {
    if (!boda?.subdominio) return;
    window.open(`/boda/${boda.subdominio}`, "_blank");
  };

  // --------- ESTADOS GENERALES ----------
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

  if (estado === "loading") {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-700">Cargando invitados...</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="p-6">
        <div className="max-w-lg bg-white border border-rose-200 rounded-2xl px-4 py-3">
          <h1 className="text-base font-semibold text-rose-700 mb-1">
            No se pudo cargar la lista de invitados
          </h1>
          <p className="text-sm text-slate-700">{mensajeError}</p>
        </div>
      </div>
    );
  }

  // --------- UI ----------
  return (
    <div className="space-y-6">
      {/* Barra superior */}
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
              Invitados y RSVP
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
            onClick={handleIrConfig}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Configuración
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
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

      {/* Formulario + Importar */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Formulario rápido */}
        <form
          onSubmit={handleCrearInvitado}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Añadir invitado
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registra invitados individuales. El código de acceso se generará
                automáticamente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre del invitado
              </label>
              <input
                type="text"
                name="nombre_invitado"
                value={form.nombre_invitado}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Número de pases
              </label>
              <input
                type="number"
                min={1}
                name="pases"
                value={form.pases}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono (WhatsApp)
              </label>
              <input
                type="text"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Ej: 921 234 567"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Se usará para enviar el enlace de RSVP por WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Guardar invitado
            </button>
          </div>
        </form>

        {/* Importar Excel / CSV */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <IconUpload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Importar desde Excel
              </h2>
              <p className="text-xs text-slate-500">
                Usa la plantilla para evitar errores. Columnas:
                <span className="font-medium">
                  {" "}
                  Nombre invitado, Pases, Teléfono.
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setArchivoSeleccionado(file);
                  // Importar inmediatamente después de seleccionar
                  handleImportarExcel(file);
                }}
              />

              <IconUpload className="w-4 h-4" />
              <span>Seleccionar archivo</span>
            </label>

            <button
              type="button"
              onClick={handleDescargarPlantilla}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <FiDownload className="w-4 h-4" />
              Descargar plantilla
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            La primera fila de la plantilla ya incluye los encabezados. No los
            cambies; solo completa las filas con los datos de tus invitados.
          </p>

          {/* Nuevo: card de Diseño junto a Importar (muestra botón) */}
          <div className="mt-4 border-t pt-4">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    d="M3 7h18M12 3v14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Diseño de tarjeta
                </h3>
                <p className="text-xs text-slate-500">
                  Sube una plantilla y arrastra campos para crear la tarjeta.
                </p>
                {cardStatus && (
                  <p className="text-xs text-slate-500 mt-1">
                    Estado:{" "}
                    <span className="font-medium">
                      {cardStatus.estado_generacion || "n/a"}
                    </span>{" "}
                    · Última generación:{" "}
                    <span className="font-medium">
                      {cardStatus.ultimo_conteo_generado ?? 0}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setDesignerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Diseño de tarjeta
                </button>
                {invitados.some((i) => i.rsvp_card_path) && (
                  <div className="mt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleDescargarTodosZip}
                      disabled={descargandoZip}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {descargandoZip ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-700"></div>
                          Descargando...
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-3.5 h-3.5" />
                          Descargar todas (ZIP)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <CardDesignerModal
          open={designerOpen}
          onClose={() => setDesignerOpen(false)}
          boda={boda}
          invitados={invitados}
          onStartGenerate={({ skipConfirm } = {}) => {
            setDesignerOpen(false);
            startGeneration({ skipConfirm });
          }}
        />
      </div>

      {/* Resumen + Buscador + Tabla */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        {/* Resumen y buscador */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Lista de invitados
            </h2>
            <p className="text-xs text-slate-500">
              Total: {stats.totalInvitados} invitado(s) · Pases:{" "}
              {stats.totalPases}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 md:items-end">
            {/* Tarjetas de resumen */}
            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                <FiUser className="w-4 h-4 text-slate-700" />
                <span className="text-[11px] text-slate-600">
                  Invitados:{" "}
                  <span className="font-semibold">{stats.totalInvitados}</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                <FiUsers className="w-4 h-4 text-slate-700" />
                <span className="text-[11px] text-slate-600">
                  Pases:{" "}
                  <span className="font-semibold">{stats.totalPases}</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <FiCheckCircle className="w-4 h-4 text-emerald-700" />
                <span className="text-[11px] text-emerald-700">
                  Confirmados:{" "}
                  <span className="font-semibold">
                    {stats.totalConfirmados}
                  </span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-1.5">
                <FiClock className="w-4 h-4 text-amber-700" />
                <span className="text-[11px] text-amber-700">
                  Pendientes:{" "}
                  <span className="font-semibold">{stats.totalPendientes}</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5">
                <FiXCircle className="w-4 h-4 text-rose-700" />
                <span className="text-[11px] text-rose-700">
                  No asisten:{" "}
                  <span className="font-semibold">{stats.totalNoAsiste}</span>
                </span>
              </div>
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-full border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Buscar por nombre, código o teléfono..."
              />
              <FiSearch className="absolute left-2.5 top-1.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-2 pr-4 text-left">N.º</th>
                <th className="py-2 pr-4 text-left">Nombre</th>
                <th className="py-2 pr-4 text-left">Código</th>
                <th className="py-2 pr-4 text-left">Teléfono</th>
                <th className="py-2 pr-4 text-center">Pases</th>
                <th className="py-2 pr-4 text-left">Estado</th>
                <th className="py-2 pr-4 text-center">Tarjeta</th>
                <th className="py-2 pr-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitadosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-xs text-slate-500"
                  >
                    No se encontraron invitados con ese criterio de búsqueda.
                  </td>
                </tr>
              )}

              {invitadosFiltrados.map((i, index) => {
                const celular = i.celular ?? i.telefono;
                return (
                  <tr
                    key={i.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60"
                  >
                    <td className="py-2 pr-4 text-xs text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2 pr-4 text-slate-900">
                      {i.nombre_invitado}
                    </td>
                    <td className="py-2 pr-4 text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono">
                        {i.codigo_clave}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-700 text-xs">
                      {celular ? (
                        <span className="inline-flex items-center gap-1">
                          <FiMessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{celular}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-4 text-center text-slate-800">
                      {i.pases ?? 1}
                    </td>
                    <td className="py-2 pr-4">
                      {i.es_confirmado ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                          <FiCheckCircle className="w-3 h-3" />
                          Confirmado
                        </span>
                      ) : i.fecha_confirmacion ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                          <FiXCircle className="w-3 h-3" />
                          No asiste
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                          <FiClock className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {(() => {
                        const generado = Boolean(
                          i.rsvp_card_path || i.rsvp_card_generated_at
                        );
                        if (!generado) return <span className="text-xs text-slate-400">--</span>;
                        return (
                          <button
                            type="button"
                            onClick={() => handleDescargarTarjeta(i)}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                            title="Descargar tarjeta"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                            Des. Tarj.
                          </button>
                        );
                      })()}
                    </td>
                    <td className="py-2 pr-4 text-right space-x-2">
                      {celular && (
                        <button
                          type="button"
                          onClick={() => handleEnviarWhatsapp(i)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <FiMessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </button>
                      )}
                      {!i.es_confirmado && (
                        <button
                          type="button"
                          onClick={() => handleConfirmar(i.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          Confirmar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEliminar(i.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <GenerationProgressModal
  open={genOpen}
  progress={genProgress}
  onClose={() => setGenOpen(false)}
/>


    </div>
  );
}

// Truco simple para reutilizar el trazo de upload como “download”
function FiUploadRotated(props) {
  const { className, ...rest } = props;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {/* Flecha hacia abajo */}
      <path
        d="M12 9v11m0 0L8.5 16.5M12 20l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Barra superior (línea base del icono) */}
      <path
        d="M5 5.5h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

