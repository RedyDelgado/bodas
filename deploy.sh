#!/bin/bash
# Script de despliegue a Contabo (Producción)
# IP: 161.97.169.31
# Ejecutar: bash deploy.sh

SERVER_IP="161.97.169.31"
REMOTE_DIR="/root/wedding/boda-backend"

echo "🚀 Iniciando despliegue a $SERVER_IP..."

ssh -o StrictHostKeyChecking=no root@$SERVER_IP << EOF
    cd $REMOTE_DIR

    echo "════════════════════════════════════════════════════"
    echo "  ACTUALIZANDO CÓDIGO Y DESPLEGANDO"
    echo "════════════════════════════════════════════════════"

    echo ""
    echo "[1/7] Actualizando repositorio..."
    git pull origin main || echo "⚠️ No se pudo hacer git pull, continuando con versión actual..."

    echo ""
    echo "[2/7] Deteniendo servicios antiguos..."
    docker compose down -v 2>/dev/null || true

    echo ""
    echo "[3/7] Construyendo imágenes Docker..."
    docker compose build --no-cache

    echo ""
    echo "[4/7] Levantando servicios..."
    docker compose up -d
    echo "Esperando a que los servicios estén listos..."
    sleep 20

    echo ""
    echo "[5/7] Ajustando permisos..."
    # Asegurar que Apache (www-data) pueda escribir en storage y cache
    docker compose exec -T -u root app chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

    echo ""
    echo "[6/7] Generando clave de aplicación..."
    docker compose exec -T app php artisan key:generate

    echo ""
    echo "[7/7] Migrando base de datos..."
    docker compose exec -T app php artisan migrate --force
    # docker compose exec -T app php artisan db:seed --force # Descomentar si se necesita seed

    echo ""
    echo "[8/7] Optimizando aplicación..."
    docker compose exec -T app php artisan cache:clear
    docker compose exec -T app php artisan config:cache
    docker compose exec -T app php artisan route:cache
    
    echo ""
    echo "════════════════════════════════════════════════════"
    echo "✓✓✓ DESPLIEGUE COMPLETADO EXITOSAMENTE ✓✓✓"
    echo "════════════════════════════════════════════════════"
    echo "🌐 URL: https://$SERVER_IP"
EOF
