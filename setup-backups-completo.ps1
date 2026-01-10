# ============================================================================
# Script PowerShell para configurar backups automáticos con Google Drive
# 
# Este script configura completamente el sistema de backups:
# 1. Instala y configura rclone en el contenedor
# 2. Configura la conexión con Google Drive
# 3. Ejecuta una prueba de backup
# 4. Configura la base de datos
#
# Uso: .\setup-backups-completo.ps1
# ============================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN DE BACKUPS AUTOMÁTICOS" -ForegroundColor Cyan
Write-Host "Google Drive: miwebdebodas.notificacion@gmail.com" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del backend
Set-Location "c:\xampp\htdocs\wedding\boda-backend"

# Verificar que los contenedores están corriendo
Write-Host "1. Verificando contenedores..." -ForegroundColor Yellow
$containers = docker compose ps --services --filter "status=running"
if ($containers -notcontains "app") {
    Write-Host "   ❌ El contenedor 'app' no está corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta: docker compose up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Contenedores corriendo" -ForegroundColor Green
Write-Host ""

# Dar permisos de ejecución a los scripts
Write-Host "2. Preparando scripts..." -ForegroundColor Yellow
docker compose exec app chmod +x scripts/setup-rclone-simple.sh
docker compose exec app chmod +x scripts/test-rclone-backup.sh
Write-Host "   ✅ Scripts preparados" -ForegroundColor Green
Write-Host ""

# Verificar si rclone ya está configurado
Write-Host "3. Verificando configuración actual..." -ForegroundColor Yellow
$rcloneCheck = docker compose exec app rclone config show gdrive 2>&1
if ($rcloneCheck -match "gdrive") {
    Write-Host "   ⚠️  rclone ya está configurado" -ForegroundColor Yellow
    Write-Host ""
    $respuesta = Read-Host "   ¿Deseas reconfigurar? (s/n)"
    if ($respuesta -ne "s") {
        Write-Host "   Saltando configuración de rclone" -ForegroundColor Yellow
        $skipRclone = $true
    }
}

if (-not $skipRclone) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "CONFIGURACIÓN DE RCLONE" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
    Write-Host "  1. En la siguiente pantalla, sigue los pasos:" -ForegroundColor White
    Write-Host "     - n (New remote)" -ForegroundColor Gray
    Write-Host "     - name> gdrive" -ForegroundColor Gray
    Write-Host "     - Storage> 15 (Google Drive)" -ForegroundColor Gray
    Write-Host "     - client_id> [ENTER]" -ForegroundColor Gray
    Write-Host "     - client_secret> [ENTER]" -ForegroundColor Gray
    Write-Host "     - scope> 1 (Full access)" -ForegroundColor Gray
    Write-Host "     - root_folder_id> [ENTER]" -ForegroundColor Gray
    Write-Host "     - service_account_file> [ENTER]" -ForegroundColor Gray
    Write-Host "     - Advanced config> n" -ForegroundColor Gray
    Write-Host "     - Use auto config> n" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Te dará un enlace, ábrelo en tu navegador" -ForegroundColor White
    Write-Host "  3. Inicia sesión con: miwebdebodas.notificacion@gmail.com" -ForegroundColor White
    Write-Host "  4. Autoriza el acceso" -ForegroundColor White
    Write-Host "  5. Copia el código y pégalo en la terminal" -ForegroundColor White
    Write-Host "  6. Keep this remote> y" -ForegroundColor Gray
    Write-Host "  7. q (Quit)" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Presiona ENTER para continuar"
    
    # Ejecutar configuración interactiva
    docker compose exec -it app bash scripts/setup-rclone-simple.sh
}

Write-Host ""
Write-Host "4. Ejecutando prueba de backup..." -ForegroundColor Yellow
docker compose exec app bash scripts/test-rclone-backup.sh

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "✅ CONFIGURACIÓN EXITOSA" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Los backups ahora se subirán automáticamente a Google Drive" -ForegroundColor White
    Write-Host ""
    Write-Host "Últimos pasos:" -ForegroundColor Yellow
    Write-Host "  1. Abre el panel admin: http://localhost:5173/admin/backups" -ForegroundColor White
    Write-Host "  2. Ve a la pestaña 'Configuración'" -ForegroundColor White
    Write-Host "  3. Configura:" -ForegroundColor White
    Write-Host "     - Remote de Google Drive: gdrive:/backups-miwebdebodas" -ForegroundColor Cyan
    Write-Host "     - Habilita backups automáticos" -ForegroundColor Cyan
    Write-Host "     - Configura días y horarios" -ForegroundColor Cyan
    Write-Host "  4. Haz clic en 'Guardar Configuración'" -ForegroundColor White
    Write-Host "  5. Prueba con 'Ejecutar Backup'" -ForegroundColor White
    Write-Host ""
    Write-Host "Verifica tus backups en Google Drive:" -ForegroundColor White
    Write-Host "  https://drive.google.com/drive/folders/" -ForegroundColor Cyan
    Write-Host "  Busca la carpeta: backups-miwebdebodas" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "❌ HUBO UN ERROR EN LA CONFIGURACIÓN" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta configurar manualmente:" -ForegroundColor Yellow
    Write-Host "  docker compose exec -it app rclone config" -ForegroundColor White
    Write-Host ""
}
