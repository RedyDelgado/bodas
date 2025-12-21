# 🚀 GUÍA DE IMPLEMENTACIÓN SEO - PASO A PASO

## ✅ Checklist de Implementación

### Fase 1: Configuración Inicial (Hoy)

#### 1.1 Meta Tags en HTML
- [x] Actualizar `index.html` con:
  - [x] Lang="es"
  - [x] Meta description principal
  - [x] Meta keywords
  - [x] Open Graph tags
  - [x] Twitter Card tags
  - [x] Canonical URL
  - [x] Alternate hreflang

**Archivo**: `boda-frontend/index.html`

#### 1.2 Archivos de Configuración
- [x] Crear `.htaccess` con redirects y caché
- [x] Crear `robots.txt` con directivas de rastreo
- [x] Crear sitemap generator script

**Archivos creados**:
- `.htaccess`
- `boda-frontend/public/robots.txt`
- `boda-frontend/scripts/sitemap-generator.js`

#### 1.3 Componentes React
- [x] Crear `SEOHelmet.jsx` - Component para manejar meta tags dinámicos
- [x] Crear ejemplos de uso en `SEO_EXAMPLES.jsx`

**Archivos creados**:
- `boda-frontend/src/shared/components/SEOHelmet.jsx`
- `boda-frontend/src/shared/components/SEO_EXAMPLES.jsx`

---

### Fase 2: Integración en Componentes (Esta Semana)

#### 2.1 Página de Inicio
Aplicar en `src/features/public/HomePage.jsx`:

```javascript
import { useEffect } from 'react';
import { updateSEO, SCHEMA_TYPES } from '@shared/components/SEOHelmet';

export function HomePage() {
  useEffect(() => {
    updateSEO({
      title: 'MiWebDeBodas - Crea tu Sitio Web de Bodas Personalizado',
      description: 'Plataforma líder para crear sitios web de bodas online...',
      canonicalUrl: 'https://miwebdebodas.com/',
      schemaData: SCHEMA_TYPES.ORGANIZATION,
    });
  }, []);
  
  return (/* contenido */);
}
```

#### 2.2 Página de Planes
Aplicar en `src/features/planes/PlanesPage.jsx`:

```javascript
useEffect(() => {
  updateSEO({
    title: 'Planes y Precios - MiWebDeBodas',
    description: 'Elige el plan perfecto para tu boda...',
    canonicalUrl: 'https://miwebdebodas.com/planes',
  });
}, []);
```

#### 2.3 Página de FAQs
Aplicar en `src/features/faqs/FAQsPage.jsx`:

```javascript
useEffect(() => {
  updateSEO({
    title: 'Preguntas Frecuentes - MiWebDeBodas',
    description: 'Encuentra respuestas a las preguntas más comunes...',
    canonicalUrl: 'https://miwebdebodas.com/faqs',
    schemaData: SCHEMA_TYPES.FAQ(faqsArray),
  });
}, [faqsArray]);
```

#### 2.4 Página de Bodas (Dinámicas)
Aplicar en `src/features/bodas/BodasDetailPage.jsx`:

```javascript
useEffect(() => {
  if (boda) {
    updateSEO({
      title: `Boda de ${boda.novios.nombre1} y ${boda.novios.nombre2}`,
      description: `${boda.descripcion}...`,
      canonicalUrl: `https://miwebdebodas.com/bodas/${boda.slug}`,
      ogImage: `https://miwebdebodas.com/bodas/${boda.slug}/portada.jpg`,
      schemaData: {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": `Boda de ${boda.novios.nombre1} y ${boda.novios.nombre2}`,
        // ... más datos
      },
    });
  }
}, [boda]);
```

#### 2.5 Página de Blog
Aplicar en `src/features/blog/BlogArticlePage.jsx`:

```javascript
useEffect(() => {
  updateSEO({
    title: `${article.title} - Blog MiWebDeBodas`,
    description: article.description,
    canonicalUrl: `https://miwebdebodas.com/blog/${article.slug}`,
    articlePublishedTime: article.publishedDate,
    articleModifiedTime: article.modifiedDate,
    schemaData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      // ... más datos
    },
  });
}, [article]);
```

---

### Fase 3: Herramientas Externas (Esta Semana)

#### 3.1 Google Search Console
1. Ir a https://search.google.com/search-console
2. Agregar propiedad: `https://miwebdebodas.com`
3. Verificar sitio (DNS, meta tag, o archivo HTML)
4. Enviar sitemap: `/sitemap.xml`
5. Revisar Coverage para errores

