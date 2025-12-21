/**
 * SEOHelmet Component
 * Maneja dinámicamente los meta tags de SEO para cada página
 * Útil para React + SPA con enrutamiento del lado del cliente
 */

export const updateSEO = ({
  title = 'MiWebDeBodas - Tu Sitio Web de Bodas Online',
  description = 'Plataforma completa para crear y compartir tu boda online',
  keywords = 'bodas, sitio web boda, invitaciones digitales',
  ogImage = 'https://miwebdebodas.com/og-image.png',
  ogUrl = 'https://miwebdebodas.com/',
  canonicalUrl = 'https://miwebdebodas.com/',
  author = 'MiWebDeBodas',
  articlePublishedTime = null,
  articleModifiedTime = null,
  schemaData = null,
} = {}) => {
  // Actualizar título
  document.title = title;

  // Actualizar meta tags generales
  updateMetaTag('description', description);
  updateMetaTag('keywords', keywords);
  updateMetaTag('author', author);

  // Actualizar Open Graph
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('og:image', ogImage, 'property');
  updateMetaTag('og:url', ogUrl, 'property');

  // Actualizar Twitter Card
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', ogImage);

  // Actualizar Article meta tags (si aplica)
  if (articlePublishedTime) {
    updateMetaTag('article:published_time', articlePublishedTime, 'property');
  }
  if (articleModifiedTime) {
    updateMetaTag('article:modified_time', articleModifiedTime, 'property');
  }

  // Actualizar Canonical URL
  updateCanonicalUrl(canonicalUrl);

  // Actualizar Schema.org JSON-LD
  if (schemaData) {
    updateJSONSchema(schemaData);
  }
};

/**
 * Actualizar o crear un meta tag
 */
const updateMetaTag = (name, content, attribute = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
};

/**
 * Actualizar URL canónica
 */
const updateCanonicalUrl = (url) => {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = url;
};

/**
 * Actualizar JSON-LD Schema
 */
const updateJSONSchema = (data) => {
  let scriptElement = document.querySelector('script[type="application/ld+json"]');

  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  scriptElement.textContent = JSON.stringify(data);
};

/**
 * Esquemas JSON-LD predefinidos
 */
export const SCHEMA_TYPES = {
  ORGANIZATION: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MiWebDeBodas",
    "url": "https://miwebdebodas.com",
    "logo": "https://miwebdebodas.com/logo.png",
    "description": "Plataforma completa para crear y compartir tu boda online",
    "sameAs": [
      "https://www.facebook.com/miwebdebodas",
      "https://www.instagram.com/miwebdebodas",
      "https://www.twitter.com/miwebdebodas"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-XXX-XXXXXX",
      "contactType": "Customer Service"
    }
  },

  WEBSITE: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MiWebDeBodas",
    "url": "https://miwebdebodas.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://miwebdebodas.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  },

  BREADCRUMB: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),

  LOCAL_BUSINESS: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "MiWebDeBodas",
    "image": "https://miwebdebodas.com/logo.png",
    "url": "https://miwebdebodas.com",
    "telephone": "+34-XXX-XXXXXX",
    "priceRange": "$$",
    "description": "Plataforma de bodas online",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal, 123",
      "addressLocality": "Madrid",
      "postalCode": "28001",
      "addressCountry": "ES"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "250"
    }
  },

  PRODUCT_PLAN: (plan) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": plan.name,
    "description": plan.description,
    "image": plan.image,
    "brand": {
      "@type": "Brand",
      "name": "MiWebDeBodas"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://miwebdebodas.com/planes/${plan.id}`,
      "priceCurrency": "EUR",
      "price": plan.price,
      "priceValidUntil": plan.validUntil || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "MiWebDeBodas"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "100"
    }
  }),

  FAQ: (faqs) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  })
};
