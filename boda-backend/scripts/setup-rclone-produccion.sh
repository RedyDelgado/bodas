#!/bin/bash

################################################################################
# CONFIGURACIÓN DE RCLONE PARA PRODUCCIÓN
# 
# Este script crea una configuración de rclone que persiste en producción
# usando variables de entorno o configuración manual
################################################################################

set -e

echo "================================================"
echo "  🔧 CONFIGURACIÓN DE RCLONE PARA PRODUCCIÓN"
echo "================================================"
echo ""

# Directorio de configuración de rclone
RCLONE_CONFIG_DIR="/root/.config/rclone"
RCLONE_CONFIG_FILE="$RCLONE_CONFIG_DIR/rclone.conf"

# Crear directorio si no existe
mkdir -p "$RCLONE_CONFIG_DIR"

# Verificar si ya existe configuración
if [ -f "$RCLONE_CONFIG_FILE" ] && grep -q "\[gdrive\]" "$RCLONE_CONFIG_FILE"; then
    echo "✅ Configuración de rclone ya existe"
    echo ""
    rclone listremotes
    echo ""
    exit 0
fi

echo "⚠️  No se encontró configuración de rclone"
echo ""
echo "OPCIONES:"
echo ""
echo "1. Configurar manualmente (recomendado para primera vez)"
echo "2. Importar desde archivo de configuración"
echo "3. Salir"
echo ""
read -p "Selecciona una opción (1-3): " opcion

case $opcion in
    1)
        echo ""
        echo "================================================"
        echo "  CONFIGURACIÓN MANUAL"
        echo "================================================"
        echo ""
        echo "Iniciando asistente de rclone..."
        echo ""
        echo "IMPORTANTE para producción:"
        echo "  - name> gdrive"
        echo "  - Storage> 15 (Google Drive)"
        echo "  - scope> 1 (Full access)"
        echo "  - Use auto config> n (estamos en servidor)"
        echo ""
        read -p "Presiona ENTER para continuar..."
        
        rclone config
        
        # Verificar
        if rclone listremotes | grep -q "gdrive:"; then
            echo ""
            echo "✅ Configuración exitosa"
            echo ""
            echo "Creando carpeta de backups..."
            rclone mkdir gdrive:/backups-miwebdebodas 2>/dev/null || true
            echo "✅ Listo"
            echo ""
            echo "IMPORTANTE: Copia este archivo para respaldo:"
            echo "  $RCLONE_CONFIG_FILE"
            echo ""
        else
            echo "❌ No se completó la configuración"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "================================================"
        echo "  IMPORTAR CONFIGURACIÓN"
        echo "================================================"
        echo ""
        echo "Coloca tu archivo rclone.conf en:"
        echo "  /var/www/html/storage/app/rclone.conf"
        echo ""
        read -p "Presiona ENTER cuando esté listo..."
        
        if [ -f "/var/www/html/storage/app/rclone.conf" ]; then
            cp "/var/www/html/storage/app/rclone.conf" "$RCLONE_CONFIG_FILE"
            chmod 600 "$RCLONE_CONFIG_FILE"
            echo "✅ Configuración importada"
            echo ""
            rclone listremotes
        else
            echo "❌ No se encontró el archivo"
            exit 1
        fi
        ;;
        
    3)
        echo "Saliendo..."
        exit 0
        ;;
        
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "  ✅ CONFIGURACIÓN COMPLETADA"
echo "================================================"
echo ""
echo "Para respaldar tu configuración:"
echo "  docker compose exec app cat /root/.config/rclone/rclone.conf > rclone-backup.conf"
echo ""
echo "Para probar:"
echo "  docker compose exec app rclone lsd gdrive:"
echo ""
