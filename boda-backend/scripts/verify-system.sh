#!/bin/bash

# ==================================================
# VERIFICACIÓN COMPLETA DEL SISTEMA
# ==================================================

echo "=========================================="
echo "  Verificación del Sistema - Producción"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
  else
    echo -e "${RED}❌ $1${NC}"
  fi
}

# 1. Verificar contenedores
echo -e "${YELLOW}[1/8] Verificando contenedores...${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""

# 2. Verificar conexión a base de datos
echo -e "${YELLOW}[2/8] Verificando conexión a base de datos...${NC}"
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u db_wedding -psecret123 -e "SELECT 'OK' as status;" 2>/dev/null
check "Conexión a base de datos"
echo ""

# 3. Verificar migraciones
echo -e "${YELLOW}[3/8] Verificando tablas de base de datos...${NC}"
docker-compose -f docker-compose.prod.yml exec -T app php artisan migrate:status --force
echo ""

# 4. Verificar que existan datos básicos
echo -e "${YELLOW}[4/8] Verificando datos básicos...${NC}"

# Roles
ROLES=$(docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM roles;" 2>/dev/null)
echo "   Roles: $ROLES"
[ "$ROLES" -gt 0 ] && echo -e "${GREEN}   ✅ Roles OK${NC}" || echo -e "${RED}   ❌ Sin roles${NC}"

# Planes
PLANES=$(docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM planes;" 2>/dev/null)
echo "   Planes: $PLANES"
[ "$PLANES" -gt 0 ] && echo -e "${GREEN}   ✅ Planes OK${NC}" || echo -e "${RED}   ❌ Sin planes${NC}"

# Plantillas
PLANTILLAS=$(docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM plantillas;" 2>/dev/null)
echo "   Plantillas: $PLANTILLAS"
[ "$PLANTILLAS" -gt 0 ] && echo -e "${GREEN}   ✅ Plantillas OK${NC}" || echo -e "${RED}   ❌ Sin plantillas${NC}"

# Usuarios
USERS=$(docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM users;" 2>/dev/null)
echo "   Usuarios: $USERS"
[ "$USERS" -gt 0 ] && echo -e "${GREEN}   ✅ Usuarios OK${NC}" || echo -e "${RED}   ❌ Sin usuarios${NC}"

# Superadmin
SUPERADMIN=$(docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM users WHERE email='redy.delgado@gmail.com';" 2>/dev/null)
echo "   Superadmin: $SUPERADMIN"
[ "$SUPERADMIN" -gt 0 ] && echo -e "${GREEN}   ✅ Superadmin existe${NC}" || echo -e "${RED}   ❌ Superadmin no existe${NC}"

echo ""

# 5. Verificar APIs públicas
echo -e "${YELLOW}[5/8] Verificando APIs públicas...${NC}"
curl -s -o /dev/null -w "   /api/public/planes: %{http_code}\n" http://161.97.169.31:8000/api/public/planes
curl -s -o /dev/null -w "   /api/public/plantillas: %{http_code}\n" http://161.97.169.31:8000/api/public/plantillas
curl -s -o /dev/null -w "   /api/public/faqs: %{http_code}\n" http://161.97.169.31:8000/api/public/faqs
echo ""

# 6. Verificar permisos
echo -e "${YELLOW}[6/8] Verificando permisos...${NC}"
docker-compose -f docker-compose.prod.yml exec -T app ls -la storage | grep -E "^d.*storage"
docker-compose -f docker-compose.prod.yml exec -T app ls -la bootstrap/cache | grep -E "^d.*cache"
echo ""

# 7. Verificar logs recientes
echo -e "${YELLOW}[7/8] Últimos errores en logs de Laravel (si hay)...${NC}"
docker-compose -f docker-compose.prod.yml exec -T app tail -20 storage/logs/laravel.log 2>/dev/null | grep -i error || echo "   Sin errores recientes"
echo ""

# 8. Resumen
echo -e "${YELLOW}[8/8] Resumen${NC}"
echo "=========================================="

if [ "$ROLES" -gt 0 ] && [ "$PLANES" -gt 0 ] && [ "$PLANTILLAS" -gt 0 ] && [ "$USERS" -gt 0 ]; then
  echo -e "${GREEN}✅ Sistema funcionando correctamente${NC}"
  echo ""
  echo "URLs disponibles:"
  echo "  Frontend: http://161.97.169.31"
  echo "  Backend: http://161.97.169.31:8000/api"
  echo "  PHPMyAdmin: http://161.97.169.31:8080"
  echo ""
  if [ "$SUPERADMIN" -gt 0 ]; then
    echo "Credenciales Superadmin:"
    echo "  Email: redy.delgado@gmail.com"
    echo "  Password: R3DY-ARDOS"
  else
    echo -e "${YELLOW}⚠️  Ejecuta: docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=SuperAdminSeeder --force${NC}"
  fi
else
  echo -e "${RED}❌ Sistema no está completamente configurado${NC}"
  echo ""
  echo "Ejecuta:"
  echo "  docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force"
  echo "  docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force"
fi

echo "=========================================="
