#!/bin/bash

# SEO Verification Script
# Verifica que todos los elementos SEO estén en su lugar

set -e

echo "🔍 VERIFICACIÓN SEO - MiWebDeBodas"
echo "=================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar archivo
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Archivo encontrado: $1"
    return 0
  else
    echo -e "${RED}✗${NC} Archivo NO encontrado: $1"
    return 1
  fi
}

# Función para verificar contenido en archivo
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Contenido encontrado en $1: '$2'"
    return 0
  else
    echo -e "${RED}✗${NC} Contenido NO encontrado en $1: '$2'"
    return 1
  fi
}

echo "📄 1. Verificando archivos de configuración..."
echo ""

check_file "boda-frontend/index.html"
check_file "boda-frontend/public/robots.txt"
check_file ".htaccess"
check_file "boda-frontend/scripts/sitemap-generator.js"

echo ""
echo "🏷️  2. Verificando meta tags en index.html..."
echo ""

check_content "boda-frontend/index.html" "lang=\"es\""
check_content "boda-frontend/index.html" "og:title"
check_content "boda-frontend/index.html" "og:description"
check_content "boda-frontend/index.html" "og:image"
check_content "boda-frontend/index.html" "twitter:card"
check_content "boda-frontend/index.html" "canonical"

echo ""
echo "🤖 3. Verificando robots.txt..."
echo ""

check_content "boda-frontend/public/robots.txt" "User-agent: *"
check_content "boda-frontend/public/robots.txt" "Sitemap:"
check_content "boda-frontend/public/robots.txt" "Disallow: /admin/"

echo ""
echo "⚙️  4. Verificando .htaccess..."
echo ""

check_content ".htaccess" "RewriteEngine On"
check_content ".htaccess" "HTTPS"
check_content ".htaccess" "Expires"
check_content ".htaccess" "gzip"

echo ""
echo "⚛️  5. Verificando componentes React..."
echo ""

check_file "boda-frontend/src/shared/components/SEOHelmet.jsx"
check_file "boda-frontend/src/shared/components/SEO_EXAMPLES.jsx"

if [ -f "boda-frontend/src/shared/components/SEOHelmet.jsx" ]; then
  check_content "boda-frontend/src/shared/components/SEOHelmet.jsx" "updateSEO"
  check_content "boda-frontend/src/shared/components/SEOHelmet.jsx" "SCHEMA_TYPES"
fi

echo ""
echo "📚 6. Verificando guías de implementación..."
echo ""

check_file "SEO_ESTRATEGIA_COMPLETA.md"
check_file "GUIA_IMPLEMENTACION_SEO.md"

echo ""
echo "=================================================="
echo "✅ VERIFICACIÓN COMPLETADA"
echo "=================================================="
echo ""
echo "📝 Próximos pasos:"
echo "1. Integrar SEOHelmet en tus componentes principales"
echo "2. Generar sitemaps: npm run build && node scripts/sitemap-generator.js"
echo "3. Verificar en Google Search Console"
echo "4. Instalar Google Analytics"
echo "5. Crear contenido de blog optimizado"
echo ""
echo "📊 Herramientas recomendadas:"
echo "- https://search.google.com/search-console"
echo "- https://analytics.google.com"
echo "- https://business.google.com"
echo "- https://pagespeed.web.dev"
echo ""
