import { useEffect, useRef, useState } from "react";

export default function CardDesignerModal({ open, onClose, boda, invitados }) {
  const [templateFile, setTemplateFile] = useState(null);
  const [templateUrl, setTemplateUrl] = useState(null);
  const [templateInfo, setTemplateInfo] = useState({ w: 0, h: 0 });
  const [placed, setPlaced] = useState([]);
  const [fontFamily, setFontFamily] = useState('CormorantGaramond-SemiBold');
  const [fontSize, setFontSize] = useState(18);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);
  const [useSample, setUseSample] = useState(true);
  const [selectedPlacedId, setSelectedPlacedId] = useState(null);
  const [snapX, setSnapX] = useState(false);
  const [snapY, setSnapY] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapThreshold, setSnapThreshold] = useState(3); // percent
  const [snapToGrid, setSnapToGrid] = useState(true);
  const GRID_PX = 40; // grid size in px for overlay

  useEffect(() => {
    if (!templateFile) return;
    const url = URL.createObjectURL(templateFile);
    setTemplateUrl(url);

    const img = new Image();
    img.onload = () => {
      setTemplateInfo({ w: img.width, h: img.height });
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
      setTemplateUrl(null);
      setTemplateInfo({ w: 0, h: 0 });
      setPlaced([]);
    };
  }, [templateFile]);

  useEffect(() => {
    if (!open) {
      setTemplateFile(null);
      setPlaced([]);
    }
  }, [open]);

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
    { name: 'CormorantGaramond-SemiBold', file: 'CormorantGaramond-SemiBold.ttf' },
    { name: 'EuphoriaScript-Regular', file: 'EuphoriaScript-Regular.otf' },
    { name: 'Montserrat-Bold', file: 'Montserrat-Bold.otf' },
    { name: 'Montserrat-Italic', file: 'Montserrat-Italic.otf' },
    { name: 'Montserrat-Medium', file: 'Montserrat-Medium.otf' },
    { name: 'Montserrat-Regular', file: 'Montserrat-Regular.otf' },
    { name: 'PlayfairDisplay-Regular', file: 'PlayfairDisplay-Regular.otf' },
    { name: 'PlayfairDisplaySC-Bold', file: 'PlayfairDisplaySC-Bold.otf' },
    { name: 'PlayfairDisplaySC-Italic', file: 'PlayfairDisplaySC-Italic.otf' },
    { name: 'PlayfairDisplaySC-Regular', file: 'PlayfairDisplaySC-Regular.otf' },
  ];

  const [zoom, setZoom] = useState(100); // percent
  const [loadedFonts, setLoadedFonts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/fonts')
      .then(async (res) => {
        if (!res.ok) throw new Error('No fonts');
        const data = await res.json();
        if (cancelled) return;
        const mapped = data.map(f => ({ name: f.name || f.filename, path: f.url || `${window.location.origin}/fonts/${f.filename}`}));
        setLoadedFonts(mapped);
      })
      .catch(() => {
        // fallback to embedded list if API fails
        setLoadedFonts(backendFonts.map(f=>({ name: f.name, path: `${window.location.origin}/fonts/${f.file}`})));
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(()=>{
    // inject @font-face for available backend fonts so CSS can use them
    loadedFonts.forEach(f => {
      if (!document.getElementById(`font-${f.name}`)) {
        const style = document.createElement('style');
        style.id = `font-${f.name}`;
        // try to infer format from extension for better browser support
        const ext = f.path.split('.').pop().toLowerCase();
        const fmt = ext === 'ttf' ? 'truetype' : (ext === 'otf' ? 'opentype' : 'woff2');
        style.innerHTML = `@font-face{font-family: '${f.name}'; src: url('${f.path}') format('${fmt}'); font-display: swap;}`;
        document.head.appendChild(style);
      }
    });
  }, [loadedFonts]);

  // helper: ensure a font is loaded via FontFace API, returns Promise
  async function ensureFontLoaded(name) {
    try {
      // if already available, resolve
      if (document.fonts && document.fonts.check && document.fonts.check(`1em "${name}"`)) return;
      const f = loadedFonts.find(x => x.name === name);
      if (!f) return;
      // fetch font binary and register via FontFace API (safer: ensures real font content)
      if (window.FontFace) {
        const res = await fetch(f.path, { method: 'GET', mode: 'cors' });
        if (!res.ok) throw new Error('Font fetch failed');
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (!contentType.includes('font') && !contentType.includes('octet') && !contentType.includes('binary')) {
          // may still be ok if extension is correct; log warning
          console.warn('Font content-type may be incorrect:', contentType, f.path);
        }
        const ab = await res.arrayBuffer();
        const ff = new FontFace(name, ab);
        await ff.load();
        document.fonts.add(ff);
        return;
      }
    } catch (err) {
      console.warn('ensureFontLoaded error', err);
    }
  }

  function zoomIn() { setZoom(z => Math.min(400, z + 10)); }
  function zoomOut() { setZoom(z => Math.max(10, z - 10)); }

  function fitToScreen() {
    if (!canvasRef.current || !templateInfo.w || !templateInfo.h) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = Math.floor(Math.min((rect.width / templateInfo.w) * 100, (rect.height / templateInfo.h) * 100));
    if (scale <= 0) return;
    setZoom(scale);
  }

  async function downloadPreview() {
    if (!templateUrl) return alert('Sube una plantilla primero');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateUrl;
    await new Promise((res,rej)=>{ img.onload = res; img.onerror = rej; });
    const w = templateInfo.w || img.width || 1920;
    const h = templateInfo.h || img.height || 1080;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // ensure fonts used by the design are loaded before drawing text
    try {
      const usedFonts = Array.from(new Set(placed.map(p => p.fontFamily || fontFamily).filter(Boolean)));
      await Promise.all(usedFonts.map(f => document.fonts.load(`16px "${f}"`)));
    } catch (err) {
      // ignore font load failures
    }
    placed.forEach(p => {
      const px = (p.x / 100) * w;
      const py = (p.y / 100) * h;
      const fld = fieldsList.find(f=>f.key===p.field);
      const label = fld?fld.label:p.field;
      // determine display text: explicit -> sample -> label
      let display = p.text ?? label;
      if (!p.text && useSample && invitados && invitados.length>0) {
        const sample = invitados[0];
        const map = { nombre_invitado: sample.nombre_invitado, nombre_pareja: boda?.nombre_pareja, fecha_boda: boda?.fecha_boda, ciudad: boda?.ciudad, codigo_clave: invitados[0].codigo_clave, pases: invitados[0].pases };
        display = map[p.field] ?? label;
      }
      // draw text in black by default (contrasts most templates)
      ctx.fillStyle = '#000000';
      ctx.font = `${p.fontSize || fontSize}px "${p.fontFamily || fontFamily}", sans-serif`;
      ctx.fillText(display, px, py);
    });
    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = `prediseno_${Date.now()}.png`;
    a.click();
  }

  function onDragStart(e, fieldKey) {
    e.dataTransfer.setData("text/plain", `field:${fieldKey}`);
  }

  function onPlacedDragStart(e, placedId) {
    e.dataTransfer.setData("text/plain", `placed:${placedId}`);
    // allow move effect
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!templateUrl) return;
    const raw = e.dataTransfer.getData("text/plain");
    const rect = canvasRef.current.getBoundingClientRect();
    let px = (e.clientX - rect.left);
    let py = (e.clientY - rect.top);

    // If grid is active and snapToGrid true, snap pixels to nearest grid intersection
    if (showGrid && snapToGrid) {
      px = Math.round(px / GRID_PX) * GRID_PX;
      py = Math.round(py / GRID_PX) * GRID_PX;
    }

    const x = Math.round((px / rect.width) * 100);
    const y = Math.round((py / rect.height) * 100);

    // snapping to center (50%) within threshold%
    setSnapX(Math.abs(x - 50) <= snapThreshold);
    setSnapY(Math.abs(y - 50) <= snapThreshold);

    const field = raw;
    if (!field) return;
    if (field.startsWith('field:')) {
      const key = field.replace('field:', '');
      // determine default text for the new placed element (sample or label)
      const fld = fieldsList.find(f=>f.key===key);
      const label = fld ? fld.label : key;
      let defaultText = label;
      if (useSample && invitados && invitados.length>0) {
        const sample = invitados[0];
        const map = { nombre_invitado: sample.nombre_invitado, nombre_pareja: boda?.nombre_pareja, fecha_boda: boda?.fecha_boda, ciudad: boda?.ciudad, codigo_clave: sample.codigo_clave, pases: sample.pases };
        defaultText = map[key] ?? label;
      }
      setPlaced((p) => [...p, { id: Date.now(), field: key, x, y, fontSize, fontFamily, text: defaultText }]);
      setSelectedPlacedId(null);
      return;
    }
    if (field.startsWith('placed:')) {
      const id = Number(field.replace('placed:', ''));
      setPlaced((p) => p.map(it => it.id === id ? {...it, x, y} : it));
      setSelectedPlacedId(id);
      return;
    }
  }

  function allowDrop(e) {
    e.preventDefault();
    if (!canvasRef.current) return;
    try {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setSnapX(Math.abs(x - 50) <= snapThreshold);
      setSnapY(Math.abs(y - 50) <= snapThreshold);
    } catch (err) {
      // ignore
    }
  }

  function handleSave() {
    // Por ahora solo visual: devolvemos la configuración al console
    // Enviar al backend
    (async () => {
      try {
      setSaving(true);
      const form = new FormData();
      form.append('design', JSON.stringify({ placed, fontFamily, fontSize, fields: fieldsList }));
      if (templateFile) form.append('template', templateFile);

        const res = await fetch(`/api/mis-bodas/${boda?.id}/card-design`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          },
          body: form,
        });
        if (!res.ok) throw new Error('Error guardando diseño');
        const data = await res.json();
        console.log('Guardado:', data);
        alert('Diseño guardado. Puedes finalizar y regenerar tarjetas.');
        // mostrar preview si existe (campo en español `ruta_vista_previa`)
        if (data.card_design && data.card_design.ruta_vista_previa) {
          const url = data.card_design.ruta_vista_previa.startsWith('http') ? data.card_design.ruta_vista_previa : `/storage/${data.card_design.ruta_vista_previa}`;
          window.open(url, '_blank');
        }
      } catch (e) {
        console.error(e);
        alert('No se pudo guardar el diseño.');
      } finally {
        setSaving(false);
      }
    })();
  }

  function handleSelectPlaced(id) {
    setSelectedPlacedId(id);
    // compute immediate centering feedback
    const item = placed.find(p=>p.id===id);
    if (item) {
      setSnapX(Math.abs((item.x ?? 50) - 50) <= snapThreshold);
      setSnapY(Math.abs((item.y ?? 50) - 50) <= snapThreshold);
    }
  }

  function handleDeletePlaced(id) {
    setPlaced((p) => p.filter(it => it.id !== id));
    if (selectedPlacedId === id) setSelectedPlacedId(null);
  }

  function updateSelectedPlaced(changes) {
    if (!selectedPlacedId) return;
    setPlaced((p) => {
      const updated = p.map(it => it.id === selectedPlacedId ? {...it, ...changes} : it);
      const sel = updated.find(it => it.id === selectedPlacedId);
      if (sel) {
        setSnapX(Math.abs((sel.x ?? 50) - 50) <= snapThreshold);
        setSnapY(Math.abs((sel.y ?? 50) - 50) <= snapThreshold);
      }
      return updated;
    });
  }

  async function handleFinalizeAndGenerate() {
    if (!confirm('Finalizar diseño y regenerar tarjetas para todos los invitados?')) return;
    try {
      setSaving(true);
      const endpoint = `/api/mis-bodas/${boda?.id}/card-design/generate`;
      let res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json' } });
      // if vite dev server did not proxy this route, try common backend ports (fallback)
      if (res.status === 404) {
        const host = window.location.hostname || 'localhost';
        const tryPorts = [8080, 8000, 8001];
        for (const p of tryPorts) {
          try {
            const url = `${window.location.protocol}//${host}:${p}${endpoint}`;
            res = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json' } });
            if (res.ok || res.status !== 404) break;
          } catch (inner) {
            // continue
          }
        }
      }
      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(`Error iniciando generación: ${res.status} ${txt}`);
      }
      const data = await res.json();
      alert(data.message || 'Generación en cola. Se procesará en segundo plano.');
      onClose();
    } catch (e) {
      console.error(e);
      alert('No se pudo iniciar la generación. Revisa la consola para más detalle.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="w-full h-full bg-white shadow-lg overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-base font-semibold">Diseño de tarjeta</h3>
          <div className="flex items-center gap-2">
            <button className="md:hidden text-sm px-3 py-1 rounded-md border bg-slate-50" onClick={()=>setSidebarOpen(s=>!s)}>{sidebarOpen? 'Cerrar barra' : 'Abrir barra'}</button>
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
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-96 border-r overflow-auto p-6 bg-white`}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sube una plantilla (1920x1080 recomendada)</label>
                <input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0]; if(!f) return; setTemplateFile(f); }} />
                {templateInfo.w > 0 && <p className="text-[12px] text-slate-500 mt-2">Dimensiones: {templateInfo.w} x {templateInfo.h} px</p>}
                {templateFile && templateInfo.w && <p className="text-[12px] text-amber-700 mt-1">Si la imagen no es 1920x1080, el editor escalará visualmente.</p>}
                <div className="flex items-center gap-2 mt-2"><input id="useSample" type="checkbox" checked={useSample} onChange={(e)=>setUseSample(e.target.checked)} /><label htmlFor="useSample" className="text-xs text-slate-500">Usar datos de ejemplo</label></div>
                <div className="flex items-center gap-2 mt-2"><input id="showGrid" type="checkbox" checked={showGrid} onChange={(e)=>setShowGrid(e.target.checked)} /><label htmlFor="showGrid" className="text-xs text-slate-500">Mostrar cuadrícula</label></div>
                <div className="mt-2"><label className="text-xs text-slate-500">Ajuste centrado (%)</label><input type="range" min="1" max="10" value={snapThreshold} onChange={(e)=>setSnapThreshold(Number(e.target.value))} className="w-full" /><div className="flex items-center justify-between text-[11px] text-slate-400"><span>{snapThreshold}%</span><span className="text-xs">Sensibilidad</span></div></div>
                <div className="mt-2 flex items-center gap-2"><input id="snapToGrid" type="checkbox" checked={snapToGrid} onChange={(e)=>setSnapToGrid(e.target.checked)} /><label htmlFor="snapToGrid" className="text-xs text-slate-500">Ajustar automáticamente a cuadrícula</label></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Campos arrastrables</label>
                  <div className="flex gap-2 mb-2">
                  {(() => {
                    const sel = placed.find(p => p.id === selectedPlacedId);
                    const currentFamily = sel?.fontFamily ?? fontFamily;
                    const currentSize = sel?.fontSize ?? fontSize;
                    return (
                      <>
                        <select value={currentFamily} onChange={async (e)=>{ const v = e.target.value; setFontFamily(v); await ensureFontLoaded(v); if(selectedPlacedId) updateSelectedPlaced({ fontFamily: v }); }} className="text-sm rounded-md border px-2 py-1">
                          <option value="CormorantGaramond-SemiBold">Cormorant (pred)</option>
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          {loadedFonts.map(f=> <option key={f.name} value={f.name}>{f.name}</option>)}
                        </select>
                        <input type="number" min="6" max="500" step="1" value={currentSize} onChange={(e)=>{ const v = Number(e.target.value); if(selectedPlacedId) updateSelectedPlaced({ fontSize: v }); else setFontSize(v); }} className="w-20 rounded-md border px-2 py-1 text-sm" />
                      </>
                    );
                  })()}
                </div>
                

                <div className="mb-3">
                  <label className="text-xs text-slate-600">Zoom / Preview</label>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={zoomOut} className="px-3 py-1 rounded-md border">-</button>
                    <div className="px-3 py-1 rounded-md border flex items-center">{zoom}%</div>
                    <button type="button" onClick={zoomIn} className="px-3 py-1 rounded-md border">+</button>
                    <button type="button" onClick={fitToScreen} className="ml-2 px-3 py-1 rounded-md border">Fit</button>
                    <button type="button" onClick={downloadPreview} className="ml-2 px-3 py-1 rounded-md bg-slate-900 text-white">Descargar prediseño</button>
                  </div>
                </div>

                <div className="space-y-2">
                  {fieldsList.map((f) => (
                    <div key={f.key} draggable onDragStart={(e)=>onDragStart(e,f.key)} className="cursor-move rounded-md border border-slate-200 px-3 py-2 text-sm bg-white flex items-center justify-between">
                      <div><div className="font-medium">{f.label}</div><div className="text-[11px] text-slate-400">{f.key} {f.mappedTo ? `• map: ${f.mappedTo}` : ''}</div></div>
                      <div className="text-[11px] text-slate-400">Arrastrar</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button onClick={handleSave} disabled={saving} className="w-full inline-flex items-center justify-center rounded-md bg-emerald-700 text-white py-2 text-sm disabled:opacity-60">Guardar diseño</button>
                <button onClick={handleFinalizeAndGenerate} disabled={saving} className="w-full mt-2 inline-flex items-center justify-center rounded-md bg-slate-900 text-white py-2 text-sm disabled:opacity-60">Finalizar y regenerar tarjetas</button>
              </div>

              {selectedPlacedId && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Elemento seleccionado</h4>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500">Texto</label>
                    <input type="text" value={(placed.find(p=>p.id===selectedPlacedId)?.text) ?? ''} onChange={(e)=> updateSelectedPlaced({ text: e.target.value })} className="w-full rounded-md border px-2 py-1 text-sm" />
                    
                    <label className="text-sm text-slate-500">X (%)</label>
                    <input type="number" value={(placed.find(p=>p.id===selectedPlacedId)?.x) ?? 50} onChange={(e)=> updateSelectedPlaced({ x: Number(e.target.value) })} className="w-full rounded-md border px-2 py-1 text-sm" />
                    <label className="text-sm text-slate-500">Y (%)</label>
                    <input type="number" value={(placed.find(p=>p.id===selectedPlacedId)?.y) ?? 50} onChange={(e)=> updateSelectedPlaced({ y: Number(e.target.value) })} className="w-full rounded-md border px-2 py-1 text-sm" />
                    {/* tamaño del elemento se controla desde el control superior */}
                    <div className="flex gap-2"><button onClick={()=> handleDeletePlaced(selectedPlacedId)} className="flex-1 inline-flex items-center justify-center rounded-md bg-rose-600 text-white py-2 text-sm">Eliminar</button><button onClick={()=> setSelectedPlacedId(null)} className="flex-1 inline-flex items-center justify-center rounded-md border bg-white py-2 text-sm">Deseleccionar</button></div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 p-4 overflow-auto bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-none h-[calc(100vh-96px)] flex items-center justify-center">
              <div className="border border-slate-200 rounded-lg w-full h-full overflow-hidden relative bg-gray-50 flex items-center justify-center">
                {!templateUrl && <p className="text-sm text-slate-500">Sube una imagen de plantilla para empezar</p>}

                {templateUrl && (
                                  <div onDrop={handleDrop} onDragOver={allowDrop} className="relative w-full h-full overflow-auto flex items-center justify-center">
                                  <div ref={canvasRef} style={{ width: templateInfo.w ? `${templateInfo.w}px` : '100%', height: templateInfo.h ? `${templateInfo.h}px` : '100%', transform:`scale(${zoom/100})`, transformOrigin:'center center', position:'relative', backgroundImage: `url(${templateUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                    {showGrid && <div style={{position:'absolute', inset:0, pointerEvents:'none', backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`, backgroundSize: '40px 40px'}} />}
                    {placed.map((p)=>{
                      const fld = fieldsList.find((f)=>f.key===p.field);
                      const label = fld ? fld.label : p.field;
                      // display priority: explicit text on element -> sample mapping -> label
                      let display = p.text ?? label;
                      if (!p.text && useSample && invitados && invitados.length>0) {
                        const sample = invitados[0];
                        const map = { nombre_invitado: sample.nombre_invitado, nombre_pareja: boda?.nombre_pareja, fecha_boda: boda?.fecha_boda, ciudad: boda?.ciudad, codigo_clave: sample.codigo_clave, pases: sample.pases };
                        display = map[p.field] ?? label;
                      }
                      return (
                        <div key={p.id} draggable onDragStart={(e)=>onPlacedDragStart(e,p.id)} onClick={()=>handleSelectPlaced(p.id)} className={`absolute px-2 py-1 rounded-md ${selectedPlacedId===p.id? 'ring-2 ring-emerald-500' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)', cursor: 'move', background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: p.fontFamily || fontFamily, fontSize: `${p.fontSize || fontSize}px`, lineHeight: 1 }}>{display}</div>
                      );
                    })}
                    {snapX && <div style={{position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'rgba(16,185,129,0.9)'}} />}
                    {snapY && <div style={{position:'absolute', top:'50%', left:0, right:0, height:1, background:'rgba(16,185,129,0.9)'}} />}
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
