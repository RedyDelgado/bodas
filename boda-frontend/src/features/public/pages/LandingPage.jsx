// src/features/public/pages/LandingPage.jsx
import React from "react";
import { usePlanes } from "../../planes/hooks/usePlanes";
import { usePlantillas } from "../../plantillas/hooks/usePlantillas";
import { useFaqs } from "../../faqs/hooks/useFaqs";

export function LandingPage() {
  const { planes, cargando: cargandoPlanes, error: errorPlanes } = usePlanes();
  const {
    plantillas,
    cargando: cargandoPlantillas,
    error: errorPlantillas,
  } = usePlantillas();
  const { faqs, cargando: cargandoFaqs, error: errorFaqs } = useFaqs();

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Crea la web perfecta para tu boda 💍
          </h1>
          <p className="text-slate-600 mb-3 text-sm md:text-base">
            Administra invitaciones digitales, confirmación de asistencia,
            galería de fotos, ubicaciones y mensajes personalizados
            desde una sola plataforma pensada para bodas.
          </p>
          <p className="text-slate-600 mb-6 text-sm md:text-base">
            Esta es una <strong>vista de prueba (FASE 5)</strong> que usa datos
            simulados. Más adelante se conectará a la API real en Laravel.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/demo-boda/clasica-azul-dorado"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium"
            >
              Ver demo de boda
            </a>
            <a
              href="/login"
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700"
            >
              Iniciar sesión
            </a>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
            Vista previa de plantillas
          </p>
          {cargandoPlantillas ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-500">
              Cargando plantillas...
            </div>
          ) : errorPlantillas ? (
            <div className="text-xs text-red-600">{errorPlantillas}</div>
          ) : plantillas.length === 0 ? (
            <div className="text-xs text-slate-500">
              No hay plantillas registradas (FAKE).
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plantillas.map((plantilla) => (
                <div
                  key={plantilla.id}
                  className="border border-slate-200 rounded-xl p-3 text-xs bg-slate-50"
                >
                  <div className="h-16 mb-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-[11px] text-slate-600 text-center px-2">
                      {plantilla.nombre}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 mb-1">
                    {plantilla.nombre}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {plantilla.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de planes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900">
            Planes de la plataforma
          </h2>
          <p className="text-xs text-slate-500">
            Estos datos provienen del servicio fake de planes.
          </p>
        </div>

        {cargandoPlanes ? (
          <p className="text-sm text-slate-500">Cargando planes...</p>
        ) : errorPlanes ? (
          <p className="text-sm text-red-600">{errorPlanes}</p>
        ) : planes.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay planes configurados (FAKE).
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {planes.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 bg-white shadow-sm ${
                  plan.destacado
                    ? "border-slate-900 ring-1 ring-slate-900/10"
                    : "border-slate-200"
                }`}
              >
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  {plan.slug}
                </p>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {plan.nombre}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {plan.descripcion}
                </p>

                <div className="mb-4 space-y-1 text-sm">
                  <p className="text-slate-800">
                    Invitados:{" "}
                    <span className="font-semibold">
                      hasta {plan.limiteInvitados}
                    </span>
                  </p>
                  <p className="text-slate-800">
                    Bodas por cuenta:{" "}
                    <span className="font-semibold">
                      {plan.limiteBodas === 9999
                        ? "ilimitadas"
                        : plan.limiteBodas}
                    </span>
                  </p>
                </div>

                <div className="text-sm text-slate-900 mb-3">
                  {plan.precioMensual === 0 ? (
                    <span className="font-semibold">Gratis</span>
                  ) : (
                    <>
                      <span className="font-semibold">
                        ${plan.precioMensual}/mes
                      </span>{" "}
                      <span className="text-xs text-slate-500">
                        o ${plan.precioAnual}/año
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="w-full py-2 rounded-lg bg-slate-900 text-white text-xs font-medium"
                >
                  Empezar con este plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900">
            Preguntas frecuentes
          </h2>
          <p className="text-xs text-slate-500">
            Texto de ayuda para la landing.
          </p>
        </div>

        {cargandoFaqs ? (
          <p className="text-sm text-slate-500">Cargando FAQs...</p>
        ) : errorFaqs ? (
          <p className="text-sm text-red-600">{errorFaqs}</p>
        ) : faqs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay preguntas frecuentes configuradas (FAKE).
          </p>
        ) : (
          <div className="space-y-2">
            {faqs
              .slice()
              .sort((a, b) => a.orden - b.orden)
              .map((faq) => (
                <details
                  key={faq.id}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3"
                >
                  <summary className="text-sm font-medium text-slate-800 cursor-pointer">
                    {faq.pregunta}
                  </summary>
                  <p className="mt-2 text-sm text-slate-600">
                    {faq.respuesta}
                  </p>
                </details>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
