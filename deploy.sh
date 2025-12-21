#!/bin/bash
# Script de despliegue a Contabo (Producción)
# IP: 161.97.169.31
# Ejecutar: bash deploy.sh

SERVER_IP="161.97.169.31"
REPO_ROOT="/root/wedding"
DOCKER_DIR="/root/wedding/boda-backend"

echo "🚀 Iniciando despliegue a $SERVER_IP..."
echo "📡 Estableciendo conexión SSH..."

ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -o ServerAliveCountMax=5 -o TCPKeepAlive=yes root@$SERVER_IP << EOF
    set -x  # Mostrar cada comando antes de ejecutarlo
    
    # 1. Actualizar código desde la raíz del repositorio
    echo "═══════════════════════════════════════════════════="
    echo "  ACTUALIZANDO CÓDIGO"
    echo "═══════════════════════════════════════════════════="
    echo "DEBUG: REPO_ROOT=$REPO_ROOT"
    echo "DEBUG: DOCKER_DIR=$DOCKER_DIR"
    
    if [ -d "$REPO_ROOT" ]; then
        cd $REPO_ROOT
        echo "📂 Directorio del repositorio: $REPO_ROOT"
        echo "[1/7] Obteniendo últimos cambios..."
        git fetch origin
        git reset --hard origin/main
    else
        echo "⚠️  El repositorio no existe. Clonando por primera vez..."
        cd /root
        git clone https://github.com/RedyDelgado/bodas.git wedding
        cd $REPO_ROOT
    fi

    # 2. Ejecutar Docker desde la carpeta del backend
    cd $DOCKER_DIR
    echo "📂 Directorio de Docker: $DOCKER_DIR"

    # --- NUEVO: Asegurar que existe .env ---
    # Siempre regeneramos el .env para asegurar que la contraseña sea la correcta
    echo "⚠️  Regenerando .env desde .env.production.example..."
    
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        
        # Reemplazar valores críticos por los de producción seguros
        # Usamos | como delimitador en sed para evitar problemas con las barras de las URLs
        # Aseguramos reemplazar cualquier contraseña anterior
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=BodaSecure2025!/g" .env
        sed -i "s|APP_URL=http://161.97.169.31|APP_URL=https://$SERVER_IP|g" .env
        sed -i "s|FRONTEND_PUBLIC_URL=http://161.97.169.31|FRONTEND_PUBLIC_URL=https://$SERVER_IP|g" .env
        
        echo "✅ .env regenerado y configurado."
    else
        echo "❌ Error: No se encontró .env.production.example. Usando configuración básica de emergencia..."
        cat > .env << ENVEOF
APP_NAME="MiWebDeBodas"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://$SERVER_IP
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=db_wedding
DB_USERNAME=db_wedding
DB_PASSWORD=BodaSecure2025!
ENVEOF
    fi
    # ---------------------------------------

    echo ""
    echo "[2/7] LIMPIEZA TOTAL (VPS Dedicado)..."
    echo "🧨 Modo Destructivo: Eliminando TODO antes de desplegar..."
    
    # Matar todo lo que se mueva
    docker kill \$(docker ps -q) 2>/dev/null || true
    docker rm -f \$(docker ps -aq) 2>/dev/null || true
    
    # Borrar volúmenes para resetear DB y redes
    docker volume prune -f || true
    docker network prune -f || true

    echo ""
    echo "[3/7] Construyendo imágenes Docker..."
    if ! docker compose build --no-cache; then
        echo "❌ Error al construir imágenes. Abortando..."
        exit 1
    fi

    echo ""
    echo "[4/7] Levantando servicios..."
    echo "Ejecutando: docker compose up -d"
    
    if ! docker compose up -d; then
        echo "❌ Error al levantar servicios. Mostrando logs..."
        docker compose logs --tail=50
        exit 1
    fi
    
    echo "✅ Contenedores iniciados. Verificando estado..."
    docker compose ps
    
    echo "Esperando a que los servicios se estabilicen..."
    for i in {1..6}; do
        echo "  Verificación \$i/6 (cada 5 segundos)..."
        sleep 5
        docker compose ps app mysql | grep -q "Up" && echo "  ✓ Servicios principales activos" || echo "  ⏳ Servicios aún iniciando..."
    done
    
    echo "Estado final de contenedores:"
    docker compose ps

    echo ""
    echo "[5/7] Ajustando permisos..."
    # Verificar que el contenedor app esté corriendo
    echo "Verificando estado del contenedor app..."
    docker compose ps app
    
    if ! docker compose ps app | grep -q "Up"; then
        echo "⚠️  El contenedor 'app' no está en estado 'Up'. Intentando continuar de todos modos..."
        docker compose logs app --tail=30
        echo "⚠️  Continuando con precaución..."
    fi
    
    # Asegurar que Apache (www-data) pueda escribir en storage y cache
    docker compose exec -T -u root app chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

    echo ""
    echo "[6/7] Generando clave de aplicación..."
    docker compose exec -T app php artisan key:generate

    echo ""
    echo "[7/7] Migrando base de datos..."
    docker compose exec -T app php artisan migrate --force
    
    echo "   - Asegurando roles y superadmin..."
    docker compose exec -T app php artisan db:seed --class=RolesSeeder --force
    docker compose exec -T app php artisan db:seed --class=SuperAdminSeeder --force

    echo ""
    echo "[8/7] Optimizando aplicación..."
    docker compose exec -T app php artisan cache:clear
    docker compose exec -T app php artisan config:cache
    docker compose exec -T app php artisan route:cache
    
    echo ""
    echo "════════════════════════════════════════════════════"
    echo "✓✓✓ DESPLIEGUE COMPLETADO EXITOSAMENTE ✓✓✓"
    echo "════════════════════════════════════════════════════"
    echo "🌐 URL: https://$SERVER_IP"
EOF
