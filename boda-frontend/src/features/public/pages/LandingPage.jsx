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
    <div className="bg-gradient-to-b from-white to-slate-50">
      <section className="max-w-6xl mx-auto px-4 py-14">
        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
              SaaS para bodas • Hecho para vender más fácil
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Crea, comparte y gestiona tu web de boda en minutos
            </h1>
            <p className="mt-4 text-slate-600 text-sm md:text-base">
              Diseña tu página, envía invitaciones por WhatsApp, recibe RSVP en
              tiempo real y descarga tarjetas personalizadas. Todo en un solo lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/registro"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800"
              >
                Probar gratis
              </a>
              <a
                href="/demo-boda/clasica-azul-dorado"
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-white"
              >
                Ver demo
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">Sin código</span>
                <span> • Arrastra y suelta diseño</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900">RSVP real</span>
                <span> • Confirmaciones automáticas</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
              Plantillas que enamoran
            </p>
            {cargandoPlantillas ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500">
                Cargando plantillas...
              </div>
            ) : errorPlantillas ? (
              <div className="text-xs text-red-600">{errorPlantillas}</div>
            ) : plantillas.length === 0 ? (
              <div className="text-xs text-slate-500">Pronto verás plantillas aquí.</div>
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
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Invitaciones por WhatsApp",
              desc: "Genera enlaces y tarjetas listas para enviar.",
            },
            {
              title: "RSVP en tiempo real",
              desc: "Tus invitados confirman y ves todo al instante.",
            },
            {
              title: "Diseñador de tarjetas",
              desc: "Arrastra campos, elige fuentes y colores.",
            },
            {
              title: "Página pública de boda",
              desc: "Cuenta regresiva, ubicación y mensajes especiales.",
            },
            {
              title: "Descarga en ZIP",
              desc: "Lleva todas las tarjetas en un solo click.",
            },
            {
              title: "Panel simple y potente",
              desc: "Todo lo importante en un solo lugar.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Crea tu cuenta",
              desc: "Accede y configura tu boda en minutos.",
            },
            {
              step: "2",
              title: "Diseña y genera",
              desc: "Sube tu plantilla, diseña y genera tarjetas.",
            },
            {
              step: "3",
              title: "Comparte y mide",
              desc: "Envía por WhatsApp y recibe confirmaciones.",
            },
          ].map((s) => (
            <div key={s.step} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mb-2">
                {s.step}
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Precios */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-xl font-bold text-slate-900">Planes</h2>
          <p className="text-xs text-slate-500">Elige el plan que mejor se adapte.</p>
        </div>

        {cargandoPlanes ? (
          <p className="text-sm text-slate-500">Cargando planes...</p>
        ) : errorPlanes ? (
          <p className="text-sm text-red-600">{errorPlanes}</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {(planes && planes.length > 0 ? planes : [
              { id: 1, slug: "Básico", nombre: "Básico", descripcion: "Todo para empezar", limiteInvitados: 150, limiteBodas: 1, precioMensual: 0, precioAnual: 0, destacado: false },
              { id: 2, slug: "Pro", nombre: "Pro", descripcion: "Más invitados y extras", limiteInvitados: 500, limiteBodas: 2, precioMensual: 12, precioAnual: 99, destacado: true },
              { id: 3, slug: "Premium", nombre: "Premium", descripcion: "Para wedding planners", limiteInvitados: 2000, limiteBodas: 9999, precioMensual: 29, precioAnual: 249, destacado: false },
            ]).map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 bg-white shadow-sm ${plan.destacado ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200"}`}
              >
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">{plan.slug}</p>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.nombre}</h3>
                <p className="text-sm text-slate-600 mb-4">{plan.descripcion}</p>
                <div className="mb-4 space-y-1 text-sm">
                  <p className="text-slate-800">Invitados: <span className="font-semibold">hasta {plan.limiteInvitados}</span></p>
                  <p className="text-slate-800">Bodas por cuenta: <span className="font-semibold">{plan.limiteBodas === 9999 ? "ilimitadas" : plan.limiteBodas}</span></p>
                </div>
                <div className="text-sm text-slate-900 mb-3">
                  {plan.precioMensual === 0 ? (
                    <span className="font-semibold">Gratis</span>
                  ) : (
                    <>
                      <span className="font-semibold">${plan.precioMensual}/mes</span>{" "}
                      <span className="text-xs text-slate-500">o ${plan.precioAnual}/año</span>
                    </>
                  )}
                </div>
                <a href="/registro" className="w-full inline-flex items-center justify-center py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800">
                  Empezar
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQs */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-xl font-bold text-slate-900">Preguntas frecuentes</h2>
          <p className="text-xs text-slate-500">Todo lo que necesitas saber.</p>
        </div>
        {cargandoFaqs ? (
          <p className="text-sm text-slate-500">Cargando FAQs...</p>
        ) : errorFaqs ? (
          <p className="text-sm text-red-600">{errorFaqs}</p>
        ) : (
          <div className="space-y-2">
            {(faqs?.slice()?.sort((a, b) => a.orden - b.orden) || []).map((faq) => (
              <details key={faq.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                <summary className="text-sm font-medium text-slate-800 cursor-pointer">{faq.pregunta}</summary>
                <p className="mt-2 text-sm text-slate-600">{faq.respuesta}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Empieza hoy tu web de boda</h3>
            <p className="text-sm text-slate-200">Crea una experiencia inolvidable para tus invitados.</p>
          </div>
          <div className="flex gap-3">
            <a href="/registro" className="px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold">Crear cuenta</a>
            <a href="/demo-boda/clasica-azul-dorado" className="px-4 py-2 rounded-lg border border-white/40 text-sm">Ver demo</a>
          </div>
        </div>
      </section>
    </div>
  );
}
