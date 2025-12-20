#!/bin/bash

# Script de despliegue completo para producción
# Ejecutar en el servidor de producción

echo "=========================================="
echo "  Despliegue de MiWebDeBodas - Producción"
echo "=========================================="

# Variables
SERVER_IP="161.97.169.31"
BACKEND_DIR="/root/wedding/boda-backend"
FRONTEND_DIR="/root/wedding/boda-frontend"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[1/8] Deteniendo contenedores...${NC}"
cd $BACKEND_DIR
docker-compose -f docker-compose.prod.yml down

echo -e "${YELLOW}[2/8] Limpiando caché de Laravel...${NC}"
rm -rf bootstrap/cache/*.php
rm -rf storage/framework/cache/data/*
rm -rf storage/framework/sessions/*
rm -rf storage/framework/views/*

echo -e "${YELLOW}[3/8] Actualizando dependencias de Laravel...${NC}"
docker run --rm -v $(pwd):/app composer:2 install --no-dev --optimize-autoloader

echo -e "${YELLOW}[4/8] Regenerando autoload de Composer...${NC}"
docker run --rm -v $(pwd):/app composer:2 dump-autoload -o

echo -e "${YELLOW}[5/8] Configurando permisos...${NC}"
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo -e "${YELLOW}[6/8] Levantando contenedores...${NC}"
export SERVER_IP=$SERVER_IP
docker-compose -f docker-compose.prod.yml up -d --build

echo -e "${YELLOW}[7/8] Esperando que los servicios estén listos...${NC}"
sleep 10

echo -e "${YELLOW}[8/8] Ejecutando migraciones y seeders...${NC}"
docker-compose -f docker-compose.prod.yml exec -T app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec -T app php artisan db:seed --force

echo -e "${GREEN}=========================================="
echo -e "  ✅ Despliegue completado exitosamente"
echo -e "==========================================${NC}"
echo ""
echo "URLs disponibles:"
echo "  Frontend: http://$SERVER_IP"
echo "  Backend API: http://$SERVER_IP:8000/api"
echo "  PHPMyAdmin: http://$SERVER_IP:8080"
echo ""
echo "Credenciales de superadministrador:"
echo "  Email: redy.delgado@gmail.com"
echo "  Password: R3DY-ARDOS"
echo ""
echo "Verifica los logs con:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
