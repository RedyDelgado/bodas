#!/bin/bash
# Script para probar la conectividad del API en el servidor

echo "═══════════════════════════════════════════════"
echo "  PRUEBAS DE CONECTIVIDAD API"
echo "═══════════════════════════════════════════════"

echo ""
echo "1. Probando backend directo (localhost:8000):"
curl -s http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | jq -C '.' || echo "❌ Falló"

echo ""
echo ""
echo "2. Probando a través de Traefik (localhost:80):"
curl -s http://localhost:80/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | jq -C '.' || echo "❌ Falló"

echo ""
echo ""
echo "3. Probando desde IP pública (161.97.169.31:80):"
curl -s http://161.97.169.31/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | jq -C '.' || echo "❌ Falló"

echo ""
echo ""
echo "4. Probando planes (público):"
curl -s http://localhost:80/api/public/planes \
  -H "Accept: application/json" | jq -C '.' || echo "❌ Falló"

echo ""
echo ""
echo "5. Verificando que Traefik esté ruteando:"
docker logs boda_traefik --tail=30 2>&1 | grep -i "api\|error" || echo "Sin logs relevantes"

echo ""
echo ""
echo "6. Probando frontend directamente (localhost:3000):"
curl -s http://localhost:3000 | head -20

echo ""
echo ""
echo "7. Probando frontend a través de Traefik (localhost:80):"
curl -s http://localhost:80 | head -20