#### 3.2 Google Analytics 4
1. Ir a https://analytics.google.com
2. Crear propiedad para miwebdebodas.com
3. Agregar código de seguimiento en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### 3.3 Google My Business
1. Ir a https://business.google.com
2. Verificar o crear negocio local
3. Agregar:
   - Categoría: "Sitio web"
   - Ubicación (si aplica)
   - Horarios
   - Fotos
   - Descripción completa

#### 3.4 Verificación de Sitio
Reemplazar en `index.html` línea que dice `AGREGAR_TU_CODIGO_AQUI`:

```html
<meta name="google-site-verification" content="Tu_Codigo_Aqui" />
```

---

### Fase 4: Contenido Optimizado (Próximas 2 Semanas)

#### 4.1 Crear Blog con Artículos SEO

**Carpeta**: `boda-frontend/src/features/blog/posts/`

Crear archivos markdown o contenido:

**Artículo 1**: "10 Tips para Bodas Perfectas"
- Palabras: 1500+
- Palabras clave: "tips bodas", "planificar boda"
- Estructura: Intro + 10 tips numerados + CTA

**Artículo 2**: "Tendencias Bodas 2025"
- Palabras: 1800+
- Palabras clave: "tendencias bodas 2025", "bodas modernas"
- Estructura: Intro + 6-8 tendencias + conclusión

**Artículo 3**: "Guía Completa: Cómo Usar MiWebDeBodas"
- Palabras: 2500+
- Palabras clave: "usar MiWebDeBodas", "crear boda online"
- Estructura: Paso a paso con imágenes

#### 4.2 Optimizar FAQs
Aplicar schema FAQPage (ya implementado):

```javascript
schemaData: SCHEMA_TYPES.FAQ([
  { question: "¿Cómo creo mi boda?", answer: "..." },
  { question: "¿Cuánto cuesta?", answer: "..." },
  // ... más FAQs
])
```

#### 4.3 Crear Bodas de Ejemplo
Crear 3-5 bodas de ejemplo con:
- Títulos optimizados
- Descripciones con palabras clave
- Galerías de fotos reales
- Schema Event JSON-LD

---

### Fase 5: Optimización Técnica (Semana 3-4)

#### 5.1 Generar Sitemaps
Ejecutar en terminal:

```bash
cd boda-frontend
npm install -g node  # Si no lo tienes
node scripts/sitemap-generator.js
```

Esto crea:
- `/public/sitemap.xml`
- `/public/sitemap-bodas.xml`
- `/public/sitemap-faqs.xml`
- `/public/sitemap-index.xml`

#### 5.2 Optimizar Imágenes
Para cada imagen en bodas y blog:

```html
<picture>
  <source 
    srcset="imagen-320w.webp 320w, imagen-640w.webp 640w, imagen-1280w.webp 1280w"
    type="image/webp"
  />
  <img 
    src="imagen.jpg" 
    alt="Descripción optimizada con palabras clave"
    loading="lazy"
    width="800"
    height="600"
  />
</picture>
```

#### 5.3 Minificar y Comprimir
En `vite.config.js`, asegurar minificación:

```javascript
export default {
  build: {
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
  }
}
```

#### 5.4 Performance
Instalar lighthouse:

```bash
npm install -D lighthouse
npx lighthouse https://miwebdebodas.com --view
```

Target: 90+ en todas las categorías

---

