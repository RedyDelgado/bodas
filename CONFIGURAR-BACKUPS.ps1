# ============================================================================
# 🚀 INICIO RÁPIDO - Configurar Backups a Google Drive
# 
# Este script ejecuta automáticamente la configuración de rclone
# ============================================================================

Write-Host ""
Write-Host "🚀 CONFIGURACIÓN DE BACKUPS A GOOGLE DRIVE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script configurará rclone para subir backups automáticamente" -ForegroundColor White
Write-Host "a tu cuenta: miwebdebodas.notificacion@gmail.com" -ForegroundColor Yellow
Write-Host ""
Read-Host "Presiona ENTER para continuar"

# Ejecutar el script completo
& "c:\xampp\htdocs\wedding\setup-backups-completo.ps1"
