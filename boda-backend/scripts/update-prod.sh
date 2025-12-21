#!/bin/bash
# Actualiza y reinicia la plataforma en Contabo
# Uso: sudo bash /root/wedding/boda-backend/scripts/update-prod.sh [SERVER_IP]

set -euo pipefail

SERVER_IP=${1:-161.97.169.31}
BACKEND_DIR="/root/wedding/boda-backend"

cd "$BACKEND_DIR"

export SERVER_IP="$SERVER_IP"

echo "[1/4] Construyendo imágenes (puede tardar)"
docker compose -f docker-compose.prod.yml build --no-cache

echo "[2/4] Levantando servicios"
docker compose -f docker-compose.prod.yml up -d

echo "[3/4] Migraciones y storage link"
sleep 8
if docker exec boda_app php -v >/dev/null 2>&1; then
  docker exec boda_app php artisan migrate --force || true
  docker exec boda_app php artisan storage:link || true
else
  echo "WARN: el contenedor boda_app aún no responde a php"
fi

echo "[4/4] Estado de servicios"
docker compose -f docker-compose.prod.yml ps

echo "✅ Actualización completa. Frontend: http://$SERVER_IP | API: http://$SERVER_IP:8000/api"
