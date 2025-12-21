/**
 * EJEMPLOS DE USO DEL COMPONENTE SEO
 * Implementar en cada página/componente principal
 */

import { useEffect } from 'react';
import { updateSEO, SCHEMA_TYPES } from '@shared/components/SEOHelmet';

// ============================================
// EJEMPLO 1: Página de Inicio
// ============================================
export function HomePage() {
  useEffect(() => {
    updateSEO({
      title: 'MiWebDeBodas - Crea tu Sitio Web de Bodas Personalizado',
      description: 'Plataforma líder para crear sitios web de bodas online. Gestiona invitados, RSVP, galerías de fotos y más. ¡Comienza tu boda digital hoy!',
      keywords: 'bodas online, sitio web boda, crear página boda, invitaciones digitales',
      ogUrl: 'https://miwebdebodas.com/',
      canonicalUrl: 'https://miwebdebodas.com/',
      schemaData: SCHEMA_TYPES.ORGANIZATION,
    });
  }, []);

  return (
    <div>
      <h1>Crea tu Sitio Web de Bodas en Minutos</h1>
      {/* Contenido */}
    </div>
  );
}

// ============================================
// EJEMPLO 2: Página de Planes
// ============================================
export function PlanesPage() {
  useEffect(() => {
    updateSEO({
      title: 'Planes y Precios - MiWebDeBodas',
      description: 'Elige el plan perfecto para tu boda. Desde básico hasta premium con todas las características. Transparencia en precios, sin sorpresas.',
      keywords: 'planes bodas, precios bodas online, elegir plan boda, características planes',
      ogUrl: 'https://miwebdebodas.com/planes',
      canonicalUrl: 'https://miwebdebodas.com/planes',
      schemaData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Planes y Precios",
        "description": "Todos nuestros planes disponibles",
        "url": "https://miwebdebodas.com/planes"
      },
    });
  }, []);

  const planes = [
    {
      id: 1,
      name: 'Plan Básico',
      price: '29',
      image: 'https://miwebdebodas.com/plan-basico.png',
      description: 'Perfecto para empezar',
      validUntil: '2026-12-31'
    },
    {
      id: 2,
      name: 'Plan Intermedio',
      price: '59',
      image: 'https://miwebdebodas.com/plan-intermedio.png',
      description: 'Más características',
      validUntil: '2026-12-31'
    },
    {
      id: 3,
      name: 'Plan Premium',
      price: '99',
      image: 'https://miwebdebodas.com/plan-premium.png',
      description: 'Todo lo que necesitas',
      validUntil: '2026-12-31'
    },
  ];

  return (
    <div>
      <h1>Nuestros Planes</h1>
      <div className="planes-grid">
        {planes.map(plan => (
          <article key={plan.id} itemScope itemType="https://schema.org/Product">
            <h2 itemProp="name">{plan.name}</h2>
            <p itemProp="description">{plan.description}</p>
            <span itemProp="price">${plan.price}</span>
            {/* CTA */}
          </article>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 3: Página de Bodas Individualizada
// ============================================
export function BodasDetailPage({ params }) {
  const { slug } = params;
  // Obtener datos de la boda
  const boda = {
    id: 1,
    nombre: 'Juan y María',
    slug: 'juan-y-maria',
    fecha: '2025-06-15',
    descripcion: 'Una hermosa boda en la playa de Barcelona',
    novios: {
      nombre1: 'Juan García',
      nombre2: 'María López'
    },
    fotos: ['foto1.jpg', 'foto2.jpg'],
  };

  useEffect(() => {
    updateSEO({
      title: `Boda de ${boda.novios.nombre1} y ${boda.novios.nombre2} - MiWebDeBodas`,
      description: `${boda.descripcion}. Mira las fotos de la boda de ${boda.novios.nombre1} y ${boda.novios.nombre2}. Creada con MiWebDeBodas.`,
      keywords: `boda ${boda.novios.nombre1}, boda ${boda.novios.nombre2}, fotos boda, boda 2025`,
      ogUrl: `https://miwebdebodas.com/bodas/${slug}`,
      canonicalUrl: `https://miwebdebodas.com/bodas/${slug}`,
      ogImage: `https://miwebdebodas.com/bodas/${slug}/portada.jpg`,
      schemaData: {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": `Boda de ${boda.novios.nombre1} y ${boda.novios.nombre2}`,
        "description": boda.descripcion,
        "startDate": boda.fecha,
        "image": boda.fotos[0],
        "attendees": [
          {
            "@type": "Person",
            "name": boda.novios.nombre1
          },
          {
            "@type": "Person",
            "name": boda.novios.nombre2
          }
        ]
      },
    });
  }, [slug, boda]);

  return (
    <article itemScope itemType="https://schema.org/Event">
      <h1 itemProp="name">Boda de {boda.novios.nombre1} y {boda.novios.nombre2}</h1>
      <p itemProp="description">{boda.descripcion}</p>
      <time itemProp="startDate" dateTime={boda.fecha}>{boda.fecha}</time>
      {/* Galería de fotos */}
    </article>
  );
}

// ============================================
// EJEMPLO 4: Página de FAQs
// ============================================
export function FAQsPage() {
  const faqs = [
    {
      id: 1,
      question: '¿Cómo creo mi sitio web de boda?',
      answer: 'Es muy sencillo. Regístrate, elige una plantilla, personalizala y ¡listo! Tu sitio estará online en minutos.'
    },
    {
      id: 2,
      question: '¿Cuánto cuesta?',
      answer: 'Tenemos planes desde $29/mes. Sin comisiones ocultas, sin sorpresas.'
    },
    {
      id: 3,
      question: '¿Puedo personalizar completamente mi boda?',
      answer: 'Sí, completamente. Colores, fuentes, layout, todo lo que necesites personalizar está disponible.'
    },
  ];

  useEffect(() => {
    updateSEO({
      title: 'Preguntas Frecuentes - MiWebDeBodas',
      description: 'Encuentra respuestas a las preguntas más comunes sobre cómo crear tu sitio web de bodas con MiWebDeBodas.',
      keywords: 'preguntas frecuentes bodas, FAQ bodas online, cómo usar MiWebDeBodas',
      ogUrl: 'https://miwebdebodas.com/faqs',
      canonicalUrl: 'https://miwebdebodas.com/faqs',
      schemaData: SCHEMA_TYPES.FAQ(faqs),
    });
  }, []);

  return (
    <div>
      <h1>Preguntas Frecuentes</h1>
      <div className="faqs">
        {faqs.map(faq => (
          <details key={faq.id}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 5: Página de Blog
// ============================================
export function BlogArticlePage({ params }) {
  const { slug } = params;
  const article = {
    id: 1,
    title: '10 Tips para Planificar tu Boda Perfecta',
    slug: '10-tips-boda-perfecta',
    description: 'Descubre los mejores tips para planificar una boda perfecta en 2025',
    author: 'María García',
    publishedDate: '2025-12-15',
    modifiedDate: '2025-12-18',
    content: '...',
    image: 'https://miwebdebodas.com/blog/tips-boda.jpg',
  };

  useEffect(() => {
    updateSEO({
      title: `${article.title} - Blog MiWebDeBodas`,
      description: article.description,
      keywords: 'tips bodas, planificar boda, bodas 2025, consejos boda',
      ogUrl: `https://miwebdebodas.com/blog/${slug}`,
      canonicalUrl: `https://miwebdebodas.com/blog/${slug}`,
      ogImage: article.image,
      articlePublishedTime: article.publishedDate,
      articleModifiedTime: article.modifiedDate,
      schemaData: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.description,
        "image": article.image,
        "datePublished": article.publishedDate,
        "dateModified": article.modifiedDate,
        "author": {
          "@type": "Person",
          "name": article.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "MiWebDeBodas",
          "logo": {
            "@type": "ImageObject",
            "url": "https://miwebdebodas.com/logo.png"
          }
        }
      },
    });
  }, [slug, article]);

  return (
    <article itemScope itemType="https://schema.org/BlogPosting">
      <h1 itemProp="headline">{article.title}</h1>
      <meta itemProp="datePublished" content={article.publishedDate} />
      <meta itemProp="dateModified" content={article.modifiedDate} />
      <time dateTime={article.publishedDate}>{article.publishedDate}</time>
      <span itemProp="author">{article.author}</span>
      {/* Contenido del artículo */}
    </article>
  );
}

// ============================================
// EJEMPLO 6: Página de Plantillas
// ============================================
export function PlantillasPage() {
  const plantillas = [
    {
      id: 1,
      nombre: 'Clásica Elegante',
      slug: 'clasica-elegante',
      descripcion: 'Diseño clásico y elegante para bodas tradicionales',
      preview: 'https://miwebdebodas.com/plantillas/clasica.jpg',
    },
    {
      id: 2,
      nombre: 'Moderna Minimalista',
      slug: 'moderna-minimalista',
      descripcion: 'Diseño moderno y limpio para bodas contemporáneas',
      preview: 'https://miwebdebodas.com/plantillas/moderna.jpg',
    },
  ];

  useEffect(() => {
    updateSEO({
      title: 'Plantillas de Bodas Profesionales - MiWebDeBodas',
      description: 'Elige entre nuestras plantillas de bodas profesionales. Diseños modernos y elegantes, completamente personalizables.',
      keywords: 'plantillas bodas, temas bodas, diseños bodas, plantillas web boda',
      ogUrl: 'https://miwebdebodas.com/plantillas',
      canonicalUrl: 'https://miwebdebodas.com/plantillas',
    });
  }, []);

  return (
    <div>
      <h1>Nuestras Plantillas</h1>
      <div className="plantillas-grid">
        {plantillas.map(plantilla => (
          <article key={plantilla.id} itemScope itemType="https://schema.org/CreativeWork">
            <h2 itemProp="name">{plantilla.nombre}</h2>
            <p itemProp="description">{plantilla.descripcion}</p>
            <img 
              src={plantilla.preview} 
              alt={plantilla.nombre}
              itemProp="image"
            />
          </article>
        ))}
      </div>
    </div>
  );
}

// ============================================
// UTILS: Breadcrumb SEO
// ============================================
export function BreadcrumbSEO({ items }) {
  useEffect(() => {
    updateSEO({
      schemaData: SCHEMA_TYPES.BREADCRUMB(items),
    });
  }, [items]);

  return (
    <nav aria-label="breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
      <ol>
        {items.map((item, index) => (
          <li key={index} itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <a itemProp="item" href={item.url}>
              <span itemProp="name">{item.name}</span>
            </a>
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
