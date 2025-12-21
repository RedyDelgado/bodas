# 🎨 GUÍA DE MEJORES PRÁCTICAS SEO POR SECCIÓN

## Para tu Plataforma de Bodas

---

## 1️⃣ HOMEPAGE (Página Principal)

### Estructura Ideal
```html
<h1>Crea tu Sitio Web de Bodas Personalizado en Minutos</h1>

<section class="benefits">
  <h2>Por Qué Elegirnos</h2>
  <ul>
    <li>Plantillas profesionales diseñadas</li>
    <li>Gestión de invitados integrada</li>
    <li>Galerías de fotos ilimitadas</li>
    <li>RSVP automático en línea</li>
    <li>Completamente personalizable</li>
  </ul>
</section>

<section class="examples">
  <h2>Bodas Creadas con MiWebDeBodas</h2>
  <!-- 3-5 ejemplos visuales -->
</section>

<section class="pricing">
  <h2>Planes Desde $29/mes</h2>
  <!-- Tabla de planes -->
</section>

<section class="testimonials">
  <h2>Lo Que Dicen Nuestros Clientes</h2>
  <!-- 3-5 testimonios -->
</section>

<section class="cta">
  <h2>Crea Tu Boda Hoy</h2>
  <button>Comenzar Gratis</button>
</section>
```

### Meta Tags Específicos
```
Title: MiWebDeBodas - Crea tu Sitio Web de Bodas en Minutos
Description: Plataforma profesional para crear sitios web personalizados de bodas. 
Gestiona invitados, RSVP y fotos. ¡Comienza gratis!
Keywords: bodas online, crear boda, sitio web bodas, invitaciones
```

### Schema Recomendado
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MiWebDeBodas",
  "url": "https://miwebdebodas.com",
  "logo": "https://miwebdebodas.com/logo.png",
  "description": "Plataforma para crear sitios web de bodas",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "250"
  }
}
```

---

## 2️⃣ PÁGINA DE PLANES

### Estructura Ideal
```html
<h1>Elige el Plan Perfecto para Tu Boda</h1>

<p class="intro">
  Comparativa transparente de nuestros planes. Sin comisiones ocultas.
</p>

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Básico ($29/mes)</th>
      <th>Intermedio ($59/mes)</th>
      <th>Premium ($99/mes)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sitio web personalizado</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <!-- Más rows -->
  </tbody>
</table>

<section class="faqs">
  <h2>Preguntas sobre los Planes</h2>
  <!-- FAQs específicas -->
</section>
```

### Meta Tags
```
Title: Planes y Precios - MiWebDeBodas
Description: Compara nuestros planes: Básico, Intermedio y Premium. 
Transparencia total, sin sorpresas. Elige el tuyo hoy.
Keywords: planes bodas, precios bodas online, comparativa planes
```

### Schema Recomendado
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "MiWebDeBodas Premium",
  "description": "Plan premium con todas las características",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "99.00",
    "url": "https://miwebdebodas.com/planes/premium"
  }
}
```

---

## 3️⃣ PÁGINA DE BODAS INDIVIDUALES

### Estructura Ideal
```html
<article>
  <h1>Boda de Juan García y María López - 15 Junio 2025</h1>
  
  <figure>
    <img src="portada.jpg" alt="Portada boda Juan y María">
  </figure>
  
  <section class="info">
    <h2>Sobre Nuestra Boda</h2>
    <p>Una hermosa ceremonia en la playa de Barcelona...</p>
  </section>
  
  <section class="gallery">
    <h2>Galería de Fotos</h2>
    <!-- Grid de fotos con lazy loading -->
  </section>
  
  <section class="details">
    <h2>Detalles de la Boda</h2>
    <ul>
      <li>Fecha: 15 Junio 2025</li>
      <li>Ubicación: Barcelona, España</li>
      <li>Guests: 150 personas</li>
    </ul>
  </section>
  
  <section class="rsvp">
    <h2>Confirmar Asistencia</h2>
    <!-- Formulario RSVP -->
  </section>
</article>
```

### Meta Tags
```
Title: Boda de Juan y María - 15 Junio 2025
Description: Mira las fotos y detalles de la boda de Juan García y María López. 
Creada con MiWebDeBodas. Confirma tu asistencia aquí.
Keywords: boda Juan María, fotos boda, boda 2025, bodas Barcelona
```

