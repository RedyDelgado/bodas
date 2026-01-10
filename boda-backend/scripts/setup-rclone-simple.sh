#!/bin/bash

################################################################################
# Script SIMPLIFICADO para configurar rclone con Google Drive
# 
# Este script usa el método interactivo de rclone config
# Es MÁS FÁCIL de usar pero requiere acceso al navegador
#
# Uso:
#   docker compose exec -it app bash scripts/setup-rclone-simple.sh
################################################################################

set -e

echo "=========================================="
echo "CONFIGURACIÓN RÁPIDA DE RCLONE"
echo "=========================================="
echo ""

# Crear directorio
mkdir -p /root/.config/rclone

echo "Iniciando asistente de configuración de rclone..."
echo ""
echo "CUANDO TE PREGUNTE:"
echo "  n) New remote"
echo "  name> gdrive"
echo "  Storage> 15 (Google Drive) o busca 'drive'"
echo "  client_id> [deja en blanco, presiona ENTER]"
echo "  client_secret> [deja en blanco, ENTER]"
echo "  scope> 1 (Full access)"
echo "  root_folder_id> [deja en blanco, ENTER]"
echo "  service_account_file> [deja en blanco, ENTER]"
echo "  Advanced config> n"
echo "  Use auto config> n (porque no tenemos navegador en el servidor)"
echo "  [Te dará un enlace, cópialo en tu navegador]"
echo "  [Autoriza con miwebdebodas.notificacion@gmail.com]"
echo "  [Copia el código de verificación aquí]"
echo "  Keep this remote> y"
echo "  q) Quit config"
echo ""
read -p "Presiona ENTER para continuar..."

rclone config

echo ""
echo "Verificando configuración..."

if rclone lsd gdrive: > /dev/null 2>&1; then
    echo ""
    echo "✅ ¡Configuración exitosa!"
    echo ""
    rclone lsd gdrive:
    
    # Crear carpeta de backups
    rclone mkdir gdrive:/backups-miwebdebodas 2>/dev/null || true
    
    echo ""
    echo "Carpeta de backups creada: gdrive:/backups-miwebdebodas"
    echo ""
    echo "Ahora configura en el panel admin:"
    echo "  Remote: gdrive:/backups-miwebdebodas"
else
    echo "❌ No se detectó la configuración 'gdrive'"
    echo "Ejecuta el comando nuevamente o revisa la configuración:"
    echo "  rclone config show"
fi

echo ""
