#!/bin/bash
# Script para ejecutar EN EL SERVIDOR directamente
# Copiar este archivo al servidor y ejecutarlo allí con: bash deploy-directo.sh

REPO_ROOT="/root/wedding"
DOCKER_DIR="/root/wedding/boda-backend"
SERVER_IP="161.97.169.31"

echo "🚀 Iniciando despliegue local en el servidor..."

# 1. Actualizar código
echo "════════════════════════════════════════════════════"
echo "  ACTUALIZANDO CÓDIGO"
echo "════════════════════════════════════════════════════"

if [ -d "$REPO_ROOT" ]; then
    cd $REPO_ROOT
    echo "📂 Directorio del repositorio: $REPO_ROOT"
    echo "[1/7] Obteniendo últimos cambios..."
    git fetch origin
    git reset --hard origin/main
else
    echo "⚠️  El repositorio no existe. Clonando por primera vez..."
    cd /root
    git clone https://github.com/RedyDelgado/bodas.git wedding
    cd $REPO_ROOT
fi

# 2. Ejecutar Docker desde la carpeta del backend
cd $DOCKER_DIR
echo "📂 Directorio de Docker: $DOCKER_DIR"

# 3. Regenerar .env
echo "⚠️  Regenerando .env desde .env.production.example..."

if [ -f .env.production.example ]; then
    cp .env.production.example .env
    
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=BodaSecure2025!/g" .env
    sed -i "s|APP_URL=http://161.97.169.31|APP_URL=https://$SERVER_IP|g" .env
    sed -i "s|FRONTEND_PUBLIC_URL=http://161.97.169.31|FRONTEND_PUBLIC_URL=https://$SERVER_IP|g" .env
    
    echo "✅ .env regenerado y configurado."
else
    echo "❌ Error: No se encontró .env.production.example"
    exit 1
fi

# 4. Limpieza total
echo ""
echo "[2/7] LIMPIEZA TOTAL..."
echo "🧨 Eliminando contenedores y volúmenes antiguos..."

docker kill $(docker ps -q) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker volume prune -f || true
docker network prune -f || true

echo "✅ Limpieza completada"

# 5. Construir imágenes
echo ""
echo "[3/7] Construyendo imágenes Docker..."
if ! docker compose build --no-cache; then
    echo "❌ Error al construir imágenes"
    exit 1
fi

# 6. Levantar servicios
echo ""
echo "[4/7] Levantando servicios..."
if ! docker compose up -d; then
    echo "❌ Error al levantar servicios"
    docker compose logs --tail=50
    exit 1
fi

echo "✅ Servicios levantados. Esperando estabilización..."

# Esperar y verificar
for i in {1..6}; do
    echo "  Esperando... $i/6"
    sleep 5
    docker compose ps
done

# 7. Permisos y directorios de storage
echo ""
echo "[5/7] Ajustando permisos y creando directorios de storage..."
docker compose exec -T app bash -c "
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data &&
chmod -R 775 storage bootstrap/cache &&
chown -R www-data:www-data storage bootstrap/cache
" || echo "⚠️  Error ajustando permisos (continuando)"

# 8. Key generate
echo ""
echo "[6/7] Generando clave de aplicación..."
docker compose exec -T app php artisan key:generate || echo "⚠️  Error generando key (continuando)"

# 9. Migraciones
echo ""
echo "[7/7] Migrando base de datos..."
docker compose exec -T app php artisan migrate --force || echo "⚠️  Error en migraciones"

echo "   - Asegurando roles, planes, plantillas y superadmin..."
docker compose exec -T app php artisan db:seed --class=RolesSeeder --force || echo "⚠️  Error en RolesSeeder"
docker compose exec -T app php artisan db:seed --class=PlanesSeeder --force || echo "⚠️  Error en PlanesSeeder"
docker compose exec -T app php artisan db:seed --class=PlantillasSeeder --force || echo "⚠️  Error en PlantillasSeeder"
docker compose exec -T app php artisan db:seed --class=SuperAdminSeeder --force || echo "⚠️  Error en SuperAdminSeeder"


# 10. Optimización
echo ""
echo "[8/7] Optimizando aplicación..."
docker compose exec -T app php artisan cache:clear || true
docker compose exec -T app php artisan config:cache || true
docker compose exec -T app php artisan route:cache || true

echo ""
echo "════════════════════════════════════════════════════"
echo "✓✓✓ DESPLIEGUE COMPLETADO ✓✓✓"
echo "════════════════════════════════════════════════════"
echo "🌐 URL: https://$SERVER_IP"

# Mostrar estado final
echo ""
echo "Estado final de contenedores:"
docker compose ps

echo ""
echo "Logs recientes del backend:"
docker compose logs app --tail=20

echo ""
echo "════════════════════════════════════════════════════"
echo "  PRUEBA AUTOMÁTICA DE LOGIN"
echo "════════════════════════════════════════════════════"
echo "Probando login con superadmin..."

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"redy.delgado@gmail.com","password":"R3DY-ARDOS"}' \
  -v || echo "⚠️  Error en login (ver detalles arriba)"

echo ""
echo "Si el login falló, revisa los logs del backend:"
echo "  docker compose logs app --tail=50"
