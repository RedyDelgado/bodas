#!/bin/bash

################################################################################
# CONFIGURADOR AUTOMÁTICO DE RCLONE PARA GOOGLE DRIVE
# Script alternativo para ejecutar dentro del contenedor
################################################################################

echo ""
echo "================================================"
echo "  🚀 CONFIGURACIÓN RÁPIDA DE RCLONE"
echo "================================================"
echo ""

# Crear directorio de configuración
mkdir -p /root/.config/rclone

# Verificar si ya existe
if [ -f /root/.config/rclone/rclone.conf ] && grep -q "\[gdrive\]" /root/.config/rclone/rclone.conf; then
    echo "⚠️  Ya existe configuración de 'gdrive'"
    echo ""
    read -p "¿Reconfigurar? (s/n): " reconfig
    if [ "$reconfig" != "s" ]; then
        echo "Configuración cancelada"
        exit 0
    fi
    echo ""
fi

echo "================================================"
echo "  📋 RESPONDE ASÍ:"
echo "================================================"
echo ""
echo "  n                  (New remote)"
echo "  gdrive             (name)"
echo "  15                 (Google Drive)"
echo "  [ENTER]            (client_id)"
echo "  [ENTER]            (client_secret)"
echo "  1                  (scope: full access)"
echo "  [ENTER]            (root_folder_id)"
echo "  [ENTER]            (service_account)"
echo "  n                  (advanced config)"
echo "  n                  (auto config) ⚠️ IMPORTANTE"
echo ""
echo "Luego copia el enlace en tu navegador"
echo "Cuenta: miwebdebodas.notificacion@gmail.com"
echo ""
echo "Finalmente:"
echo "  y                  (keep remote)"
echo "  q                  (quit)"
echo ""
read -p "Presiona ENTER para continuar..."
echo ""

# Ejecutar configuración
rclone config

echo ""
echo "================================================"
echo "  ✅ VERIFICANDO"
echo "================================================"
echo ""

# Verificar
if rclone listremotes | grep -q "gdrive:"; then
    echo "✅ Remote 'gdrive' configurado"
    echo ""
    
    # Probar conexión
    if rclone lsd gdrive: > /dev/null 2>&1; then
        echo "✅ Conexión exitosa con Google Drive"
        echo ""
        
        # Crear carpeta
        rclone mkdir gdrive:/backups-miwebdebodas 2>/dev/null || true
        echo "✅ Carpeta de backups creada"
        echo ""
        
        echo "================================================"
        echo "  🎉 ¡CONFIGURACIÓN EXITOSA!"
        echo "================================================"
        echo ""
        echo "Remote configurado: gdrive:/backups-miwebdebodas"
        echo ""
        echo "Próximos pasos:"
        echo "  1. Panel admin → Configuración"
        echo "  2. Remote: gdrive:/backups-miwebdebodas"
        echo "  3. Habilitar backups automáticos"
        echo ""
    else
        echo "⚠️  Configuración guardada pero no se puede conectar"
        echo ""
        echo "Verifica:"
        echo "  rclone config show gdrive"
        echo "  rclone lsd gdrive:"
        echo ""
    fi
else
    echo "❌ No se encontró 'gdrive'"
    echo ""
    echo "Verifica: rclone listremotes"
    echo ""
fi
