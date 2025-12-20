# Script de Desarrollo Local - MiWebDeBodas
# Uso: .\dev-local.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Desarrollo Local - MiWebDeBodas" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si Docker está corriendo
Write-Host "[1/4] Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está corriendo. Inicia Docker Desktop primero." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Iniciar servicios del backend (sin frontend)
Write-Host "[2/4] Iniciando servicios del backend..." -ForegroundColor Yellow
Set-Location "c:\xampp\htdocs\wedding\boda-backend"
docker-compose up -d app mysql phpmyadmin traefik
Start-Sleep -Seconds 5
Write-Host "✅ Backend iniciado" -ForegroundColor Green
Write-Host ""

# 3. Limpiar caché de Laravel
Write-Host "[3/4] Limpiando caché de Laravel..." -ForegroundColor Yellow
docker-compose exec -T app php artisan config:clear 2>&1 | Out-Null
docker-compose exec -T app php artisan cache:clear 2>&1 | Out-Null
Write-Host "✅ Caché limpiado" -ForegroundColor Green
Write-Host ""

# 4. Verificar si el superadmin existe
Write-Host "[4/4] Verificando superadministrador..." -ForegroundColor Yellow
$superadmin = docker-compose exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM users WHERE email='redy.delgado@gmail.com';" 2>$null
if ($superadmin -eq 0 -or $superadmin -eq $null) {
    Write-Host "⚠️  Creando superadministrador..." -ForegroundColor Yellow
    docker-compose exec app php artisan db:seed --class=SuperAdminSeeder
} else {
    Write-Host "✅ Superadministrador existe" -ForegroundColor Green
}
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Backend listo!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs del Backend:" -ForegroundColor White
Write-Host "  API: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "  PHPMyAdmin: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor White
Write-Host "  Email: redy.delgado@gmail.com" -ForegroundColor Yellow
Write-Host "  Password: R3DY-ARDOS" -ForegroundColor Yellow
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Preguntar si quiere iniciar el frontend
$respuesta = Read-Host "¿Iniciar el frontend en modo desarrollo? (S/N)"
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "Iniciando frontend..." -ForegroundColor Yellow
    Write-Host "Presiona Ctrl+C para detener el frontend cuando termines" -ForegroundColor Gray
    Write-Host ""
    Start-Sleep -Seconds 2
    
    Set-Location "c:\xampp\htdocs\wedding\boda-frontend"
    npm run dev
} else {
    Write-Host ""
    Write-Host "Para iniciar el frontend manualmente:" -ForegroundColor White
    Write-Host "  cd c:\xampp\htdocs\wedding\boda-frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
}
