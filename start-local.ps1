# Script para iniciar todo el entorno localmente (Dockerizado)
# Uso: .\start-local.ps1

Write-Host "🚀 Iniciando entorno local completo (Backend + Frontend)..." -ForegroundColor Cyan

# Asegurarnos de estar en la carpeta correcta
if (Test-Path "boda-backend") {
    Set-Location "boda-backend"
} elseif (Test-Path "..\boda-backend") {
    Set-Location "..\boda-backend"
}

# Detener contenedores anteriores
Write-Host "🛑 Deteniendo contenedores anteriores..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# Iniciar todo con la configuración de desarrollo
Write-Host "🏗️  Construyendo e iniciando servicios..." -ForegroundColor Yellow
# Usamos -f para combinar la config base con la de desarrollo
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Esperar un poco a que arranque
Start-Sleep -Seconds 5

# Instalar dependencias de desarrollo (necesarias para entorno local)
Write-Host "📦 Instalando dependencias de desarrollo..." -ForegroundColor Yellow
docker-compose exec -T app composer install

# Ejecutar migraciones y seeders si es necesario
Write-Host "🗄️  Verificando base de datos..." -ForegroundColor Yellow
docker-compose exec -T app php artisan migrate --force
# Opcional: Seeders
# docker-compose exec -T app php artisan db:seed

Write-Host ""
Write-Host "✅ ¡Entorno Local Listo!" -ForegroundColor Green
Write-Host "=================================================="
Write-Host "🌍 Frontend:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 API:        http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "🗄️  PHPMyAdmin: http://localhost:8080" -ForegroundColor Cyan
Write-Host "=================================================="
