# INSTRUCCIONES MANUALES PARA COMPLETAR LOS CAMBIOS

## Paso 1: Agregar estado para filtros
En BodaInvitadosPage.jsx, después de la línea:
```jsx
const [busqueda, setBusqueda] = useState("");
```

Agregar:
```jsx
const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos" | "confirmados" | "pendientes" | "no_asisten"
```

---

## Paso 2: Agregar import de FiDownload
Buscar la línea con los imports de iconos:
```jsx
import {
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTrash2,
```

Y cambiar a:
```jsx
import {
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTrash2,
  FiDownload,
```

---

## Paso 3: Agregar import del servicio PDF
Después de:
```jsx
import GenerationProgressModal from "../components/GenerationProgressModal";
```

Agregar:
```jsx
import { generarPdfInvitados } from "../services/generarPdfInvitados";
```

---

## Paso 4: Agregar función para descargar PDF
Después de la función `handleSaveEdit`, agregar:
```jsx
const handleDescargarPdf = async () => {
  try {
    await generarPdfInvitados(boda, invitados);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    alert("No se pudo descargar el PDF. Intenta nuevamente.");
  }
};
```

---

## Paso 5: Agregar función para aplicar filtros
Después de `handleDescargarPdf`, agregar:
```jsx
const aplicarFiltro = () => {
  if (filtroEstado === "todos") return invitados;
  if (filtroEstado === "confirmados") return invitados.filter((i) => i.es_confirmado === 1);
  if (filtroEstado === "pendientes") return invitados.filter((i) => i.es_confirmado === 0 || i.es_confirmado === null || i.es_confirmado === undefined);
  if (filtroEstado === "no_asisten") return invitados.filter((i) => i.es_confirmado === -1);
  return invitados;
};

const invitadosFiltradosPorEstado = useMemo(() => {
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
```

---

## Paso 6: Reemplazar invitados filtrados en el render
Buscar donde dice `{invitados.map((i) =>` en la tabla y cambiar a:
```jsx
{invitadosFiltradosPorEstado.map((i) =>
```

(Busca todas las ocurrencias de invitados.map en la sección de tabla)

---

## Paso 7: Reemplazar sección de indicadores
Buscar esta línea:
```jsx
<div className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-gray-100 px-3 py-1.5">
  <FiXCircle className="w-4 h-4 text-gray-600" />
  <span className="text-[11px] text-gray-600">
    Pases desactivados:{" "}
    <span className="font-semibold">{stats.totalPasesNoAsiste}</span>
  </span>
</div>
```

Y cambiar a:
```jsx
<div className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-1.5">
  <FiUsers className="w-4 h-4 text-blue-700" />
  <span className="text-[11px] text-blue-700">
    Pases activos:{" "}
    <span className="font-semibold">{stats.totalPases - stats.totalPasesNoAsiste}</span>
  </span>
</div>
```

---

## Paso 8: Agregar botón PDF después de los indicadores
Después del div de indicadores, agregar:
```jsx
{/* Botón descargar PDF */}
<button
  onClick={handleDescargarPdf}
  disabled={!invitados.length}
  className="inline-flex items-center gap-2 rounded-full bg-amber-600 text-white px-4 py-2 text-xs font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
>
  <FiDownload className="w-4 h-4" />
  Descargar PDF
</button>
```

---

## Paso 9: Agregar filtros por estado
Buscar el div del buscador:
```jsx
<div className="relative w-full sm:w-64">
  <input
    type="text"
    value={busqueda}
```

Y DESPUÉS de ese div de buscador, agregar ANTES del cierre:
```jsx
{/* Filtros por estado */}
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
```

---

Después de hacer estos cambios, ejecuta:
```
npm run build
```

Si todo compila sin errores, ya estará listo!