### Fase 6: Backlinks y Autoridad (Semana 4-5)

#### 6.1 Directorios Locales
- [ ] Google My Business - Verificar
- [ ] Yelp - Crear negocio
- [ ] Directorios bodas españoles:
  - matrimonio.com.es
  - unvestido.com
  - bodas.net
  - matrimonios.com.mx

#### 6.2 Guest Posts
Contactar blogs:
- Blogs de bodas populares
- Revistas digitales
- Influencers en bodas

Template de email:
```
Asunto: Colaboración - Artículo Invitado sobre Bodas

Hola [Nombre],

Soy [Tu Nombre] de MiWebDeBodas. Propongo escribir un artículo exclusivo 
sobre "Cómo Planificar una Boda Online en 2025" para tu blog.

El artículo incluiría:
- Contenido único y de valor
- Link natural a MiWebDeBodas
- Palabras clave estratégicas

¿Te interesa colaborar?

Saludos,
[Tu nombre]
```

#### 6.3 Social Media
- [ ] Crear perfil Instagram @miwebdebodas
- [ ] Crear perfil Facebook
- [ ] Crear perfil TikTok (videos bodas)
- [ ] Compartir posts regularmente (3x por semana)
- [ ] Hashtags: #BodasOnline #MiWebDeBodas #WebBodas

---

### Fase 7: Monitoreo Continuo (Mensual)

#### 7.1 Dashboard de Seguimiento
Crear en Google Sheets:

| KPI | Baseline | Mes 1 | Mes 2 | Meta |
|-----|----------|-------|-------|------|
| Sesiones Orgánicas | - | ? | ? | 5,000+ |
| Ranking Palabra Clave | - | ? | ? | Top 3 |
| Conversiones | - | ? | ? | 100+ |
| Core Web Vitals | - | ? | ? | A+ |

#### 7.2 Auditoría Mensual
Tareas para hacer cada mes:

1. Revisar Google Search Console:
   - Nuevas keywords
   - Clics vs impresiones
   - Posiciones promedio

2. Revisar Google Analytics:
   - Tráfico por fuente
   - Páginas más visitadas
   - Tasa de conversión

3. Auditoría técnica:
   - Errores 404
   - Links rotos
   - Velocidad de carga

4. Crear contenido nuevo:
   - 1-2 posts de blog
   - Actualizar FAQs
   - Crear boda de ejemplo

#### 7.3 Reportes
Crear plantilla de reporte mensual:

```markdown
# Reporte SEO - [MES]

## Resumen
- Sesiones Orgánicas: [número] ([+% vs mes anterior])
- Posición Promedio: [número]
- CTR Promedio: [%]
- Conversiones: [número]

## Top Páginas
1. [página] - [sesiones] sesiones
2. [página] - [sesiones] sesiones
3. [página] - [sesiones] sesiones

## Top Keywords
1. [keyword] - Posición [X]
2. [keyword] - Posición [X]
3. [keyword] - Posición [X]

## Problemas Identificados
- [Problema 1]
- [Problema 2]

## Acciones del Próximo Mes
- [ ] Acción 1
- [ ] Acción 2
```

---

## 📝 Checklist Final

Antes de considerar completa la Fase 1:

- [ ] Meta tags en index.html actualizados
- [ ] .htaccess creado
- [ ] robots.txt en public/
- [ ] SEOHelmet.jsx funcionando
- [ ] Google Search Console verificado
- [ ] Google Analytics instalado
- [ ] Sitemap generado
- [ ] Estructura de URLs amigable
- [ ] Homepage optimizada

---

## 🔗 Enlaces Útiles

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [Google My Business](https://business.google.com)
- [Schema.org](https://schema.org)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Semrush SEO Audit](https://www.semrush.com)

---

**Inicio**: 20 de Diciembre de 2025
**Target Completion Fase 1**: 22 de Diciembre
**Target Completion Todas las Fases**: 31 de Enero de 2026

---

*Documento activo: Actualizar según progreso*
