#!/bin/bash
# Script para probar la conectividad del API en servidor/host específico
# Uso:
#   EMAIL=usuario@dominio PASS=clave TARGET=161.97.169.31 bash test-api.sh
# o
#   bash test-api.sh usuario@dominio clave 161.97.169.31

set -euo pipefail

EMAIL=${EMAIL:-${1:-test@test.com}}
PASS=${PASS:-${2:-test}}
TARGET=${TARGET:-${3:-localhost}}

echo "═══════════════════════════════════════════════"
echo "  PRUEBAS DE CONECTIVIDAD API"
echo "═══════════════════════════════════════════════"

echo ""
echo "1) Backend directo (${TARGET}:8000): /api/auth/login"
curl -s "http://${TARGET}:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASS}\"}" | jq -C '.' || echo "❌ Falló"

echo ""
echo "2) Traefik/web (${TARGET}:80): /api/auth/login"
curl -s "http://${TARGET}/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASS}\"}" | jq -C '.' || echo "❌ Falló"

echo ""
echo "3) Público: /api/public/planes (${TARGET})"
curl -s "http://${TARGET}/api/public/planes" \
  -H "Accept: application/json" | jq -C '.' || echo "❌ Falló"

echo ""
echo "4) Logs Traefik (si existe)"
docker logs boda_traefik --tail=30 2>&1 | grep -i "api\|error" || echo "Sin logs relevantes / Traefik no en uso"

echo ""
echo "5) Frontend (${TARGET})"
curl -s "http://${TARGET}" | head -20
