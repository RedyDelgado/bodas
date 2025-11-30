// src/features/bodas/pages/BodaConfigPage.jsx
import React, { useEffect, useState } from "react";
import { useMiBodaActual } from "../hooks/useBodas";
import { useConfiguracionBoda } from "../hooks/useConfiguracionBoda";

export function BodaConfigPage() {
  const {
    boda,
    cargando: cargandoBoda,
    error: errorBoda,
  } = useMiBodaActual();

  const bodaId = boda?.id ?? null;

  const {
    config,
    cargando,
    guardando,
    error,
    mensajeOk,
    guardar,
  } = useConfiguracionBoda(bodaId);

  const [form, setForm] = useState({
    frasePrincipal: "",
    textoFechaReligioso: "",
    textoFechaCivil: "",
    cronogramaTexto: "",
    localReligioso: "",
    localRecepcion: "",
    textoCuentasBancarias: "",
    textoYape: "",
    textoHistoriaPareja: "",
    textoMensajeFinal: "",
  });

  useEffect(() => {
    if (config) {
      setForm({
        frasePrincipal: config.frasePrincipal,
        textoFechaReligioso: config.textoFechaReligioso,
        textoFechaCivil: config.textoFechaCivil,
        cronogramaTexto: config.cronogramaTexto,
        localReligioso: config.localReligioso,
        localRecepcion: config.localRecepcion,
        textoCuentasBancarias: config.textoCuentasBancarias,
        textoYape: config.textoYape,
        textoHistoriaPareja: config.textoHistoriaPareja,
        textoMensajeFinal: config.textoMensajeFinal,
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bodaId) return;
    await guardar({ ...(config || {}), ...form });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Configuración de mi boda
          </h1>
          <p className="text-xs text-slate-500">
            Edita los textos principales, lugares y mensajes que se usan en la
            web pública de tu boda.
          </p>
        </div>
        {boda && (
          <div className="text-right text-xs text-slate-500">
            <p>
              Boda:{" "}
              <span className="font-semibold text-slate-800">
                {boda.titulo}
              </span>
            </p>
            <p>
              Subdominio:{" "}
              <span className="font-mono text-slate-800">
                {boda.subdominio}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Estado de carga */}
      {cargandoBoda && (
        <p className="text-sm text-slate-500">
          Cargando datos de la boda...
        </p>
      )}
      {errorBoda && (
        <p className="text-sm text-red-600">{errorBoda}</p>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 text-sm"
      >
        {(cargando && !config) && (
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

        {/* Bloque: Portada */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Portada y mensaje principal
          </h2>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Frase principal en la portada
            </label>
            <input
              type="text"
              name="frasePrincipal"
              value={form.frasePrincipal}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="Ej: Un día para celebrar el amor"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Texto fecha ceremonia religiosa
              </label>
              <input
                type="text"
                name="textoFechaReligioso"
                value={form.textoFechaReligioso}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Ej: 15/08/2026 - 4:00 p. m. Parroquia ..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Texto fecha ceremonia civil
              </label>
              <input
                type="text"
                name="textoFechaCivil"
                value={form.textoFechaCivil}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Ej: 16/08/2026 - 11:00 a. m. Municipalidad ..."
              />
            </div>
          </div>
        </section>

        {/* Bloque: Lugares y cronograma */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Lugares y cronograma
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Local religioso
              </label>
              <input
                type="text"
                name="localReligioso"
                value={form.localReligioso}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Local de recepción
              </label>
              <input
                type="text"
                name="localRecepcion"
                value={form.localRecepcion}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Cronograma (texto libre)
            </label>
            <textarea
              name="cronogramaTexto"
              rows={3}
              value={form.cronogramaTexto}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder={`Ej:\n• Recepción de invitados\n• Ceremonia\n• Brindis\n• Baile de los novios`}
            />
          </div>
        </section>

        {/* Bloque: regalos y cuentas */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Regalos y cuentas
          </h2>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Cuentas bancarias / CCI
            </label>
            <textarea
              name="textoCuentasBancarias"
              rows={3}
              value={form.textoCuentasBancarias}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder={`Ej:\nBCP: xxxx-xxxx-xxxx-xx\nCCI: 002-xxxxxxxxxxxxxxx`}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Texto para Yape / Plin
            </label>
            <textarea
              name="textoYape"
              rows={2}
              value={form.textoYape}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="Ej: Yape al número 999 999 999 a nombre de ..."
            />
          </div>
        </section>

        {/* Bloque: historia y mensaje final */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Historia y mensaje final
          </h2>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Historia de la pareja
            </label>
            <textarea
              name="textoHistoriaPareja"
              rows={4}
              value={form.textoHistoriaPareja}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="Cuenta brevemente cómo se conocieron, momentos especiales, etc."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600">
              Mensaje final para los invitados
            </label>
            <textarea
              name="textoMensajeFinal"
              rows={2}
              value={form.textoMensajeFinal}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="Ej: Gracias por acompañarnos en este día tan especial."
            />
          </div>
        </section>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
