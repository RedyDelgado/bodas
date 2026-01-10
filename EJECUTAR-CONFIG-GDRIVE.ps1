# ============================================================================
# 🎯 EJECUTAR AHORA - Configurar Google Drive para Backups
# ============================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "⚡ CONFIGURACIÓN DE GOOGLE DRIVE" -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar contenedores
Write-Host "1. Verificando contenedores..." -ForegroundColor Yellow
Set-Location "c:\xampp\htdocs\wedding\boda-backend"
$running = docker compose ps --services --filter "status=running" | Select-String "app"
if (-not $running) {
    Write-Host "   ❌ Contenedores no están corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta: docker compose up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Contenedores OK" -ForegroundColor Green
Write-Host ""

# Verificar rclone
Write-Host "2. Verificando rclone..." -ForegroundColor Yellow
$rclone = docker compose exec app which rclone 2>&1 | Select-String "rclone"
if (-not $rclone) {
    Write-Host "   ❌ rclone no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ rclone instalado" -ForegroundColor Green
Write-Host ""

# Instrucciones claras
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📋 INSTRUCCIONES PARA LA CONFIGURACIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "En la siguiente pantalla, responde ASÍ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  e/n/d/r/c/s/q>" -NoNewline; Write-Host " n" -ForegroundColor Green -NoNewline; Write-Host " (New remote)"
Write-Host "  name>" -NoNewline; Write-Host " gdrive" -ForegroundColor Green
Write-Host "  Storage>" -NoNewline; Write-Host " 15" -ForegroundColor Green -NoNewline; Write-Host " (Google Drive)"
Write-Host "  client_id>" -NoNewline; Write-Host " [ENTER vacío]" -ForegroundColor Green
Write-Host "  client_secret>" -NoNewline; Write-Host " [ENTER vacío]" -ForegroundColor Green
Write-Host "  scope>" -NoNewline; Write-Host " 1" -ForegroundColor Green -NoNewline; Write-Host " (Full access)"
Write-Host "  root_folder_id>" -NoNewline; Write-Host " [ENTER vacío]" -ForegroundColor Green
Write-Host "  service_account_file>" -NoNewline; Write-Host " [ENTER vacío]" -ForegroundColor Green
Write-Host "  Edit advanced config>" -NoNewline; Write-Host " n" -ForegroundColor Green
Write-Host "  Use auto config>" -NoNewline; Write-Host " n" -ForegroundColor Green -NoNewline; Write-Host " (¡IMPORTANTE!)"
Write-Host ""
Write-Host "Luego te dará un ENLACE:" -ForegroundColor Yellow
Write-Host "  1. Cópialo y ábrelo en tu navegador" -ForegroundColor White
Write-Host "  2. Inicia sesión con: " -NoNewline; Write-Host "miwebdebodas.notificacion@gmail.com" -ForegroundColor Cyan
Write-Host "  3. Acepta los permisos" -ForegroundColor White
Write-Host "  4. Copia el código de verificación" -ForegroundColor White
Write-Host "  5. Pégalo donde dice 'Enter verification code>'" -ForegroundColor White
Write-Host ""
Write-Host "Finalmente:" -ForegroundColor Yellow
Write-Host "  Keep this 'gdrive' remote>" -NoNewline; Write-Host " y" -ForegroundColor Green
Write-Host "  e/n/d/r/c/s/q>" -NoNewline; Write-Host " q" -ForegroundColor Green -NoNewline; Write-Host " (Quit)"
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$respuesta = Read-Host "¿Estás listo para configurar? (s/n)"
if ($respuesta -ne "s") {
    Write-Host ""
    Write-Host "OK, ejecuta este script cuando estés listo:" -ForegroundColor Yellow
    Write-Host "  .\EJECUTAR-CONFIG-GDRIVE.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 Iniciando configuración..." -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

# Ejecutar configuración
docker compose exec -it app rclone config

# Verificar resultado
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ VERIFICANDO CONFIGURACIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$config = docker compose exec app rclone config show gdrive 2>&1
if ($config -match "\[gdrive\]") {
    Write-Host "✅ ¡Configuración exitosa!" -ForegroundColor Green
    Write-Host ""
    
    # Crear carpeta de backups
    Write-Host "Creando carpeta de backups..." -ForegroundColor Yellow
    docker compose exec app rclone mkdir gdrive:/backups-miwebdebodas 2>&1 | Out-Null
    
    # Probar listado
    Write-Host "Probando conexión..." -ForegroundColor Yellow
    $test = docker compose exec app rclone lsd gdrive: 2>&1
    if ($test -match "backups-miwebdebodas" -or $test -notmatch "error") {
        Write-Host "✅ Conexión verificada con Google Drive" -ForegroundColor Green
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "🎉 ¡CONFIGURACIÓN COMPLETADA!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ahora ve al panel admin y configura:" -ForegroundColor Yellow
        Write-Host "  URL: " -NoNewline; Write-Host "http://localhost:5173/admin/backups" -ForegroundColor Cyan
        Write-Host "  Remote: " -NoNewline; Write-Host "gdrive:/backups-miwebdebodas" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "¿Quieres ejecutar un backup de prueba? (s/n): " -NoNewline -ForegroundColor Yellow
        $test = Read-Host
        if ($test -eq "s") {
            Write-Host ""
            Write-Host "Ejecutando backup de prueba..." -ForegroundColor Yellow
            docker compose exec app php artisan backups:run
            Write-Host ""
            Write-Host "Verifica en Google Drive:" -ForegroundColor Yellow
            Write-Host "  https://drive.google.com" -ForegroundColor Cyan
            Write-Host "  Carpeta: backups-miwebdebodas" -ForegroundColor Cyan
            Write-Host ""
        }
    } else {
        Write-Host "⚠️  Configuración guardada pero no se pudo verificar conexión" -ForegroundColor Yellow
        Write-Host "Intenta manualmente:" -ForegroundColor Yellow
        Write-Host "  docker compose exec app rclone lsd gdrive:" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "❌ No se detectó la configuración 'gdrive'" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica manualmente:" -ForegroundColor Yellow
    Write-Host "  docker compose exec app rclone config show" -ForegroundColor White
    Write-Host ""
}

Write-Host "Presiona ENTER para salir..." -ForegroundColor Gray
Read-Host