### Schema Recomendado
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Boda de Juan García y María López",
  "startDate": "2025-06-15",
  "location": {
    "@type": "Place",
    "name": "Barcelona, España"
  },
  "image": "https://miwebdebodas.com/bodas/juan-maria/portada.jpg",
  "description": "Una hermosa boda en la playa de Barcelona",
  "organizer": {
    "@type": "Person",
    "name": "Juan García"
  },
  "attendees": [
    {"@type": "Person", "name": "Juan García"},
    {"@type": "Person", "name": "María López"}
  ]
}
```

---

## 4️⃣ PÁGINA DE FAQs

### Estructura Ideal
```html
<h1>Preguntas Frecuentes sobre MiWebDeBodas</h1>

<section class="faqs">
  <details open>
    <summary>¿Cómo creo mi sitio web de boda?</summary>
    <p>Es muy sencillo. Solo necesitas...</p>
  </details>
  
  <details>
    <summary>¿Cuánto cuesta?</summary>
    <p>Nuestros planes empiezan en...</p>
  </details>
  
  <!-- Más FAQs -->
</section>
```

### Meta Tags
```
Title: Preguntas Frecuentes - MiWebDeBodas
Description: Encuentra respuestas a las preguntas más comunes sobre cómo 
crear tu sitio web de bodas con MiWebDeBodas.
Keywords: FAQs bodas, preguntas frecuentes, cómo usar, soporte
```

### Schema Recomendado (CRÍTICO)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo creo mi sitio web de boda?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Es muy sencillo. Solo necesitas..."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nuestros planes empiezan en $29/mes"
      }
    }
  ]
}
```

---

## 5️⃣ PÁGINA DE BLOG/ARTÍCULOS

### Estructura Ideal por Artículo
```html
<article>
  <header>
    <h1>10 Tips Para Planificar Tu Boda Perfecta</h1>
    <p class="meta">
      Escrito por <span class="author">María García</span> 
      el <span class="date">15 Diciembre 2025</span>
    </p>
  </header>
  
  <figure>
    <img src="featured-image.jpg" alt="Boda perfecta">
  </figure>
  
  <div class="content">
    <h2>Introducción</h2>
    <p>Planificar una boda puede ser abrumador...</p>
    
    <h2>1. Establece un Presupuesto</h2>
    <p>Lo primero que debes hacer...</p>
    
    <h2>2. Elige una Fecha</h2>
    <p>Una vez tengas tu presupuesto...</p>
    
    <!-- Más tips... -->
    
    <h2>Conclusión</h2>
    <p>Con estos 10 tips...</p>
  </div>
  
  <aside class="related">
    <h3>Artículos Relacionados</h3>
    <!-- Links a otros posts -->
  </aside>
</article>
```

### Meta Tags
```
Title: 10 Tips Para Planificar Tu Boda Perfecta - Blog MiWebDeBodas
Description: Descubre 10 tips esenciales para planificar tu boda perfecta. 
Desde presupuesto hasta invitaciones. Guía completa 2025.
Keywords: tips bodas, planificar boda, consejos boda, checklist boda
```

### Schema Recomendado
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "10 Tips Para Planificar Tu Boda Perfecta",
  "datePublished": "2025-12-15",
  "dateModified": "2025-12-15",
  "author": {
    "@type": "Person",
    "name": "María García"
  },
  "image": "https://miwebdebodas.com/blog/featured.jpg",
  "description": "10 tips esenciales para planificar tu boda...",
  "publisher": {
    "@type": "Organization",
    "name": "MiWebDeBodas",
    "logo": "https://miwebdebodas.com/logo.png"
  },
  "articleBody": "El contenido completo del artículo aquí..."
}
```

### Mejores Prácticas
- Mínimo 1,500 palabras
- Imágenes cada 200-300 palabras
- Subtítulos H2-H3 claros
- Párrafos cortos (2-3 líneas máximo)
- Bold en palabras clave (máximo 2%)
- Links internos (3-5 links)
- CTA al final

---

## 6️⃣ PÁGINA DE PLANTILLAS

### Estructura Ideal
```html
<h1>Plantillas de Bodas Profesionales</h1>

<section class="filters">
  <label>Filtrar por:</label>
  <select>
    <option>Todas las plantillas</option>
    <option>Modernas</option>
    <option>Clásicas</option>
    <option>Elegantes</option>
  </select>
</section>

