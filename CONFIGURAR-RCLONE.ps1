# ============================================================================
# 🚀 CONFIGURADOR AUTOMÁTICO DE RCLONE PARA GOOGLE DRIVE
# ============================================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🚀 CONFIGURACIÓN RÁPIDA DE GOOGLE DRIVE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "c:\xampp\htdocs\wedding\boda-backend"

# Paso 1: Verificar contenedores
Write-Host "[1/4] Verificando contenedores..." -ForegroundColor Yellow
$containers = docker compose ps --format "{{.Service}}" 2>$null
if ($containers -notcontains "app") {
    Write-Host "❌ Error: Contenedores no están corriendo" -ForegroundColor Red
    Write-Host "Ejecuta: docker compose up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host "      ✅ Contenedores OK" -ForegroundColor Green
Write-Host ""

# Paso 2: Mostrar instrucciones
Write-Host "[2/4] Preparando configuración..." -ForegroundColor Yellow
Write-Host "      ✅ Listo" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  📋 INSTRUCCIONES SIMPLES" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se abrirá un asistente. Solo responde esto:" -ForegroundColor White
Write-Host ""
Write-Host "  1. n" -ForegroundColor Cyan -NoNewline; Write-Host " (New remote)"
Write-Host "  2. gdrive" -ForegroundColor Cyan -NoNewline; Write-Host " (nombre)"
Write-Host "  3. 15" -ForegroundColor Cyan -NoNewline; Write-Host " (Google Drive)"
Write-Host "  4. [ENTER]" -ForegroundColor Cyan -NoNewline; Write-Host " (client_id vacío)"
Write-Host "  5. [ENTER]" -ForegroundColor Cyan -NoNewline; Write-Host " (client_secret vacío)"
Write-Host "  6. 1" -ForegroundColor Cyan -NoNewline; Write-Host " (Full access)"
Write-Host "  7. [ENTER]" -ForegroundColor Cyan -NoNewline; Write-Host " (root_folder_id vacío)"
Write-Host "  8. [ENTER]" -ForegroundColor Cyan -NoNewline; Write-Host " (service_account vacío)"
Write-Host "  9. n" -ForegroundColor Cyan -NoNewline; Write-Host " (No advanced config)"
Write-Host " 10. n" -ForegroundColor Cyan -NoNewline; Write-Host " (No auto config) " -ForegroundColor White -NoNewline; Write-Host "⚠️ IMPORTANTE" -ForegroundColor Red
Write-Host ""
Write-Host "Luego:" -ForegroundColor Yellow
Write-Host "  → Copia el enlace que aparece" -ForegroundColor White
Write-Host "  → Ábrelo en tu navegador" -ForegroundColor White
Write-Host "  → Inicia sesión: " -ForegroundColor White -NoNewline; Write-Host "miwebdebodas.notificacion@gmail.com" -ForegroundColor Cyan
Write-Host "  → Acepta permisos" -ForegroundColor White
Write-Host "  → Copia el código" -ForegroundColor White
Write-Host "  → Pégalo en la terminal" -ForegroundColor White
Write-Host ""
Write-Host "Finalmente:" -ForegroundColor Yellow
Write-Host "  → y" -ForegroundColor Cyan -NoNewline; Write-Host " (Keep this remote)"
Write-Host "  → q" -ForegroundColor Cyan -NoNewline; Write-Host " (Quit)"
Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

$respuesta = Read-Host "¿Listo para empezar? Escribe 'si' y presiona ENTER"
if ($respuesta -ne "si") {
    Write-Host ""
    Write-Host "Configuración cancelada. Ejecuta el script cuando estés listo." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "[3/4] Iniciando configuración interactiva..." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 1

# Ejecutar rclone config
docker compose exec -it app rclone config

Write-Host ""
Write-Host "[4/4] Verificando configuración..." -ForegroundColor Yellow

# Verificar que se creó la configuración
$checkConfig = docker compose exec app sh -c "test -f /root/.config/rclone/rclone.conf && echo 'exists'" 2>$null
if ($checkConfig -match "exists") {
    Write-Host "      ✅ Archivo de configuración creado" -ForegroundColor Green
    
    # Verificar que gdrive existe
    $showConfig = docker compose exec app rclone listremotes 2>$null
    if ($showConfig -match "gdrive") {
        Write-Host "      ✅ Remote 'gdrive' configurado" -ForegroundColor Green
        
        # Probar conexión
        Write-Host ""
        Write-Host "Probando conexión con Google Drive..." -ForegroundColor Yellow
        $testConnection = docker compose exec app rclone lsd gdrive: 2>&1
        
        if ($testConnection -notmatch "error" -and $testConnection -notmatch "failed") {
            Write-Host "✅ Conexión exitosa!" -ForegroundColor Green
            
            # Crear carpeta de backups
            Write-Host ""
            Write-Host "Creando carpeta de backups..." -ForegroundColor Yellow
            docker compose exec app rclone mkdir gdrive:/backups-miwebdebodas 2>$null
            Write-Host "✅ Carpeta creada: backups-miwebdebodas" -ForegroundColor Green
            
            # Éxito total
            Write-Host ""
            Write-Host "================================================" -ForegroundColor Green
            Write-Host "  🎉 ¡CONFIGURACIÓN EXITOSA!" -ForegroundColor Green
            Write-Host "================================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Ahora configura en el panel admin:" -ForegroundColor White
            Write-Host ""
            Write-Host "  1. Abre: " -ForegroundColor White -NoNewline; Write-Host "http://localhost:5173/admin/backups" -ForegroundColor Cyan
            Write-Host "  2. Ve a: " -ForegroundColor White -NoNewline; Write-Host "Configuración" -ForegroundColor Cyan
            Write-Host "  3. Establece:" -ForegroundColor White
            Write-Host "     Remote: " -ForegroundColor White -NoNewline; Write-Host "gdrive:/backups-miwebdebodas" -ForegroundColor Cyan
            Write-Host "     Habilitar: " -ForegroundColor White -NoNewline; Write-Host "✓" -ForegroundColor Green
            Write-Host "  4. Guarda y prueba con: " -ForegroundColor White -NoNewline; Write-Host "Ejecutar Backup" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "¿Ejecutar un backup de prueba ahora? (s/n): " -ForegroundColor Yellow -NoNewline
            $test = Read-Host
            if ($test -eq "s") {
                Write-Host ""
                docker compose exec app php artisan backups:run
                Write-Host ""
                Write-Host "Verifica en Google Drive:" -ForegroundColor Yellow
                Write-Host "  https://drive.google.com" -ForegroundColor Cyan
                Write-Host ""
            }
        } else {
            Write-Host "⚠️  Configuración guardada pero hay problema de conexión" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Error detectado:" -ForegroundColor Red
            Write-Host $testConnection -ForegroundColor Gray
            Write-Host ""
            Write-Host "Posibles causas:" -ForegroundColor Yellow
            Write-Host "  - Token expiró o es inválido" -ForegroundColor White
            Write-Host "  - Cuenta de Google incorrecta" -ForegroundColor White
            Write-Host "  - Permisos no otorgados" -ForegroundColor White
            Write-Host ""
            Write-Host "Intenta de nuevo:" -ForegroundColor Yellow
            Write-Host "  docker compose exec -it app rclone config reconnect gdrive:" -ForegroundColor Cyan
            Write-Host ""
        }
    } else {
        Write-Host "❌ No se encontró el remote 'gdrive'" -ForegroundColor Red
        Write-Host ""
        Write-Host "Verifica manualmente:" -ForegroundColor Yellow
        Write-Host "  docker compose exec app rclone listremotes" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "❌ No se creó la configuración" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  - Cancelaste el proceso" -ForegroundColor White
    Write-Host "  - No completaste todos los pasos" -ForegroundColor White
    Write-Host ""
    Write-Host "Intenta ejecutar el script de nuevo." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Presiona ENTER para cerrar..." -ForegroundColor Gray
Read-Host
