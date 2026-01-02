// src/features/bodas/pages/BodaInvitadosPatch.jsx
// Este archivo contiene los cambios necesarios para agregar filtros y descargar PDF

// ESTADO A AGREGAR EN EL COMPONENTE (después de la línea de búsqueda):
// const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos" | "confirmados" | "pendientes" | "no_asisten"

// FUNCIÓN A AGREGAR (después de handleSaveEdit):
/*
const aplicarFiltro = () => {
  if (filtroEstado === "todos") return invitados;
  if (filtroEstado === "confirmados") return invitados.filter((i) => i.es_confirmado === 1);
  if (filtroEstado === "pendientes") return invitados.filter((i) => i.es_confirmado === 0 || i.es_confirmado === null);
  if (filtroEstado === "no_asisten") return invitados.filter((i) => i.es_confirmado === -1);
  return invitados;
};

const invitadosFiltrados = useMemo(() => {
  const filtrados = aplicarFiltro();
  if (!busqueda.trim()) return filtrados;
  const q = busqueda.toLowerCase();
  return filtrados.filter((inv) => {
    return (
      (inv.nombre_invitado || "").toLowerCase().includes(q) ||
      (inv.codigo_clave || "").toLowerCase().includes(q) ||
      (inv.celular || "").toLowerCase().includes(q) ||
      (inv.correo || "").toLowerCase().includes(q)
    );
  });
}, [invitados, busqueda, filtroEstado]);

const handleDescargarPdf = async () => {
  try {
    const { generarPdfInvitados } = await import('../services/generarPdfInvitados');
    await generarPdfInvitados(boda, invitados);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    alert("No se pudo descargar el PDF. Intenta nuevamente.");
  }
};
*/

// AGREGAR IMPORT AL INICIO:
// import { FiDownload } from "react-icons/fi";

// REEMPLAZAR SECCIÓN DE TARJETAS DE RESUMEN CON:
/*
<div className="flex flex-wrap gap-2 justify-start md:justify-end">
  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5">
    <FiUser className="w-4 h-4 text-slate-700" />
    <span className="text-[11px] text-slate-600">
      Invitados: <span className="font-semibold">{stats.totalInvitados}</span>
    </span>
  </div>
  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5">
    <FiUsers className="w-4 h-4 text-slate-700" />
    <span className="text-[11px] text-slate-600">
      Pases: <span className="font-semibold">{stats.totalPases}</span>
    </span>
  </div>
  <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-1.5">
    <FiCheckCircle className="w-4 h-4 text-emerald-700" />
    <span className="text-[11px] text-emerald-700">
      Confirmados: <span className="font-semibold">{stats.totalConfirmados}</span>
    </span>
  </div>
  <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-1.5">
    <FiClock className="w-4 h-4 text-amber-700" />
    <span className="text-[11px] text-amber-700">
      Pendientes: <span className="font-semibold">{stats.totalPendientes}</span>
    </span>
  </div>
  <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5">
    <FiXCircle className="w-4 h-4 text-rose-700" />
    <span className="text-[11px] text-rose-700">
      No asisten: <span className="font-semibold">{stats.totalNoAsiste}</span>
    </span>
  </div>
  <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1.5">
    <FiUsers className="w-4 h-4 text-blue-700" />
    <span className="text-[11px] text-blue-700">
      Pases activos: <span className="font-semibold">{stats.totalPases - stats.totalPasesNoAsiste}</span>
    </span>
  </div>
</div>

{/* Botón de descarga PDF */}
<div className="flex items-center gap-2">
  <button
    onClick={handleDescargarPdf}
    disabled={!invitados.length}
    className="inline-flex items-center gap-2 rounded-full bg-amber-600 text-white px-4 py-2 text-xs font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
  >
    <FiDownload className="w-4 h-4" />
    Descargar PDF
  </button>
</div>
*/

// FILTROS A AGREGAR DESPUÉS DEL BUSCADOR:
/*
<div className="flex gap-2 flex-wrap">
  <button
    onClick={() => setFiltroEstado("todos")}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
      filtroEstado === "todos"
        ? "bg-slate-900 text-white"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`}
  >
    Todos
  </button>
  <button
    onClick={() => setFiltroEstado("confirmados")}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
      filtroEstado === "confirmados"
        ? "bg-emerald-600 text-white"
        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    }`}
  >
    Confirmados
  </button>
  <button
    onClick={() => setFiltroEstado("pendientes")}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
      filtroEstado === "pendientes"
        ? "bg-amber-600 text-white"
        : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
    }`}
  >
    Pendientes
  </button>
  <button
    onClick={() => setFiltroEstado("no_asisten")}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
      filtroEstado === "no_asisten"
        ? "bg-rose-600 text-white"
        : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
    }`}
  >
    No asisten
  </button>
</div>
*/

export const CHANGES = "Ver instrucciones arriba en los comentarios";