<section class="gallery">
  <article class="template">
    <figure>
      <img src="template-preview.jpg" alt="Plantilla Clásica Elegante">
    </figure>
    <h3>Clásica Elegante</h3>
    <p>Diseño clásico y elegante para bodas tradicionales</p>
    <a href="#preview">Ver Preview</a>
    <button>Usar esta plantilla</button>
  </article>
  
  <!-- Más plantillas -->
</section>
```

### Meta Tags
```
Title: Plantillas de Bodas Profesionales - MiWebDeBodas
Description: Elige entre nuestras plantillas de bodas profesionales. 
Diseños modernos, clásicos y elegantes. Completamente personalizables.
Keywords: plantillas bodas, temas bodas, diseños bodas profesionales
```

---

## 7️⃣ MEJORES PRÁCTICAS GENERALES

### Para Todas las Páginas

#### Titles (50-60 caracteres)
✅ Buen ejemplo:
```
"10 Tips para Planificar tu Boda - Blog MiWebDeBodas"
```

❌ Mal ejemplo:
```
"Blog Post" (muy genérico)
"10 TIPS PARA PLANIFICAR TU BODA PERFECTA DESDE CERO SIGUIENDO TODOS LOS PASOS RECOMENDADOS" 
(muy largo)
```

#### Descriptions (150-160 caracteres)
✅ Buen ejemplo:
```
"Descubre 10 tips esenciales para planificar tu boda. 
Desde presupuesto, fecha, invitados hasta detalles finales. 
Guía completa con ejemplos prácticos."
```

❌ Mal ejemplo:
```
"Este artículo habla sobre bodas..." (genérico)
"Este es un blog post que creamos para enseñarte cómo planificar tu boda 
porque muchas personas no saben cómo hacerlo correctamente de manera adecuada..." 
(demasiado largo)
```

#### Imágenes
✅ Buena práctica:
```html
<img 
  src="boda-ejemplo.jpg"
  alt="Boda de ejemplo en playa con decoración floral"
  loading="lazy"
  width="800"
  height="600"
/>
```

❌ Mal práctica:
```html
<img src="image.jpg" alt="foto">
<img src="boda.jpg"> <!-- Sin alt -->
```

#### Links Internos
✅ Buen ejemplo:
```html
<p>Aprende a <a href="/blog/tips-bodas">planificar tu boda</a> 
con nuestros tips expertos.</p>
```

❌ Mal ejemplo:
```html
<p>Aprende más <a href="/blog/tips-bodas">aquí</a>.</p>
<p><a href="/blog/tips-bodas">Click aquí</a> para saber más.</p>
```

---

## 8️⃣ CHECKLIST DE IMPLEMENTACIÓN POR PÁGINA

Para cada nueva página/sección:

- [ ] H1 único y descriptivo
- [ ] H2-H3 estructura lógica
- [ ] 50-60 caracteres en Title
- [ ] 150-160 caracteres en Description
- [ ] Meta keywords (3-5)
- [ ] Canonical URL
- [ ] Alt text en todas las imágenes
- [ ] Internal links (3-5 links)
- [ ] Schema.org JSON-LD apropiado
- [ ] Texto alternativo en botones
- [ ] Mobile responsive
- [ ] Velocidad < 3 segundos
- [ ] Sin enlaces rotos
- [ ] Copywriting enfocado en beneficios

---

## 9️⃣ DENSIDAD DE PALABRAS CLAVE

Para artículos de 1,500 palabras:
- **Palabra clave principal**: 2-3 veces (0.15% - 0.2%)
- **Sinónimos**: 3-5 veces
- **Variantes**: 2-4 veces

Ejemplo para "bodas online":
- "bodas online" (2 veces)
- "bodas por internet" (1 vez)
- "boda digital" (1 vez)
- "matrimonio online" (1 vez)
- "boda virtual" (1 vez)

---

## 🔟 ANÁLISIS COMPETITIVO SIMPLE

Antes de publicar cada página, busca:
1. Los 3 resultados TOP en Google para tu keyword
2. ¿Cuántas palabras tienen?
3. ¿Qué estructura usan?
4. ¿Qué tipo de imágenes?
5. ¿Qué schema usan?
6. ¿Qué links internos tienen?

Luego, **crea algo mejor** que los top 3.

---

**Recuerda**: SEO no es magia, es trabajo consistente y estructurado.

Sigue estas prácticas y verás resultados en 30-60 días. 🚀
