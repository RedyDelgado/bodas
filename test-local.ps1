# Script de Pruebas Locales - MiWebDeBodas
# Ejecutar: .\test-local.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Pruebas Locales - MiWebDeBodas" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del backend
Set-Location "c:\xampp\htdocs\wedding\boda-backend"

# 1. Verificar contenedores
Write-Host "[1/7] Verificando contenedores..." -ForegroundColor Yellow
docker-compose ps
Write-Host ""

# 2. Limpiar caché
Write-Host "[2/7] Limpiando caché de Laravel..." -ForegroundColor Yellow
docker-compose exec app php artisan config:clear | Out-Null
docker-compose exec app php artisan cache:clear | Out-Null
Write-Host "✅ Caché limpiado" -ForegroundColor Green
Write-Host ""

# 3. Verificar base de datos
Write-Host "[3/7] Verificando datos en base de datos..." -ForegroundColor Yellow
$roles = docker-compose exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM roles;" 2>$null
$planes = docker-compose exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM planes;" 2>$null
$plantillas = docker-compose exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM plantillas;" 2>$null
$users = docker-compose exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM users;" 2>$null
$superadmin = docker-compose exec -T mysql mysql -u db_wedding -psecret123 db_wedding -se "SELECT COUNT(*) FROM users WHERE email='redy.delgado@gmail.com';" 2>$null

Write-Host "   Roles: $roles" -ForegroundColor White
Write-Host "   Planes: $planes" -ForegroundColor White
Write-Host "   Plantillas: $plantillas" -ForegroundColor White
Write-Host "   Usuarios: $users" -ForegroundColor White
Write-Host "   Superadmin: $superadmin" -ForegroundColor White

if ($superadmin -eq 0) {
    Write-Host "   ⚠️  Creando superadministrador..." -ForegroundColor Yellow
    docker-compose exec app php artisan db:seed --class=SuperAdminSeeder
}
Write-Host ""

# 4. Probar APIs
Write-Host "[4/7] Probando APIs públicas..." -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:8000/api/public/planes" -UseBasicParsing
    Write-Host "   ✅ /api/public/planes: $($response1.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ /api/public/planes: Error" -ForegroundColor Red
}

try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:8000/api/public/plantillas" -UseBasicParsing
    Write-Host "   ✅ /api/public/plantillas: $($response2.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ /api/public/plantillas: Error" -ForegroundColor Red
}

try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:8000/api/public/faqs" -UseBasicParsing
    Write-Host "   ✅ /api/public/faqs: $($response3.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ /api/public/faqs: Error" -ForegroundColor Red
}
Write-Host ""

# 5. Probar login
Write-Host "[5/7] Probando login de superadministrador..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "redy.delgado@gmail.com"
        password = "R3DY-ARDOS"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        Write-Host "   ✅ Login exitoso" -ForegroundColor Green
        Write-Host "   Token: $($loginData.token.Substring(0, 20))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Login falló: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Verificar frontend
Write-Host "[6/7] Verificando frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Frontend: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend: Error" -ForegroundColor Red
}
Write-Host ""

# 7. Resumen
Write-Host "[7/7] Resumen" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs Locales:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "  PHPMyAdmin: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor White
Write-Host "  Email: redy.delgado@gmail.com" -ForegroundColor Yellow
Write-Host "  Password: R3DY-ARDOS" -ForegroundColor Yellow
Write-Host ""
Write-Host "Páginas para probar:" -ForegroundColor White
Write-Host "  1. Landing Page: http://localhost:5173/" -ForegroundColor Gray
Write-Host "  2. Login: http://localhost:5173/login" -ForegroundColor Gray
Write-Host "  3. Registro: http://localhost:5173/registro" -ForegroundColor Gray
Write-Host "  4. Recuperar Contraseña: http://localhost:5173/forgot-password" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Pruebas completadas" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Enter para abrir el navegador..."
Read-Host
Start-Process "http://localhost:5173"
