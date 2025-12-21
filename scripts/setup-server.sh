#!/bin/bash

# Script completo de despliegue a Contabo
# Variables
DOMAIN="161.97.169.31"
DEPLOY_DIR="/root/wedding"
BACKEND_DIR="/root/wedding/boda-backend"
TRAEFIK_EMAIL="redy.delgado@gmail.com"
DB_PASSWORD="BodaSecure2025!"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DESPLIEGUE PRODUCCIÓN - MI WEB DE BODAS EN CONTABO      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# 1. Verificar y actualizar sistema
echo -e "\n${YELLOW}[1/10] Actualizando sistema...${NC}"
apt update -qq && apt upgrade -y -qq > /dev/null 2>&1
echo -e "${GREEN}✓ Sistema actualizado${NC}"

# 2. Verificar Docker
echo -e "\n${YELLOW}[2/10] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker no encontrado. Instalando...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✓ Docker instalado${NC}"
else
    echo -e "${GREEN}✓ Docker encontrado: $(docker --version)${NC}"
fi

# 3. Verificar Docker Compose
echo -e "\n${YELLOW}[3/10] Verificando Docker Compose...${NC}"
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose no encontrado. Instalando...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose instalado${NC}"
else
    echo -e "${GREEN}✓ Docker Compose encontrado: $(docker compose version | cut -d' ' -f3)${NC}"
fi

# 4. Clonar o actualizar repositorio
echo -e "\n${YELLOW}[4/10] Preparando repositorio...${NC}"
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Actualizando repositorio existente..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    echo "Clonando repositorio..."
    rm -rf "$DEPLOY_DIR"
    mkdir -p /root
    cd /root
    git clone https://github.com/RedyDelgado/bodas.git wedding
fi
cd "$BACKEND_DIR"
echo -e "${GREEN}✓ Repositorio listo${NC}"

# 5. Configurar .env de Laravel
echo -e "\n${YELLOW}[5/10] Configurando ambiente de producción...${NC}"
cat > "$BACKEND_DIR/.env" << EOF
APP_NAME="MiWebDeBodas"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://$DOMAIN

APP_BODAS_BASE_DOMAIN=$DOMAIN
APP_SERVER_IP=$DOMAIN

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=bodas_db
DB_USERNAME=bodas_user
DB_PASSWORD=$DB_PASSWORD

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

MAIL_MAILER=log
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@miwebdebodas.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

SANCTUM_STATEFUL_DOMAINS=$DOMAIN

TRAEFIK_ACME_EMAIL=$TRAEFIK_EMAIL
MYSQL_ROOT_PASSWORD=$DB_PASSWORD
EOF
echo -e "${GREEN}✓ Variables de ambiente configuradas${NC}"

# 6. Crear docker-compose.prod.yml si no existe
echo -e "\n${YELLOW}[6/10] Verificando configuración de Docker Compose...${NC}"
if [ ! -f "$BACKEND_DIR/docker-compose.prod.yml" ]; then
    echo "Usando docker-compose.yml para producción"
else
    echo -e "${GREEN}✓ docker-compose.prod.yml encontrado${NC}"
fi

# 7. Limpiar contenedores antiguos
echo -e "\n${YELLOW}[7/10] Limpiando servicios antiguos...${NC}"
cd "$BACKEND_DIR"
docker compose down -v 2>/dev/null || true
echo -e "${GREEN}✓ Servicios detenidos${NC}"

# 8. Construir imágenes
echo -e "\n${YELLOW}[8/10] Construyendo imágenes Docker (esto puede tardar varios minutos)...${NC}"
docker compose build --no-cache
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Imágenes construidas exitosamente${NC}"
else
    echo -e "${RED}✗ Error al construir imágenes${NC}"
    exit 1
fi

# 9. Levantar servicios
echo -e "\n${YELLOW}[9/10] Levantando servicios...${NC}"
docker compose up -d
sleep 10
echo -e "${GREEN}✓ Servicios iniciados${NC}"

# 10. Ejecutar migraciones y seeders
echo -e "\n${YELLOW}[10/10] Ejecutando migraciones de base de datos...${NC}"
docker compose exec -T app php artisan key:generate
docker compose exec -T app php artisan migrate --force
docker compose exec -T app php artisan db:seed --force
docker compose exec -T app php artisan cache:clear
docker compose exec -T app php artisan config:cache
echo -e "${GREEN}✓ Base de datos configurada${NC}"

# Resumen final
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✓ DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📋 INFORMACIÓN DE DESPLIEGUE:${NC}"
echo -e "  URL: ${GREEN}https://$DOMAIN${NC}"
echo -e "  Servidor: ${GREEN}$DOMAIN${NC}"
echo -e "  Directorio: ${GREEN}$DEPLOY_DIR${NC}"
echo -e "  Email SSL: ${GREEN}$TRAEFIK_EMAIL${NC}"

echo -e "\n${YELLOW}🔍 COMANDOS ÚTILES:${NC}"
echo -e "  Ver logs: ${BLUE}docker compose logs -f${NC}"
echo -e "  Ver estado: ${BLUE}docker compose ps${NC}"
echo -e "  Detener: ${BLUE}docker compose down${NC}"
echo -e "  Reiniciar: ${BLUE}docker compose restart${NC}"

echo -e "\n${YELLOW}📊 VERIFICACIÓN DE SERVICIOS:${NC}"
cd "$BACKEND_DIR"
docker compose ps

echo -e "\n${GREEN}✓ Despliegue completado. El sitio estará disponible en https://$DOMAIN${NC}\n"
