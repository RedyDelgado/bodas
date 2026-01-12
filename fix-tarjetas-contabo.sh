#!/bin/bash

#  ============================================
#  SCRIPT DE DIAGNÓSTICO Y REPARACIÓN
#  Generación de Tarjetas en Contabo
#  ============================================

set -e

APP_PATH="${1:-.}"
BACKUP_DIR="$APP_PATH/backups/env-$(date +%Y%m%d_%H%M%S)"

echo "🔍 DIAGNÓSTICO: Generación de Tarjetas"
echo "======================================="
echo ""

# ✅ Paso 1: Verificar estructura
echo "[1/5] Verificando estructura..."
if [ ! -f "$APP_PATH/.env" ]; then
    echo "❌ ERROR: No se encontró .env en $APP_PATH"
    exit 1
fi
echo "✅ Archivo .env encontrado"

# ✅ Paso 2: Verificar configuración actual
echo ""
echo "[2/5] Verificando configuración de queue..."
QUEUE_CONFIG=$(grep "^QUEUE_CONNECTION" "$APP_PATH/.env" || echo "QUEUE_CONNECTION=NOTFOUND")
echo "Configuración actual: $QUEUE_CONFIG"

if [[ $QUEUE_CONFIG == *"database"* ]]; then
    echo "⚠️  PROBLEMA DETECTADO: QUEUE_CONNECTION=database sin worker"
    echo ""
    echo "📋 Soluciones disponibles:"
    echo ""
    echo "   Opción 1: Cambiar a SYNC (recomendado para Contabo)"
    echo "   Opción 2: Instalar y configurar Supervisor"
    echo "   Opción 3: Ver documentación completa"
    echo ""
    read -p "¿Qué opción prefieres? (1/2/3): " option
    
    case $option in
        1)
            echo ""
            echo "[3/5] Haciendo backup de .env..."
            mkdir -p "$BACKUP_DIR"
            cp "$APP_PATH/.env" "$BACKUP_DIR/.env.backup"
            echo "✅ Backup guardado en: $BACKUP_DIR"
            
            echo ""
            echo "[4/5] Actualizando configuración..."
            sed -i.bak 's/^QUEUE_CONNECTION=database/QUEUE_CONNECTION=sync/' "$APP_PATH/.env"
            echo "✅ Cambio aplicado"
            
            echo ""
            echo "[5/5] Limpiando cachés..."
            cd "$APP_PATH"
            php artisan config:cache 2>/dev/null || true
            php artisan cache:clear 2>/dev/null || true
            echo "✅ Cachés limpiados"
            
            echo ""
            echo "✅ ¡LISTO!"
            echo ""
            echo "Cambios realizados:"
            echo "  QUEUE_CONNECTION=database → QUEUE_CONNECTION=sync"
            echo ""
            echo "Próximos pasos:"
            echo "  1. Reinicia el contenedor/app: docker compose restart app"
            echo "  2. Prueba generando tarjetas"
            echo "  3. El progreso debería avanzar lentamente hasta completar"
            ;;
        2)
            echo ""
            echo "📖 Instalar Supervisor:"
            echo ""
            echo "1. Conecta por SSH a tu servidor:"
            echo "   ssh root@161.97.169.31"
            echo ""
            echo "2. Ejecuta:"
            echo "   apt-get update"
            echo "   apt-get install -y supervisor"
            echo ""
            echo "3. Crea el archivo de configuración:"
            echo "   nano /etc/supervisor/conf.d/laravel-worker.conf"
            echo ""
            echo "4. Pega (cambia las rutas según tu instalación):"
            cat << 'EOF'
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/a/boda-backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
stopwaitsecs=60
numprocs=4
redirect_stderr=true
stdout_logfile=/ruta/a/boda-backend/storage/logs/worker.log
environment=PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",HOME="/root",LOGNAME="root"
EOF
            echo ""
            echo "5. Activa:"
            echo "   supervisorctl reread"
            echo "   supervisorctl update"
            echo "   supervisorctl start laravel-worker:*"
            echo ""
            ;;
        3)
            echo ""
            echo "📄 Abriendo documentación..."
            echo "Archivo: $APP_PATH/docs/SOLUCION_GENERACION_TARJETAS_CONTABO.md"
            cat "$APP_PATH/docs/SOLUCION_GENERACION_TARJETAS_CONTABO.md"
            ;;
        *)
            echo "❌ Opción no válida"
            exit 1
            ;;
    esac
else
    echo "✅ Configuración OK: $QUEUE_CONFIG"
    echo ""
    echo "Verificando si el sistema funciona..."
    
    if [ -f "$APP_PATH/artisan" ]; then
        php "$APP_PATH/artisan" config:cache 2>/dev/null || true
        echo "✅ Sistema listo"
    fi
fi

echo ""
echo "🎉 Diagnóstico completado"
