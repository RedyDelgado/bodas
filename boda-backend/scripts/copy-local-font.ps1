# Copia la primera fuente disponible desde C:\Windows\Fonts a public/fonts/CormorantGaramond-SemiBold.ttf
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$fontsDir = Join-Path $scriptRoot "..\public\fonts"
$destPath = Join-Path $fontsDir "CormorantGaramond-SemiBold.ttf"

if (-not (Test-Path -Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir -Force | Out-Null
}

$candidates = @(
    'C:\Windows\Fonts\CormorantGaramond-SemiBold.ttf',
    'C:\Windows\Fonts\CormorantGaramond-Regular.ttf',
    'C:\Windows\Fonts\arial.ttf',
    'C:\Windows\Fonts\calibri.ttf',
    'C:\Windows\Fonts\times.ttf',
    'C:\Windows\Fonts\cour.ttf',
    'C:\Windows\Fonts\DejaVuSans.ttf'
)

$found = $false
foreach ($f in $candidates) {
    if (Test-Path $f) {
        Copy-Item -Path $f -Destination $destPath -Force
        Write-Host "Copiado: $f -> $destPath"
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Error "No se encontró ninguna fuente en las rutas comunes: $($candidates -join ', ')"
    exit 2
}
