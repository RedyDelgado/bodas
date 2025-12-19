# Script para descargar una fuente TTF y colocarla en public/fonts/
# Guarda este archivo en: boda-backend/scripts/download-font.ps1
# Ejecución (desde PowerShell en la raíz de boda-backend):
#   powershell -ExecutionPolicy Bypass -File .\scripts\download-font.ps1

try {
    $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $fontsDir = Join-Path $scriptRoot "..\public\fonts"
    $destPath = Join-Path $fontsDir "CormorantGaramond-SemiBold.ttf"

    if (-not (Test-Path -Path $fontsDir)) {
        New-Item -ItemType Directory -Path $fontsDir -Force | Out-Null
        Write-Host "Se creó la carpeta: $fontsDir"
    }

    # URL de una fuente libre (DejaVu Sans) alojada en GitHub raw
    $url = 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf'

    Write-Host "Descargando fuente desde: $url"

    # Intentar descargar con Invoke-WebRequest
    Invoke-WebRequest -Uri $url -OutFile $destPath -UseBasicParsing -ErrorAction Stop

    if (Test-Path -Path $destPath) {
        Write-Host "Fuente descargada correctamente: $destPath"
        Write-Host "(Nota: el archivo se guardó como CormorantGaramond-SemiBold.ttf para que el controlador lo encuentre.)"
        exit 0
    } else {
        Write-Error "La descarga no produjo el archivo esperado."
        exit 1
    }
} catch {
    Write-Error "Error al descargar la fuente: $($_.Exception.Message)"
    exit 2
}
