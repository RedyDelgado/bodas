#!/bin/bash

################################################################################
# Script para probar la subida de backups a Google Drive
# 
# Uso:
#   docker compose exec app bash scripts/test-rclone-backup.sh
################################################################################

set -e

echo "=========================================="
echo "PRUEBA DE BACKUP A GOOGLE DRIVE"
echo "=========================================="
echo ""

# Verificar configuración de rclone
echo "1. Verificando configuración de rclone..."
if ! rclone config show gdrive > /dev/null 2>&1; then
    echo "❌ ERROR: rclone no está configurado"
    echo ""
    echo "Ejecuta primero:"
    echo "  docker compose exec -it app bash scripts/setup-rclone-simple.sh"
    exit 1
fi
echo "   ✅ Configuración de rclone encontrada"
echo ""

# Verificar conexión
echo "2. Verificando conexión con Google Drive..."
if ! rclone lsd gdrive: > /dev/null 2>&1; then
    echo "   ❌ ERROR: No se puede conectar a Google Drive"
    echo "   Verifica tu configuración:"
    echo "     docker compose exec app rclone config show"
    exit 1
fi
echo "   ✅ Conexión exitosa con Google Drive"
echo ""

# Crear archivo de prueba
echo "3. Creando archivo de prueba..."
TEST_FILE="/tmp/test-backup-$(date +%Y%m%d-%H%M%S).txt"
echo "Este es un backup de prueba creado el $(date)" > "$TEST_FILE"
echo "   ✅ Archivo creado: $TEST_FILE"
echo ""

# Subir a Google Drive
echo "4. Subiendo archivo a Google Drive..."
DRIVE_PATH="gdrive:/backups-miwebdebodas"

if rclone copy "$TEST_FILE" "$DRIVE_PATH" -v; then
    echo "   ✅ Archivo subido exitosamente"
else
    echo "   ❌ ERROR al subir archivo"
    exit 1
fi
echo ""

# Verificar que existe en Drive
echo "5. Verificando archivo en Google Drive..."
FILE_NAME=$(basename "$TEST_FILE")
if rclone ls "$DRIVE_PATH" | grep -q "$FILE_NAME"; then
    echo "   ✅ Archivo verificado en Google Drive"
    rclone ls "$DRIVE_PATH" | grep "$FILE_NAME"
else
    echo "   ⚠️  No se pudo verificar el archivo"
fi
echo ""

# Limpiar
rm -f "$TEST_FILE"

echo "=========================================="
echo "✅ PRUEBA COMPLETADA CON ÉXITO"
echo "=========================================="
echo ""
echo "Los backups ahora deberían funcionar correctamente."
echo ""
echo "Carpeta en Google Drive: $DRIVE_PATH"
echo ""
echo "Para ejecutar un backup manual desde Laravel:"
echo "  docker compose exec app php artisan backups:run"
echo ""
echo "O desde el panel admin:"
echo "  http://localhost:5173/admin/backups"
echo ""
