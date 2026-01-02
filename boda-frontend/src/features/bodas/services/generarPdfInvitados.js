import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera PDF con lista de invitados organizados por estado
 */
export async function generarPdfInvitados(boda, invitados) {
  if (!boda || !invitados.length) {
    throw new Error("Faltan datos para generar el PDF");
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const formatFecha = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("es-ES");
  };

  const formatFechaHora = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString("es-ES")} ${d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const nombreBoda =
    boda.nombre_pareja || boda.nombre_novios || boda.nombre_evento || "Boda";
  const fechaBoda = formatFecha(boda.fecha_boda);
  const horaBoda = boda.hora_boda || boda.hora_evento || null;
  const lugarBoda =
    boda.lugar || boda.lugar_boda || boda.ubicacion || boda.direccion || boda.ciudad;
  const novio1 = boda.nombre_novio_1 || "";
  const novio2 = boda.nombre_novio_2 || "";
  const frasePrincipal = boda.frase_principal || boda.eslogan || "";
  const urlPublica =
    boda.dominio_personalizado ||
    boda.url_publica_cache ||
    boda.url_publica ||
    boda.subdominio ||
    "";
  const textoReligioso = boda.texto_fecha_religioso || "";
  const textoCivil = boda.texto_fecha_civil || "";
  const textoCronograma = boda.cronograma_texto || "";
  const localReligioso = boda.local_religioso || "";
  const localRecepcion = boda.local_recepcion || "";
  const padresNovio = boda.texto_padres_novio || "";
  const padresNovia = boda.texto_padres_novia || "";
  const padrinosReligiosos = boda.texto_padrinos_mayores || "";
  const padrinosCiviles = boda.texto_padrinos_civiles || "";

  let yPosition = 18;

  // ===== ENCABEZADO SIN FONDO =====
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text(nombreBoda, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 7;
  doc.setFontSize(12);
  doc.setFont(undefined, "medium");
  const nombresLinea = [novio1, novio2].filter(Boolean).join(" & ");
  if (nombresLinea) {
    doc.text(nombresLinea, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 6;
  }

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  const lineaFecha = fechaBoda ? `Fecha: ${fechaBoda}` : "Fecha no disponible";
  const lineaHora = horaBoda ? ` • Hora: ${horaBoda}` : "";
  doc.text(`${lineaFecha}${lineaHora}`, pageWidth / 2, yPosition, {
    align: "center",
  });

  if (lugarBoda) {
    yPosition += 6;
    doc.text(`Lugar: ${lugarBoda}`, pageWidth / 2, yPosition, { align: "center" });
  }

  if (urlPublica) {
    yPosition += 6;
    doc.text(`Sitio: ${urlPublica}`, pageWidth / 2, yPosition, { align: "center" });
  }

  yPosition += 8;

  // Línea fina divisoria
  doc.setDrawColor(220, 220, 220);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 8;

  // Detalles adicionales
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  if (frasePrincipal) {
    doc.text(frasePrincipal, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 6;
  }
  doc.setFont(undefined, "normal");

  const infoLines = [];
  const seen = new Set();
  const addInfo = (raw) => {
    if (!raw) return;
    let clean = String(raw).trim();
    // quita bullets o puntos finales repetidos
    clean = clean.replace(/[•·]+$/u, "").replace(/\s+$/u, "");
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    infoLines.push(clean);
  };

  addInfo(textoReligioso && `Ceremonia: ${textoReligioso}`);
  addInfo(textoCivil && `Recepción civil: ${textoCivil}`);
  addInfo(textoCronograma && `Cronograma: ${textoCronograma}`);
  addInfo(localReligioso && `Templo: ${localReligioso}`);
  addInfo(localRecepcion && `Recepción: ${localRecepcion}`);
  addInfo(padresNovio && `Padres del novio: ${padresNovio}`);
  addInfo(padresNovia && `Padres de la novia: ${padresNovia}`);
  addInfo(padrinosReligiosos && `Padrinos religiosos: ${padrinosReligiosos}`);
  addInfo(padrinosCiviles && `Padrinos civiles: ${padrinosCiviles}`);

  const maxWidth = pageWidth - 28; // small margins left/right
  infoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, maxWidth);
    wrapped.forEach((textLine) => {
      doc.text(textLine, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 5;
    });
  });

  yPosition += 5;

  // Fecha de impresión
  doc.setFontSize(8);
  doc.setFont(undefined, "italic");
  doc.text(
    `Impreso: ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString(
      "es-ES"
    )}`,
    14,
    yPosition
  );

  yPosition += 10;

  // ===== SEPARAR INVITADOS POR ESTADO =====
  const byNombre = (a, b) =>
    (a.nombre_invitado || "").localeCompare(b.nombre_invitado || "", "es", {
      sensitivity: "base",
    });

  const confirmados = invitados.filter((i) => i.es_confirmado === 1).sort(byNombre);
  const pendientes = invitados
    .filter((i) => i.es_confirmado === 0 || i.es_confirmado === null || i.es_confirmado === undefined)
    .sort(byNombre);
  const noAsisten = invitados.filter((i) => i.es_confirmado === -1).sort(byNombre);

  const totalPasesConfirmados = confirmados.reduce((acc, i) => acc + (i.pases ?? 1), 0);
  const totalPasesPendientes = pendientes.reduce((acc, i) => acc + (i.pases ?? 1), 0);
  const totalPasesNoAsisten = noAsisten.reduce((acc, i) => acc + (i.pases ?? 1), 0);

  // ===== TABLA 1: CONFIRMADOS =====
  if (confirmados.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Invitados confirmados", 14, yPosition);
    yPosition += 6;

    doc.setFillColor(34, 197, 94); // Green
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`✓ ${confirmados.length} invitados, ${totalPasesConfirmados} pases`, 14, yPosition);

    yPosition += 7;

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Nombre", "Teléfono", "Pases", "Fecha/Hora confirmación", "Nota"]],
      body: confirmados.map((inv, idx) => [
        idx + 1,
        inv.nombre_invitado || "-",
        inv.celular || inv.telefono || "-",
        inv.pases || 1,
        formatFechaHora(inv.fecha_confirmacion),
        inv.notas || "-",
      ]),
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 12;
  }

  // ===== TABLA 2: PENDIENTES =====
  if (pendientes.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Pendientes por confirmar", 14, yPosition);
    yPosition += 6;

    doc.setFillColor(251, 146, 60); // Orange
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`⏳ ${pendientes.length} invitados, ${totalPasesPendientes} pases`, 14, yPosition);

    yPosition += 7;

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Nombre", "Teléfono", "Pases", "Nota"]],
      body: pendientes.map((inv, idx) => [
        idx + 1,
        inv.nombre_invitado || "-",
        inv.celular || inv.telefono || "-",
        inv.pases || 1,
        inv.notas || "-",
      ]),
      headStyles: {
        fillColor: [251, 146, 60],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [254, 245, 235] },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 12;
  }

  // ===== TABLA 3: NO ASISTEN =====
  if (noAsisten.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("No asistirán", 14, yPosition);
    yPosition += 6;

    doc.setFillColor(239, 68, 68); // Red
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`✗ ${noAsisten.length} invitados, ${totalPasesNoAsisten} pases`, 14, yPosition);

    yPosition += 7;

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Nombre", "Teléfono", "Pases", "Motivo / Nota"]],
      body: noAsisten.map((inv, idx) => [
        idx + 1,
        inv.nombre_invitado || "-",
        inv.celular || inv.telefono || "-",
        inv.pases || 1,
        inv.notas || "-",
      ]),
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      margin: { left: 14, right: 14 },
    });
  }

  // ===== RESUMEN PIE DE PÁGINA =====
  const totalPases = totalPasesConfirmados + totalPasesPendientes + totalPasesNoAsisten;
  const pasesActivos = totalPases - totalPasesNoAsisten;

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  
  const resumenText = [
    `RESUMEN: Invitados: ${invitados.length} | Pases totales: ${totalPases} | Pases activos: ${pasesActivos} | Confirmados: ${totalPasesConfirmados} | Pendientes: ${totalPasesPendientes} | No asisten: ${totalPasesNoAsisten}`,
  ];

  doc.text(resumenText, 14, pageHeight - 20);

  // Guardar PDF
  const nombreArchivoBoda = (nombreBoda || "boda").replace(/\s+/g, "_");
  const fecha = new Date().toISOString().split("T")[0];
  doc.save(`Invitados_${nombreArchivoBoda}_${fecha}.pdf`);
}
