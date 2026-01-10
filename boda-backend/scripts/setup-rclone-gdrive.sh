#!/bin/bash

################################################################################
# Script para configurar rclone con Google Drive
# 
# Este script configura rclone para subir backups a Google Drive automáticamente
# Cuenta: miwebdebodas.notificacion@gmail.com
#
# Uso (desde el HOST):
#   cd boda-backend
#   docker compose exec app bash scripts/setup-rclone-gdrive.sh
#
# O ejecutar directamente dentro del contenedor:
#   docker compose exec -it app bash
#   bash scripts/setup-rclone-gdrive.sh
################################################################################

set -e

echo "=========================================="
echo "CONFIGURACIÓN DE RCLONE PARA GOOGLE DRIVE"
echo "=========================================="
echo ""
echo "Cuenta de Google Drive: miwebdebodas.notificacion@gmail.com"
echo ""

# Crear directorio de configuración si no existe
mkdir -p /root/.config/rclone

# Verificar si ya existe configuración
if [ -f /root/.config/rclone/rclone.conf ]; then
    echo "⚠️  Ya existe una configuración de rclone."
    echo ""
    read -p "¿Deseas sobrescribirla? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Configuración cancelada."
        exit 0
    fi
fi

echo ""
echo "================================================"
echo "PASOS PARA CONFIGURAR GOOGLE DRIVE:"
echo "================================================"
echo ""
echo "1. Abre tu navegador en tu computadora"
echo "2. Asegúrate de estar conectado con: miwebdebodas.notificacion@gmail.com"
echo "3. El proceso te dará un enlace para autorizar"
echo "4. Copia y pega el código de autorización aquí"
echo ""
read -p "Presiona ENTER para continuar..."

# Iniciar configuración interactiva de rclone
echo ""
echo "Iniciando configuración de rclone..."
echo ""
echo "INSTRUCCIONES:"
echo "- Nombre del remote: gdrive"
echo "- Tipo de storage: Selecciona 'drive' o el número correspondiente a Google Drive"
echo "- Client ID: Deja en blanco (presiona ENTER)"
echo "- Client Secret: Deja en blanco (presiona ENTER)"
echo "- Scope: Selecciona 'drive' (acceso completo)"
echo "- Root folder ID: Deja en blanco"
echo "- Service Account: No"
echo "- Edit advanced config: No"
echo "- Use auto config: No (porque estamos en servidor)"
echo "- Copia el enlace en tu navegador y pega el código aquí"
echo ""
read -p "Presiona ENTER para empezar la configuración interactiva..."
echo ""

rclone config create gdrive drive \
  config_is_local=false \
  scope=drive

echo ""
echo "================================================"
echo "VERIFICANDO CONFIGURACIÓN..."
echo "================================================"
echo ""

# Probar conexión
if rclone lsd gdrive: > /dev/null 2>&1; then
    echo "✅ ¡Conexión exitosa con Google Drive!"
    echo ""
    echo "Carpetas disponibles:"
    rclone lsd gdrive: | head -10
    echo ""
else
    echo "❌ ERROR: No se pudo conectar con Google Drive"
    echo ""
    echo "Intenta ejecutar manualmente:"
    echo "  rclone config"
    echo ""
    exit 1
fi

# Crear carpeta para backups si no existe
echo "Creando carpeta de backups en Google Drive..."
rclone mkdir gdrive:/backups-miwebdebodas 2>/dev/null || true

echo ""
echo "================================================"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "================================================"
echo ""
echo "Configuración guardada en: /root/.config/rclone/rclone.conf"
echo "Remote name: gdrive"
echo "Carpeta de backups: gdrive:/backups-miwebdebodas"
echo ""
echo "Para actualizar la configuración en la base de datos:"
echo "1. Ve al panel admin: http://localhost:5173/admin/backups"
echo "2. En 'Configuración', establece:"
echo "   - Remote de Google Drive: gdrive:/backups-miwebdebodas"
echo "   - Habilita backups automáticos"
echo ""
echo "Para probar manualmente:"
echo "  rclone ls gdrive:"
echo "  rclone copy /ruta/archivo.txt gdrive:/backups-miwebdebodas"
echo ""
