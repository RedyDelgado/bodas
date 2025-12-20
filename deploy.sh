#!/bin/bash
# Script de despliegue en Contabo
# Uso: bash deploy.sh 161.97.16.31

set -e

SERVER_IP=${1:-161.97.16.31}
PROJECT_DIR="/opt/wedding/boda-backend"

echo "🚀 Desplegando MiWebDeBodas a $SERVER_IP"
echo "=================================================="

# Paso 1: Clonar/actualizar repositorio
echo "📦 Clonando repositorio..."
if [ ! -d "$PROJECT_DIR" ]; then
  mkdir -p /opt/wedding
  cd /opt/wedding
  git clone https://github.com/TuUsuario/wedding.git . 2>/dev/null || {
    echo "⚠️  Clona manualmente o sube via scp:"
    echo "   scp -r C:\\xampp\\htdocs\\wedding\\* root@$SERVER_IP:$PROJECT_DIR/"
  }
fi

cd $PROJECT_DIR

# Paso 2: Crear .env
echo "🔧 Generando .env..."
cat > .env << EOF
APP_NAME=MiWebDeBodas
APP_ENV=production
APP_DEBUG=false
APP_URL=http://$SERVER_IP

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=db_wedding
DB_USERNAME=db_wedding
DB_PASSWORD=SecurePass2025!

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

APP_BODAS_BASE_DOMAIN=redyypatricia.com
APP_SERVER_IP=$SERVER_IP

MAIL_MAILER=log
EOF

# Paso 3: Construir e iniciar servicios
echo "🐳 Construyendo imágenes Docker..."
SERVER_IP=$SERVER_IP docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Iniciando servicios..."
SERVER_IP=$SERVER_IP docker compose -f docker-compose.prod.yml up -d

# Paso 4: Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
sleep 5
docker exec boda_app php artisan migrate --force

# Paso 5: Crear almacenamiento
echo "💾 Creando enlace de almacenamiento..."
docker exec boda_app php artisan storage:link

# Paso 6: Generar clave si no existe
echo "🔑 Generando clave de aplicación..."
docker exec boda_app php artisan key:generate --force 2>/dev/null || true

echo ""
echo "✅ ¡Despliegue completado!"
echo "=================================================="
echo "📍 Frontend:  http://$SERVER_IP"
echo "📍 Backend:   http://$SERVER_IP/api"
echo "📍 PhpMyAdmin: http://$SERVER_IP:8080"
echo ""
echo "🔐 Credenciales phpMyAdmin:"
echo "   Usuario: db_wedding"
echo "   Password: SecurePass2025!"
echo ""
echo "💡 Para cambiar contraseña MySQL, edita .env y ejecuta:"
echo "   docker compose -f docker-compose.prod.yml down"
echo "   docker volume rm boda-backend_.docker-mysql"
echo "   docker compose -f docker-compose.prod.yml up -d"
