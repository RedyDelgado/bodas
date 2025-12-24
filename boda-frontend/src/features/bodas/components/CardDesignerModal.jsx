import { useEffect, useRef, useState } from "react";
import axiosClient from "../../../shared/config/axiosClient";
const BASE_W = 1080;
const BASE_H = 1920;
export default function CardDesignerModal({
  open,
  onClose,
  boda,
  invitados,
  onStartGenerate,
}) {
  const [templateFile, setTemplateFile] = useState(null);
  const [templateUrl, setTemplateUrl] = useState(null);
  const [templateNative, setTemplateNative] = useState({ w: 0, h: 0 }); // tamaño real del archivo (solo info)

  const [placed, setPlaced] = useState([]);
  const [fontFamily, setFontFamily] = useState("CormorantGaramond-SemiBold");
  const [fontSize, setFontSize] = useState(18);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const [useSample, setUseSample] = useState(true);
  const [selectedPlacedId, setSelectedPlacedId] = useState(null);
  const [snapX, setSnapX] = useState(false);
  const [snapY, setSnapY] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapThreshold, setSnapThreshold] = useState(3); // percent
  const [snapToGrid, setSnapToGrid] = useState(true);
  const GRID_PX = 40; // grid size in px for overlay
  const [templateFit, setTemplateFit] = useState("contain");
  useEffect(() => {
    if (!templateFile) return;

    const url = URL.createObjectURL(templateFile);
    setTemplateUrl(url);

    const img = new Image();
    img.onload = () => {
      // tamaño REAL del archivo (solo para mostrar/alertar)
      setTemplateNative({ w: img.width, h: img.height });
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
      setTemplateUrl(null);
      setTemplateNative({ w: 0, h: 0 });
      setPlaced([]);
    };
  }, [templateFile]);

  useEffect(() => {
    if (!open) {
      setTemplateFile(null);
      setPlaced([]);
    } else {
      // Cargar diseño guardado si existe
      loadDesignFromBoda();
    }
  }, [open]);
  useEffect(() => {
    if (open && templateUrl) {
      setZoom(100); // arranca 1:1
    }
  }, [open, templateUrl]);
  async function loadDesignFromBoda() {
    if (!boda?.id) return;
    setIsLoading(true);
    try {
      const { data } = await axiosClient.get(
        `/mis-bodas/${boda.id}/card-design/status`
      );
      const design = data?.card_design;
      if (!design) return;

      // Cargar plantilla si existe
      if (design.plantilla_ruta) {
        const fullUrl = `${window.location.origin}/storage/${design.plantilla_ruta}`;
        const res = await fetch(fullUrl);
        if (res.ok) {
          const blob = await res.blob();
          setTemplateFile(
            new File([blob], "plantilla.png", { type: blob.type })
          );
        }
      }

      // Cargar diseño JSON guardado
      if (design.diseno_json) {
        const json = design.diseno_json;
        setPlaced(json.placed || []);
        setFontFamily(json.fontFamily || "CormorantGaramond-SemiBold");
        setFontSize(json.fontSize || 18);
        setTextColor(json.color || "#000000");
        setTemplateFit(json.templateFit || "contain");
      }
    } catch (err) {
      console.warn("No se pudo cargar diseño previo:", err);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // axiosClient tiene baseURL = VITE_API_URL (ej. http://localhost:8000/api)
        const { data } = await axiosClient.get("/fonts"); // ==> /api/fonts en backend
        if (cancelled) return;

        const mapped = (data || []).map((f) => ({
          name: f.name || f.filename,
          // Si el backend devuelve url absoluta, úsala.
          // Si devuelve relativa, también funciona.
          path: f.url || `/api/fonts/file/${f.filename}`,
        }));

        setLoadedFonts(mapped);
      } catch (e) {
        // Fallback: usa fonts locales del frontend (public/fonts)
        setLoadedFonts([
          {
            name: "CormorantGaramond-SemiBold",
            path: `${window.location.origin}/fonts/CormorantGaramond-SemiBold.ttf`,
          },
          {
            name: "Montserrat-Bold",
            path: `${window.location.origin}/fonts/Montserrat-Bold.otf`,
          },
          {
            name: "Montserrat-Italic",
            path: `${window.location.origin}/fonts/Montserrat-Italic.otf`,
          },
          {
            name: "Montserrat-Medium",
            path: `${window.location.origin}/fonts/Montserrat-Medium.otf`,
          },
          {
            name: "Montserrat-Regular",
            path: `${window.location.origin}/fonts/Montserrat-Regular.otf`,
          },
        ]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const defaultFields = [
    { key: "nombre_invitado", label: "Nombre del invitado" },
    { key: "nombre_pareja", label: "Nombre de la pareja" },
    { key: "fecha_boda", label: "Fecha" },
    { key: "ciudad", label: "Lugar" },
    { key: "codigo_clave", label: "Código" },
    { key: "pases", label: "Pases" },
  ];
  const [fieldsList, setFieldsList] = useState(defaultFields);
  // fonts available in backend public/fonts
  const backendFonts = [
    {
      name: "CormorantGaramond-SemiBold",
      file: "CormorantGaramond-SemiBold.ttf",
    },
    { name: "EuphoriaScript-Regular", file: "EuphoriaScript-Regular.otf" },
    { name: "Montserrat-Bold", file: "Montserrat-Bold.otf" },
    { name: "Montserrat-Italic", file: "Montserrat-Italic.otf" },
    { name: "Montserrat-Medium", file: "Montserrat-Medium.otf" },
    { name: "Montserrat-Regular", file: "Montserrat-Regular.otf" },
    { name: "PlayfairDisplay-Regular", file: "PlayfairDisplay-Regular.otf" },
    { name: "PlayfairDisplaySC-Bold", file: "PlayfairDisplaySC-Bold.otf" },
    { name: "PlayfairDisplaySC-Italic", file: "PlayfairDisplaySC-Italic.otf" },
    {
      name: "PlayfairDisplaySC-Regular",
      file: "PlayfairDisplaySC-Regular.otf",
    },
  ];

  const [zoom, setZoom] = useState(100); // percent
  const [loadedFonts, setLoadedFonts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // inject @font-face for available backend fonts so CSS can use them
    loadedFonts.forEach((f) => {
      if (!document.getElementById(`font-${f.name}`)) {
        const style = document.createElement("style");
        style.id = `font-${f.name}`;
        // try to infer format from extension for better browser support
        const ext = f.path.split(".").pop().toLowerCase();
        const fmt =
          ext === "ttf" ? "truetype" : ext === "otf" ? "opentype" : "woff2";
        style.innerHTML = `@font-face{font-family: '${f.name}'; src: url('${f.path}') format('${fmt}'); font-display: swap;}`;
        document.head.appendChild(style);
      }
    });
  }, [loadedFonts]);

  // helper: ensure a font is loaded via FontFace API, returns Promise
  async function ensureFontLoaded(name) {
    try {
      // if already available, resolve
      if (
        document.fonts &&
        document.fonts.check &&
        document.fonts.check(`1em "${name}"`)
      )
        return;
      const f = loadedFonts.find((x) => x.name === name);
      if (!f) return;
      // fetch font binary and register via FontFace API (safer: ensures real font content)
      if (window.FontFace) {
        const res = await fetch(f.path, { method: "GET", mode: "cors" });
        if (!res.ok) throw new Error("Font fetch failed");
        const contentType = (
          res.headers.get("content-type") || ""
        ).toLowerCase();
        if (
          !contentType.includes("font") &&
          !contentType.includes("octet") &&
          !contentType.includes("binary")
        ) {
          // may still be ok if extension is correct; log warning
          console.warn(
            "Font content-type may be incorrect:",
            contentType,
            f.path
          );
        }
        const ab = await res.arrayBuffer();
        const ff = new FontFace(name, ab);
        await ff.load();
        document.fonts.add(ff);
        return;
      }
    } catch (err) {
      console.warn("ensureFontLoaded error", err);
    }
  }

  function zoomIn() {
    setZoom((z) => Math.min(400, z + 10));
  }
  function zoomOut() {
    setZoom((z) => Math.max(10, z - 10));
  }

  function fitToScreen() {
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const padding = 40;

    const scale = Math.floor(
      Math.min(
        ((rect.width - padding) / BASE_W) * 100,
        ((rect.height - padding) / BASE_H) * 100
      )
    );

    if (scale > 0) setZoom(Math.max(10, Math.min(200, scale)));
  }

  async function downloadPreview() {
    if (!templateUrl) return alert("Sube una plantilla primero");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateUrl;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    const w = BASE_W;
    const h = BASE_H;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    drawTemplate(ctx, img, w, h, templateFit);

    // ensure fonts used by the design are loaded before drawing text
    try {
      const usedFonts = Array.from(
        new Set(placed.map((p) => p.fontFamily || fontFamily).filter(Boolean))
      );
      await Promise.all(usedFonts.map((f) => ensureFontLoaded(f)));
      await Promise.all(
        usedFonts.map((f) => document.fonts.load(`16px "${f}"`))
      );
      await document.fonts.ready;
    } catch (err) {}

    placed.forEach((p) => {
      const px = (p.x / 100) * w;
      const py = (p.y / 100) * h;

      const fld = fieldsList.find((f) => f.key === p.field);
      const label = fld ? fld.label : p.field;
      let display = label;

      if (useSample && invitados && invitados.length > 0) {
        const sample = invitados[0];
        const map = {
          nombre_invitado: sample.nombre_invitado,
          nombre_pareja: boda?.nombre_pareja,
          fecha_boda: boda?.fecha_boda,
          ciudad: boda?.ciudad,
          codigo_clave: sample.codigo_clave,
          pases: sample.pases,
        };
        display = map[p.field] ?? label;
      }

      ctx.fillStyle = p.color || textColor || "#000000";
      ctx.font = `${p.fontSize || fontSize}px "${
        p.fontFamily || fontFamily
      }", sans-serif`;

      // ✅ CENTRADO IGUAL AL DOM (center + middle)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(display, px, py);
    });

    // Exportar como JPEG comprimido (calidad 0.88)
    const data = canvas.toDataURL("image/jpeg", 0.88);
    const a = document.createElement("a");
    a.href = data;
    a.download = `prediseno_${Date.now()}.jpg`;
    a.click();
  }

  function onDragStart(e, fieldKey) {
    e.dataTransfer.setData("text/plain", `field:${fieldKey}`);
  }

  function drawTemplate(ctx, img, w, h, mode) {
    const iw = img.width;
    const ih = img.height;

    if (mode === "stretch") {
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }

    const scale =
      mode === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);

    const dw = iw * scale;
    const dh = ih * scale;

    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function onPlacedDragStart(e, placedId) {
    e.dataTransfer.setData("text/plain", `placed:${placedId}`);
    // allow move effect
    e.dataTransfer.effectAllowed = "move";
  }
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const round2 = (n) => Math.round(n * 100) / 100;

  function applySnapping(xPctRaw, yPctRaw, opts = {}) {
    const { useGrid = snapToGrid, useCenter = true } = opts;

    // NO redondees acá, deja decimales
    let xPct = clamp(xPctRaw, 0, 100);
    let yPct = clamp(yPctRaw, 0, 100);

    // 1) Snap a grilla (solo si corresponde)
    if (useGrid) {
      let dx = (xPct / 100) * BASE_W;
      let dy = (yPct / 100) * BASE_H;

      dx = Math.round(dx / GRID_PX) * GRID_PX;
      dy = Math.round(dy / GRID_PX) * GRID_PX;

      xPct = (dx / BASE_W) * 100;
      yPct = (dy / BASE_H) * 100;
    }

    // 2) Snap al centro (solo si corresponde)
    if (useCenter) {
      if (Math.abs(xPct - 50) <= snapThreshold) xPct = 50;
      if (Math.abs(yPct - 50) <= snapThreshold) yPct = 50;
    }

    xPct = round2(xPct);
    yPct = round2(yPct);

    return {
      xPct,
      yPct,
      snapX: xPct === 50,
      snapY: yPct === 50,
    };
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!templateUrl) return;

    const raw = e.dataTransfer.getData("text/plain");
    if (!canvasRef.current || !raw) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const xRaw = ((e.clientX - rect.left) / rect.width) * 100;
    const yRaw = ((e.clientY - rect.top) / rect.height) * 100;

    const s = applySnapping(xRaw, yRaw);

    setSnapX(s.snapX);
    setSnapY(s.snapY);

    const xPct = s.xPct;
    const yPct = s.yPct;

    if (raw.startsWith("field:")) {
      const key = raw.replace("field:", "");
      const id = Date.now();

      setPlaced((p) => [
        ...p,
        {
          id,
          field: key,
          x: xPct,
          y: yPct,
          fontSize,
          fontFamily,
          color: textColor,
        },
      ]);

      setSelectedPlacedId(id);
      return;
    }

    if (raw.startsWith("placed:")) {
      const id = Number(raw.replace("placed:", ""));
      setPlaced((p) =>
        p.map((it) => (it.id === id ? { ...it, x: xPct, y: yPct } : it))
      );
      setSelectedPlacedId(id);
    }
  }

  function allowDrop(e) {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const xRaw = ((e.clientX - rect.left) / rect.width) * 100;
    const yRaw = ((e.clientY - rect.top) / rect.height) * 100;

    const s = applySnapping(xRaw, yRaw);
    setSnapX(s.snapX);
    setSnapY(s.snapY);
  }

  async function handleSave({ silent = false } = {}) {
    try {
      setSaving(true);

      const form = new FormData();
      form.append(
        "design",
        JSON.stringify({
          placed,
          fontFamily,
          fontSize,
          fields: fieldsList,
          color: textColor,
          templateFit,
        })
      );
      if (templateFile) form.append("template", templateFile);

      const { data } = await axiosClient.post(
        `/mis-bodas/${boda?.id}/card-design`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!silent) {
        alert("Diseño guardado. Puedes finalizar y regenerar tarjetas.");
      }

      if (data?.card_design?.ruta_vista_previa) {
        // backend guarda ruta tipo "tarjetas/....png" dentro de storage/public
        const apiBase = (import.meta.env.VITE_API_URL || "").replace(
          /\/api\/?$/,
          ""
        );
        const url = `${apiBase}/storage/${data.card_design.ruta_vista_previa}`;
        window.open(url, "_blank");
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el diseño. Revisa consola.");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  function handleSelectPlaced(id) {
    setSelectedPlacedId(id);
    // compute immediate centering feedback
    const item = placed.find((p) => p.id === id);
    if (item) {
      setSnapX(Math.abs((item.x ?? 50) - 50) <= snapThreshold);
      setSnapY(Math.abs((item.y ?? 50) - 50) <= snapThreshold);
    }
  }

  function handleDeletePlaced(id) {
    setPlaced((p) => p.filter((it) => it.id !== id));
    if (selectedPlacedId === id) setSelectedPlacedId(null);
  }

  function updateSelectedPlaced(changes) {
    if (!selectedPlacedId) return;

    const isManualMove =
      Object.prototype.hasOwnProperty.call(changes, "x") ||
      Object.prototype.hasOwnProperty.call(changes, "y");

    setPlaced((p) => {
      const updated = p.map((it) => {
        if (it.id !== selectedPlacedId) return it;

        const nextX = typeof changes.x === "number" ? changes.x : it.x ?? 50;
        const nextY = typeof changes.y === "number" ? changes.y : it.y ?? 50;

        // Si viene de inputs X/Y => NO grilla (obedece exacto)
        const s = applySnapping(nextX, nextY, {
          useGrid: isManualMove ? false : snapToGrid,
          useCenter: isManualMove ? false : true,
        });

        return { ...it, ...changes, x: s.xPct, y: s.yPct };
      });

      const sel = updated.find((it) => it.id === selectedPlacedId);
      if (sel) {
        setSnapX(sel.x === 50);
        setSnapY(sel.y === 50);
      }

      return updated;
    });
  }

  async function handleFinalizeAndGenerate() {
    const ok = window.confirm(
      "Esto guardará el diseño y regenerará todas las tarjetas. ¿Deseas continuar?"
    );
    if (!ok) return;

    try {
      await handleSave({ silent: true });
    } catch (e) {
      return;
    }
    if (onStartGenerate) return onStartGenerate({ skipConfirm: true });
    alert("No hay handler onStartGenerate.");
  }

  if (!open) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-slate-700 font-medium">
            Cargando plantilla guardada...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="w-full h-full bg-white shadow-lg overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-base font-semibold">Diseño de tarjeta</h3>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-sm px-3 py-1 rounded-md border bg-slate-50"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              {sidebarOpen ? "Cerrar barra" : "Abrir barra"}
            </button>
            <button
              className="text-sm px-3 py-1 rounded-md border bg-slate-50"
              onClick={() => {
                setTemplateFile(null);
                setPlaced([]);
              }}
            >
              Reset
            </button>
            <button
              className="text-sm px-3 py-1 rounded-md bg-slate-900 text-white"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside
            className={`${
              sidebarOpen ? "block" : "hidden"
            } md:block w-96 border-r overflow-auto p-6 bg-white`}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Sube una plantilla (1080x1920 recomendada)
                </label>
                <div className="mt-2">
                  <label className="block text-xs text-slate-500 mb-1">
                    Ajuste de plantilla
                  </label>
                  <select
                    value={templateFit}
                    onChange={(e) => setTemplateFit(e.target.value)}
                    className="w-full rounded-md border px-2 py-1 text-sm"
                  >
                    <option value="contain">Contain (sin deformar)</option>
                    <option value="cover">Cover (llena, puede recortar)</option>
                    <option value="stretch">Stretch (deforma)</option>
                  </select>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setTemplateFile(f);
                  }}
                />
                {templateNative.w > 0 && (
                  <p className="text-[12px] text-slate-500 mt-2">
                    Archivo: {templateNative.w} x {templateNative.h} px ·
                    Editor/Salida: {BASE_W} x {BASE_H} px
                  </p>
                )}
                {templateNative.w > 0 &&
                  (templateNative.w !== BASE_W ||
                    templateNative.h !== BASE_H) && (
                    <p className="text-[12px] text-amber-700 mt-1">
                      Tu plantilla no es {BASE_W}x{BASE_H}. Se estirará a 9:16 y
                      el tamaño real puede variar. Recomendado: subir plantilla
                      exacta 1080×1920.
                    </p>
                  )}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="useSample"
                    type="checkbox"
                    checked={useSample}
                    onChange={(e) => setUseSample(e.target.checked)}
                  />
                  <label htmlFor="useSample" className="text-xs text-slate-500">
                    Usar datos de ejemplo
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="showGrid"
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                  <label htmlFor="showGrid" className="text-xs text-slate-500">
                    Mostrar cuadrícula
                  </label>
                </div>
                <div className="mt-2">
                  <label className="text-xs text-slate-500">
                    Ajuste centrado (%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={snapThreshold}
                    onChange={(e) => setSnapThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{snapThreshold}%</span>
                    <span className="text-xs">Sensibilidad</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="snapToGrid"
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                  />
                  <label
                    htmlFor="snapToGrid"
                    className="text-xs text-slate-500"
                  >
                    Ajustar automáticamente a cuadrícula
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Campos arrastrables
                </label>
                <div className="flex flex-wrap gap-3 mb-2 items-center">
                  {(() => {
                    const sel = placed.find((p) => p.id === selectedPlacedId);
                    const currentFamily = sel?.fontFamily ?? fontFamily;
                    const currentSize = sel?.fontSize ?? fontSize;
                    const currentColor = sel?.color ?? textColor;
                    return (
                      <>
                        <select
                          value={currentFamily}
                          onChange={async (e) => {
                            const v = e.target.value;
                            setFontFamily(v);
                            await ensureFontLoaded(v);
                            if (selectedPlacedId)
                              updateSelectedPlaced({ fontFamily: v });
                          }}
                          className="text-sm rounded-md border px-2 py-1"
                        >
                          <option value="CormorantGaramond-SemiBold">
                            Cormorant (pred)
                          </option>
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          {loadedFonts.map((f) => (
                            <option key={f.name} value={f.name}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="6"
                          max="500"
                          step="1"
                          value={currentSize}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (selectedPlacedId)
                              updateSelectedPlaced({ fontSize: v });
                            else setFontSize(v);
                          }}
                          className="w-20 rounded-md border px-2 py-1 text-sm"
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          Color
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTextColor(v);
                              if (selectedPlacedId)
                                updateSelectedPlaced({ color: v });
                            }}
                            className="w-14 h-10 rounded-md border cursor-pointer"
                            title="Color del texto"
                          />
                        </label>
                      </>
                    );
                  })()}
                </div>

                <div className="mb-3">
                  <label className="text-xs text-slate-600">
                    Zoom / Preview
                  </label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={zoomOut}
                      className="px-3 py-1 rounded-md border"
                    >
                      -
                    </button>
                    <div className="px-3 py-1 rounded-md border flex items-center">
                      {zoom}%
                    </div>
                    <button
                      type="button"
                      onClick={zoomIn}
                      className="px-3 py-1 rounded-md border"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={fitToScreen}
                      className="ml-2 px-3 py-1 rounded-md border"
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={downloadPreview}
                      className="ml-2 px-3 py-1 rounded-md bg-slate-900 text-white"
                    >
                      Descargar prediseño
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {fieldsList.map((f) => (
                    <div
                      key={f.key}
                      draggable
                      onDragStart={(e) => onDragStart(e, f.key)}
                      className="cursor-move rounded-md border border-slate-200 px-3 py-2 text-sm bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{f.label}</div>
                        <div className="text-[11px] text-slate-400">
                          {f.key} {f.mappedTo ? `• map: ${f.mappedTo}` : ""}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Arrastrar
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center rounded-md bg-emerald-700 text-white py-2 text-sm disabled:opacity-60"
                >
                  Guardar diseño
                </button>
                <button
                  onClick={handleFinalizeAndGenerate}
                  disabled={saving}
                  className="w-full mt-2 inline-flex items-center justify-center rounded-md bg-slate-900 text-white py-2 text-sm disabled:opacity-60"
                >
                  Finalizar y regenerar tarjetas
                </button>
              </div>

              {selectedPlacedId && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    Elemento seleccionado
                  </h4>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500">X (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={
                        placed.find((p) => p.id === selectedPlacedId)?.x ?? 50
                      }
                      onChange={(e) =>
                        updateSelectedPlaced({ x: Number(e.target.value) })
                      }
                      className="w-full rounded-md border px-2 py-1 text-sm"
                    />
                    <label className="text-sm text-slate-500">Y (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={
                        placed.find((p) => p.id === selectedPlacedId)?.y ?? 50
                      }
                      onChange={(e) =>
                        updateSelectedPlaced({ y: Number(e.target.value) })
                      }
                      className="w-full rounded-md border px-2 py-1 text-sm"
                    />
                    {/* tamaño del elemento se controla desde el control superior */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeletePlaced(selectedPlacedId)}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-rose-600 text-white py-2 text-sm"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setSelectedPlacedId(null)}
                        className="flex-1 inline-flex items-center justify-center rounded-md border bg-white py-2 text-sm"
                      >
                        Deseleccionar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main
            ref={viewportRef}
            className="flex-1 p-4 overflow-hidden bg-gray-50 flex items-center justify-center"
          >
            <div style={{ width: '100vw', height: 'calc(100vh - 96px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: BASE_W, height: BASE_H, minWidth: BASE_W, minHeight: BASE_H, maxWidth: BASE_W, maxHeight: BASE_H, position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {!templateUrl ? (
                  <p className="text-sm text-slate-500">
                    Sube una imagen de plantilla para empezar
                  </p>
                ) : (
                  <div
                    className="rounded-lg overflow-hidden border bg-white flex items-center justify-center"
                    style={{
                      width: BASE_W,
                      height: BASE_H,
                      aspectRatio: `${BASE_W} / ${BASE_H}`,
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    {/* Contenedor que centra la stage escalada, SIEMPRE 1080x1920 px reales */}
                    <div style={{ width: BASE_W, height: BASE_H, position: 'relative', overflow: 'hidden' }}>
                      <div
                        ref={canvasRef}
                        onDrop={handleDrop}
                        onDragOver={allowDrop}
                        style={{
                          width: `${BASE_W}px`,
                          height: `${BASE_H}px`,
                          position: "relative",
                          transform: `scale(${zoom / 100})`,
                          transformOrigin: "center center",
                          backgroundImage: `url(${templateUrl})`,
                          backgroundSize:
                            templateFit === "stretch"
                              ? "100% 100%"
                              : templateFit,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          backgroundColor: "#fff",
                          overflow: 'hidden',
                        }}
                      >
                        {showGrid && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              pointerEvents: "none",
                              backgroundImage:
                                "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
                              backgroundSize: `${GRID_PX}px ${GRID_PX}px`,
                            }}
                          />
                        )}

                        {placed.map((p) => {
                          const fld = fieldsList.find((f) => f.key === p.field);
                          const label = fld ? fld.label : p.field;
                          let display = label;

                          if (useSample && invitados && invitados.length > 0) {
                            const sample = invitados[0];
                            const map = {
                              nombre_invitado: sample.nombre_invitado,
                              nombre_pareja: boda?.nombre_pareja,
                              fecha_boda: boda?.fecha_boda,
                              ciudad: boda?.ciudad,
                              codigo_clave: sample.codigo_clave,
                              pases: sample.pases,
                            };
                            display = map[p.field] ?? label;
                          }

                          return (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={(e) => onPlacedDragStart(e, p.id)}
                              onClick={() => handleSelectPlaced(p.id)}
                              className={`absolute rounded-md ${
                                selectedPlacedId === p.id
                                  ? "ring-2 ring-emerald-500"
                                  : ""
                              }`}
                              style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                transform: "translate(-50%,-50%)",
                                cursor: "move",
                                color: p.color || textColor,
                                fontFamily: p.fontFamily || fontFamily,
                                fontSize: `${p.fontSize || fontSize}px`,
                                lineHeight: 1,
                                padding: 0,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {display}
                            </div>
                          );
                        })}

                        {snapX && (
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: 0,
                              bottom: 0,
                              width: 1,
                              background: "rgba(16,185,129,0.9)",
                            }}
                          />
                        )}
                        {snapY && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: 0,
                              right: 0,
                              height: 1,
                              background: "rgba(16,185,129,0.9)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
