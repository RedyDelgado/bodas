// src/shared/components/SEOHead.jsx
import { useEffect } from 'react';

/**
 * Componente para actualizar dinámicamente los meta tags Open Graph y Twitter Cards
 * Esto permite que al compartir en redes sociales se vea personalizado
 */
export default function SEOHead({ 
  title, 
  description, 
  image, 
  url 
}) {
  useEffect(() => {
    // Actualizar título de la página
    if (title) {
      document.title = title;
    }

    // Actualizar meta description
    updateMetaTag('name', 'description', description);

    // Open Graph
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:url', url);

    // Twitter Cards
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);

    // Actualizar canonical URL
    updateCanonical(url);

  }, [title, description, image, url]);

  return null; // Este componente no renderiza nada
}

/**
 * Función auxiliar para actualizar o crear meta tags
 */
function updateMetaTag(attr, key, content) {
  if (!content) return;

  let element = document.querySelector(`meta[${attr}="${key}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Actualizar o crear el link canonical
 */
function updateCanonical(url) {
  if (!url) return;

  let link = document.querySelector('link[rel="canonical"]');
  
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  
  link.setAttribute('href', url);
}
