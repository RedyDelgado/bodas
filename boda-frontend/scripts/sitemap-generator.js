/**
 * sitemap-generator.js
 * Genera sitemaps XML para SEO
 * Ejecutar con: npm run generate:sitemap
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://miwebdebodas.com';

// Rutas estáticas principales
const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/planes', priority: 0.9, changefreq: 'weekly' },
  { path: '/faqs', priority: 0.8, changefreq: 'monthly' },
  { path: '/auth/login', priority: 0.7, changefreq: 'monthly' },
  { path: '/auth/register', priority: 0.8, changefreq: 'monthly' },
  { path: '/plantillas', priority: 0.9, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'daily' },
  { path: '/blog/tips-bodas', priority: 0.7, changefreq: 'monthly' },
  { path: '/blog/tendencias-2025', priority: 0.7, changefreq: 'monthly' },
  { path: '/contacto', priority: 0.6, changefreq: 'monthly' },
  { path: '/politica-privacidad', priority: 0.5, changefreq: 'yearly' },
  { path: '/terminos-servicio', priority: 0.5, changefreq: 'yearly' },
];

// Plantillas de bodas (ejemplo)
const BODAS = [
  { id: 'boda-1', slug: 'juan-y-maria', priority: 0.8 },
  { id: 'boda-2', slug: 'carlos-y-laura', priority: 0.8 },
  { id: 'boda-3', slug: 'jose-y-ana', priority: 0.8 },
];

// Planes (ejemplo)
const PLANES = [
  { id: 1, slug: 'basico', priority: 0.7 },
  { id: 2, slug: 'intermedio', priority: 0.7 },
  { id: 3, slug: 'premium', priority: 0.7 },
];

// Preguntas Frecuentes (ejemplo)
const FAQS_ITEMS = [
  { id: 1, slug: 'como-crear-boda' },
  { id: 2, slug: 'opciones-pago' },
  { id: 3, slug: 'soporte-tecnico' },
  { id: 4, slug: 'personalizar-tema' },
  { id: 5, slug: 'administrar-invitados' },
];

/**
 * Generar XML del sitemap
 */
function generateSitemapXML(urls) {
  const urlEntries = urls
    .map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || 0.5}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${urlEntries}
</urlset>`;
}

/**
 * Generar sitemap principal
 */
function generateMainSitemap() {
  const urls = STATIC_ROUTES.map(route => ({
    loc: `${BASE_URL}${route.path}`,
    changefreq: route.changefreq,
    priority: route.priority,
  }));

  return generateSitemapXML(urls);
}

/**
 * Generar sitemap de bodas
 */
function generateWeddingsSitemap() {
  const urls = BODAS.map(boda => ({
    loc: `${BASE_URL}/bodas/${boda.slug}`,
    priority: boda.priority,
    changefreq: 'weekly',
  }));

  return generateSitemapXML(urls);
}

/**
 * Generar sitemap de planes
 */
function generatePlanesSitemap() {
  const urls = PLANES.map(plan => ({
    loc: `${BASE_URL}/planes/${plan.slug}`,
    priority: plan.priority,
    changefreq: 'monthly',
  }));

  return generateSitemapXML(urls);
}

/**
 * Generar sitemap de FAQs
 */
function generateFAQsSitemap() {
  const urls = FAQS_ITEMS.map(faq => ({
    loc: `${BASE_URL}/faqs/${faq.slug}`,
    priority: 0.6,
    changefreq: 'monthly',
  }));

  return generateSitemapXML(urls);
}

/**
 * Generar índice de sitemaps
 */
function generateSitemapIndex() {
  const sitemaps = [
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap-bodas.xml`,
    `${BASE_URL}/sitemap-planes.xml`,
    `${BASE_URL}/sitemap-faqs.xml`,
  ];

  const sitemapEntries = sitemaps
    .map(sitemap => `
  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Generar todos los sitemaps
 */
function generateAllSitemaps() {
  const sitemaps = {
    'sitemap.xml': generateMainSitemap(),
    'sitemap-bodas.xml': generateWeddingsSitemap(),
    'sitemap-planes.xml': generatePlanesSitemap(),
    'sitemap-faqs.xml': generateFAQsSitemap(),
    'sitemap-index.xml': generateSitemapIndex(),
  };

  // Crear carpeta si no existe
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Guardar archivos
  Object.entries(sitemaps).forEach(([filename, content]) => {
    const filepath = path.join(publicDir, filename);
    fs.writeFileSync(filepath, content);
    console.log(`✅ Generado: ${filename}`);
  });

  console.log('🎉 Todos los sitemaps han sido generados correctamente');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSitemaps();
}

export { generateAllSitemaps, generateMainSitemap, generateWeddingsSitemap };
