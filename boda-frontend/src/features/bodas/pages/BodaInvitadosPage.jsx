// src/features/bodas/pages/BodaInvitadosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMiBodaActual } from "../hooks/useBodas";
import { invitadosApi } from "../services/invitadosApiService";
import * as XLSX from "xlsx";
import CardDesignerModal from "../components/CardDesignerModal";
import EditInvitadoModal from "../components/EditInvitadoModal";

import axiosClient from "../../../shared/config/axiosClient";
import { generarPdfInvitados } from "../services/generarPdfInvitados";
import GenerationProgressModal from "../components/GenerationProgressModal";
import { ConfirmationDialog } from "../../public/components/ConfirmationDialog";

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

  // Estado para edición
  const [editOpen, setEditOpen] = useState(false);
  const [editInvitado, setEditInvitado] = useState(null);

  const [designerOpen, setDesignerOpen] = useState(false);
  const [cardStatus, setCardStatus] = useState(null);
  const [genOpen, setGenOpen] = useState(false);
  const [genProgress, setGenProgress] = useState({
    estado: "en_cola",
    generadas: 0,
    total: 0,
    mensaje: "",
  });

  // búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [descargandoZip, setDescargandoZip] = useState(false);
  // Modales de confirmación de acciones
  const [modalAccion, setModalAccion] = useState({ open: false, tipo: null, invitado: null });
  const [procesandoAccion, setProcesandoAccion] = useState(false);
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
    const totalConfirmados = invitados.filter((i) => i.es_confirmado === 1).length;
    const totalPasesConfirmados = invitados
      .filter((i) => i.es_confirmado === 1)
      .reduce((acc, i) => acc + (i.pases ?? 1), 0);
    const totalNoAsiste = invitados.filter((i) => i.es_confirmado === -1).length;
    const totalPasesNoAsiste = invitados
      .filter((i) => i.es_confirmado === -1)
      .reduce((acc, i) => acc + (i.pases ?? 1), 0);
    const totalPendientes = totalInvitados - totalConfirmados - totalNoAsiste;
    const totalPasesPendientes = invitados
      .filter((i) => i.es_confirmado === 0 || i.es_confirmado === null)
      .reduce((acc, i) => acc + (i.pases ?? 1), 0);

    return {
      totalInvitados,
      totalPases,
      totalConfirmados: totalConfirmados,
      totalPasesConfirmados: totalPasesConfirmados,
      totalPendientes,
      totalPasesPendientes,
      totalNoAsiste,
      totalPasesNoAsiste,
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

  const handleNoAsistir = async (id) => {
    try {
      const resp = await invitadosApi.noAsistir(id);
      const invitadoActualizado = resp.invitado ?? resp;

      setInvitados((prev) =>
        prev.map((i) => (i.id === id ? invitadoActualizado : i))
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar como no asistirá.");
    }
  };

  const handleRevertirPendiente = async (invitado) => {
    try {
      const payload = {
        nombre_invitado: invitado.nombre_invitado,
        pases: invitado.pases ?? 1,
        correo: invitado.correo ?? null,
        celular: invitado.celular ?? null,
        nombre_acompanante: invitado.nombre_acompanante ?? null,
        notas: invitado.notas ?? null,
        es_confirmado: 0,
      };
      const resp = await invitadosApi.actualizar(invitado.id, payload);
      const invitadoActualizado = resp.invitado ?? resp;

      setInvitados((prev) =>
        prev.map((i) => (i.id === invitado.id ? invitadoActualizado : i))
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo volver a pendiente.");
    }
  };

  // Abrir/cerrar modal y ejecutar acción seleccionada
  const abrirModalAccion = (tipo, invitado) => setModalAccion({ open: true, tipo, invitado });
  const cerrarModalAccion = () => setModalAccion({ open: false, tipo: null, invitado: null });
  const confirmarAccionModal = async () => {
    const { tipo, invitado } = modalAccion;
    if (!tipo || !invitado) return;
    setProcesandoAccion(true);
    try {
      if (tipo === "no_asistira") {
        await handleNoAsistir(invitado.id);
      } else if (tipo === "eliminar") {
        await handleEliminar(invitado.id);
      } else if (tipo === "revertir") {
        await handleRevertirPendiente(invitado);
      }
      cerrarModalAccion();
    } finally {
      setProcesandoAccion(false);
    }
  };

  // --------- EDITAR INVITADO ----------
  const handleEditar = (invitado) => {
    setEditInvitado(invitado);
    setEditOpen(true);
  };

const handleSaveEdit = async (formData) => {
  if (!editInvitado) return;

  try {
    const actualizado = await invitadosApi.actualizar(editInvitado.id, formData);
    const invitadoActualizado = actualizado.invitado ?? actualizado;

    setInvitados((prev) =>
      prev.map((i) => (i.id === editInvitado.id ? invitadoActualizado : i))
    );

    setEditOpen(false);
    setEditInvitado(null);

    return invitadoActualizado;
  } catch (error) {
    console.error(error);
    // Deja tu alert si quieres, pero OJO: si lo dejas, verás alert + mensaje en modal
    // alert("No se pudo editar el invitado. Revisa los datos.");
    throw error; // ✅ clave para que el modal muestre el error
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

      const status = err?.response?.status;

      // ✅ 429 = Too Many Requests (no marcar como error; el useEffect reintenta más lento)
      if (status === 429) {
        throw err;
      }

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
    let timeoutId = null;

    const tick = async () => {
      if (!alive) return;

      try {
        const info = await fetchProgress();
        if (!alive) return;

        const estado = info?.estado;

        if (estado === "finalizado" || estado === "error") {
          // refresca invitados para que cambie Pendiente -> Generada
          const dataInv = await invitadosApi.listarPorBoda(bodaId);
          setInvitados(Array.isArray(dataInv) ? dataInv : dataInv.data ?? []);

          // refresca cardStatus también
          const { data: st } = await axiosClient.get(
            `/mis-bodas/${bodaId}/card-design/status`
          );
          setCardStatus(st.card_design || null);

          return; // ya no reprograma
        }
      } catch (e) {
        const status = e?.response?.status;

        if (status === 429) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(tick, 4000);
          return;
        }

        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Ocurrió un error consultando el progreso.";

        setGenProgress((p) => ({ ...p, estado: "error", mensaje: msg }));
        return;
      }

      // reprograma normal
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(tick, 2500);
    };

    tick();

    return () => {
      alive = false;
      if (timeoutId) clearTimeout(timeoutId);
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
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;

      const ext = invitado.rsvp_card_path?.endsWith(".webp") ? "webp" : "png";
      const nombreArchivo = (invitado.nombre_invitado || "invitado").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      link.setAttribute("download", `${nombreArchivo}.${ext}`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando tarjeta:", err);
      alert("No se pudo descargar la tarjeta.");
    }
  };

  const handleDescargarTodosZip = async () => {
    setDescargandoZip(true);
    try {
      const { data } = await axiosClient.get(
        `/mis-bodas/${bodaId}/tarjetas/descargar-zip`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;

      const nombrePareja = (boda?.nombre_pareja || "tarjetas").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      link.setAttribute("download", `${nombrePareja}_tarjetas.zip`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando ZIP:", err);
      alert("No se pudo descargar el archivo ZIP. Revisa la consola.");
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

    // Formatea fecha a un formato legible (ej: 31 de enero de 2026)
    const fechaLegible = (() => {
      if (!fecha) return "";
      const d = new Date(fecha);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    })();

    let mensaje = [
      `¡Hola ${invitado.nombre_invitado}!`,
      `Te invitamos a acompañarnos en nuestra boda, ${nombrePareja}${
        fechaLegible ? ` el ${fechaLegible}` : ""
      }.`,
      enlaceRsvp
        ? `Por favor confirma tu asistencia aquí: ${enlaceRsvp}`
        : "Te agradecemos que nos confirmes tu asistencia cuantos antes.",
    ].join("\n\n");

    const url = `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  // --------- RECORDATORIO WHATSAPP ----------
  const handleEnviarRecordatorio = (invitado) => {
    const celular = invitado.celular ?? invitado.telefono;
    if (!celular)
      return alert("Este invitado no tiene número de teléfono registrado.");

    let telefonoLimpio = String(celular).replace(/\D/g, "");

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

    // Calcular días faltantes
    const diasFaltantes = (() => {
      if (!fecha) return null;
      const fechaBoda = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaBoda.setHours(0, 0, 0, 0);
      const diff = Math.ceil((fechaBoda - hoy) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : null;
    })();

    const fechaLegible = (() => {
      if (!fecha) return "";
      const d = new Date(fecha);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    })();

    const partesFecha = diasFaltantes
      ? `Faltan ${diasFaltantes} día${diasFaltantes !== 1 ? "s" : ""} para ${nombrePareja}${fechaLegible ? ` (${fechaLegible})` : ""}.`
      : `Te esperamos en ${nombrePareja}${fechaLegible ? ` el ${fechaLegible}` : ""}.`;

    let mensaje = [
      `¡Hola ${invitado.nombre_invitado}!`,
      partesFecha,
      "Nos encantaría contar con tu presencia en este día tan especial.",
      enlaceRsvp
        ? `Por favor confirma tu asistencia aquí: ${enlaceRsvp}`
        : "Por favor confirma tu asistencia cuanto antes.",
      "Si por algún motivo no puedes asistir, también puedes indicarlo en el mismo enlace. ¡Muchas gracias!",
    ].join("\n\n");

    const url = `https://wa.me/51${telefonoLimpio}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  // --------- DESCARGAR PDF ----------
  const handleDescargarPdf = async () => {
    try {
      await generarPdfInvitados(boda, invitados);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("No se pudo descargar el PDF. Intenta nuevamente.");
    }
  };

  // --------- FILTRO BUSCADOR ----------
    const aplicarFiltro = () => {
      if (filtroEstado === "confirmados")
        return invitados.filter((i) => i.es_confirmado === 1);
      if (filtroEstado === "pendientes")
        return invitados.filter(
          (i) =>
            i.es_confirmado === 0 ||
            i.es_confirmado === null ||
            i.es_confirmado === undefined
        );
      if (filtroEstado === "no_asisten")
        return invitados.filter((i) => i.es_confirmado === -1);
      return invitados;
    };

    const invitadosFiltrados = useMemo(() => {
      const base = aplicarFiltro();
      if (!busqueda.trim()) return base;
      const term = busqueda.toLowerCase();
      return base.filter((i) => {
        const nombre = (i.nombre_invitado || "").toLowerCase();
        const codigo = (i.codigo_clave || "").toLowerCase();
        const tel = (i.celular || i.telefono || "").toString().toLowerCase();
        return (
          nombre.includes(term) || codigo.includes(term) || tel.includes(term)
        );
      });
    }, [busqueda, filtroEstado, invitados]);

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
              disabled={genOpen}
              className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 ${
                genOpen
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (genOpen) return;
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setArchivoSeleccionado(file);
                  handleImportarExcel(file);
                }}
              />
              <IconUpload className="w-4 h-4" />
              <span>Seleccionar archivo</span>
            </label>

            <button
              type="button"
              onClick={handleDescargarPlantilla}
              disabled={genOpen}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={genOpen}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Diseño de tarjeta
                </button>
                {invitados.some((i) => i.rsvp_card_path) && (
                  <div className="mt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleDescargarTodosZip}
                      disabled={descargandoZip || genOpen}
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
        {/* Resumen, buscador y filtros unificados */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-slate-900">
                Lista de invitados
              </h2>
              <p className="text-xs text-slate-500">
                Total: {stats.totalInvitados} invitado(s) · Pases: {stats.totalPases}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-72">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-full border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Buscar por nombre, código o teléfono..."
                />
                <FiSearch className="absolute left-2.5 top-1.5 w-4 h-4 text-slate-400" />
              </div>

              <button
                onClick={handleDescargarPdf}
                disabled={!invitados.length}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 text-white px-4 py-2 text-xs font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiDownload className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltroEstado("todos")}
              aria-pressed={filtroEstado === "todos"}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-[11px] font-medium transition ${
                filtroEstado === "todos"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <FiUser className="w-4 h-4" />
              <span>
                Invitados: <span className="font-semibold">{stats.totalInvitados}</span>
              </span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700">
              <FiUsers className="w-4 h-4" />
              <span>
                Pases: <span className="font-semibold">{stats.totalPases}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFiltroEstado("confirmados")}
              aria-pressed={filtroEstado === "confirmados"}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-[11px] font-medium transition ${
                filtroEstado === "confirmados"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>
                Confirmados: <span className="font-semibold">{stats.totalConfirmados}</span>
              </span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-700">
              <FiUsers className="w-4 h-4" />
              <span>
                Pases confirmados: <span className="font-semibold">{stats.totalPasesConfirmados}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFiltroEstado("pendientes")}
              aria-pressed={filtroEstado === "pendientes"}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-[11px] font-medium transition ${
                filtroEstado === "pendientes"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              <FiClock className="w-4 h-4" />
              <span>
                Pendientes: <span className="font-semibold">{stats.totalPendientes}</span>
              </span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">
              <FiUsers className="w-4 h-4" />
              <span>
                Pases pendientes: <span className="font-semibold">{stats.totalPasesPendientes}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFiltroEstado("no_asisten")}
              aria-pressed={filtroEstado === "no_asisten"}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-[11px] font-medium transition ${
                filtroEstado === "no_asisten"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              <FiXCircle className="w-4 h-4" />
              <span>
                No asisten: <span className="font-semibold">{stats.totalNoAsiste}</span>
              </span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] text-rose-700">
              <FiUsers className="w-4 h-4" />
              <span>
                Pases no asisten: <span className="font-semibold">{stats.totalPasesNoAsiste}</span>
              </span>
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
                    colSpan={8}
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
                      {i.es_confirmado === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                          <FiCheckCircle className="w-3 h-3" />
                          Confirmado
                        </span>
                      ) : i.es_confirmado === -1 ? (
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
                        if (!generado)
                          return (
                            <span className="text-xs text-slate-400">--</span>
                          );
                        return (
                          <button
                            type="button"
                            onClick={() => handleDescargarTarjeta(i)}
                            disabled={genOpen}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={genOpen}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiMessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </button>
                      )}
                      {celular && !i.es_confirmado && (
                        <button
                          type="button"
                          onClick={() => handleEnviarRecordatorio(i)}
                          disabled={genOpen}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiMessageCircle className="w-3.5 h-3.5" />
                          Recordatorio
                        </button>
                      )}
                      {!i.es_confirmado && (
                        <button
                          type="button"
                          onClick={() => handleConfirmar(i.id)}
                          disabled={genOpen}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          Confirmar
                        </button>
                      )}
                      {i.es_confirmado !== -1 ? (
                        <button
                          type="button"
                          onClick={() => abrirModalAccion("no_asistira", i)}
                          disabled={genOpen}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiXCircle className="w-3.5 h-3.5" />
                          No asistirá
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirModalAccion("revertir", i)}
                          disabled={genOpen}
                          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Volver a pendiente
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditar(i)}
                        disabled={genOpen}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirModalAccion("eliminar", i)}
                        disabled={genOpen}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal confirmación para acciones de invitado */}
      <ConfirmationDialog
        isOpen={modalAccion.open}
        title={
          modalAccion.tipo === "eliminar"
            ? "¿Eliminar invitado?"
            : modalAccion.tipo === "revertir"
            ? "¿Volver a 'Pendiente'?"
            : "¿Marcar como 'No asistirá'?"
        }
        message={
          modalAccion.tipo === "eliminar"
            ? "Se eliminará al invitado de forma permanente de esta boda. Esta acción no se puede deshacer."
            : modalAccion.tipo === "revertir"
            ? "El invitado volverá al estado 'Pendiente' y dejará de figurar como 'No asistirá'."
            : "Esta acción marcará que el invitado no asistirá al evento. Podrás revertirlo más adelante si cambia de opinión."
        }
        confirmText={modalAccion.tipo === "eliminar" ? "Eliminar" : "Confirmar"}
        cancelText="Cancelar"
        isDangerous={modalAccion.tipo === "eliminar"}
        isLoading={procesandoAccion}
        onConfirm={confirmarAccionModal}
        onCancel={cerrarModalAccion}
      />

      {/* Modal de edición de invitado */}
      <EditInvitadoModal
        open={editOpen}
        invitado={editInvitado}
        onClose={() => {
          setEditOpen(false);
          setEditInvitado(null);
        }}
        onSave={handleSaveEdit}
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
