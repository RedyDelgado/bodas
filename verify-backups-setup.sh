#!/bin/bash

# Script de verificación del módulo de backups
# Uso: bash verify-backups-setup.sh

echo "=========================================="
echo "VERIFICACIÓN DE MÓDULO DE BACKUPS"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador
CHECKS=0
PASSED=0

check_file() {
  local file=$1
  local description=$2
  CHECKS=$((CHECKS + 1))
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $description (No encontrado: $file)"
  fi
}

check_dir() {
  local dir=$1
  local description=$2
  CHECKS=$((CHECKS + 1))
  
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✓${NC} $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $description (No encontrado: $dir)"
  fi
}

# ==========================================
echo "1. MIGRACIONES"
echo "==========================================
"
check_file "boda-backend/database/migrations/2026_01_07_000001_create_backup_settings_table.php" "Migración: backup_settings"
check_file "boda-backend/database/migrations/2026_01_07_000002_create_backup_runs_table.php" "Migración: backup_runs"
echo ""

# ==========================================
echo "2. MODELOS ELOQUENT"
echo "=========================================="
echo ""
check_file "boda-backend/app/Models/BackupSetting.php" "Modelo: BackupSetting"
check_file "boda-backend/app/Models/BackupRun.php" "Modelo: BackupRun"
echo ""

# ==========================================
echo "3. SERVICIOS & LÓGICA"
echo "=========================================="
echo ""
check_file "boda-backend/app/Services/BackupService.php" "Servicio: BackupService"
check_file "boda-backend/app/Jobs/RunBackupJob.php" "Job: RunBackupJob"
check_file "boda-backend/app/Console/Commands/BackupsRunCommand.php" "Command: backups:run"
echo ""

# ==========================================
echo "4. CONTROLADOR & RUTAS"
echo "=========================================="
echo ""
check_file "boda-backend/app/Http/Controllers/Admin/BackupController.php" "Controlador: BackupController"
echo ""

# ==========================================
echo "5. SCHEDULER"
echo "=========================================="
echo ""
if grep -q "checkAndRunBackup" "boda-backend/app/Console/Kernel.php" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Scheduler configurado en Kernel.php"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Scheduler NO configurado en Kernel.php"
fi
CHECKS=$((CHECKS + 1))
echo ""

# ==========================================
echo "6. DOCKER"
echo "=========================================="
echo ""
if grep -q "rclone" "boda-backend/Dockerfile" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} rclone agregado a Dockerfile"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} rclone NO está en Dockerfile"
fi
CHECKS=$((CHECKS + 1))

if grep -q "mysql-client" "boda-backend/Dockerfile" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} mysql-client agregado a Dockerfile"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} mysql-client NO está en Dockerfile"
fi
CHECKS=$((CHECKS + 1))

check_file "boda-backend/docker/entrypoint.sh" "Script entrypoint.sh"
echo ""

# ==========================================
echo "7. FRONTEND"
echo "=========================================="
echo ""
check_file "boda-frontend/src/components/Admin/BackupAdmin.jsx" "Componente React: BackupAdmin"
echo ""

# ==========================================
echo "8. DOCUMENTACIÓN"
echo "=========================================="
echo ""
check_file "docs/GUIA_BACKUPS_AUTOMATICOS.md" "Guía: Setup rclone"
check_file "docs/IMPLEMENTACION_BACKUPS_COMPLETA.md" "Documentación: Implementación"
echo ""

# ==========================================
echo "9. VERIFICACIÓN DE RUTAS API"
echo "=========================================="
echo ""
if grep -q "Route::get('/settings', \[BackupController" "boda-backend/routes/api.php" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Rutas API agregadas (/admin/backups/*)"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Rutas API NO están en routes/api.php"
fi
CHECKS=$((CHECKS + 1))
echo ""

# ==========================================
echo "RESUMEN"
echo "=========================================="
echo -e "Verificaciones: ${GREEN}$PASSED${NC}/${YELLOW}$CHECKS${NC} pasadas"
echo ""

if [ $PASSED -eq $CHECKS ]; then
  echo -e "${GREEN}✓ IMPLEMENTACIÓN COMPLETA${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "  1. docker-compose down"
  echo "  2. docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d"
  echo "  3. docker exec boda_app php artisan migrate"
  echo "  4. docker exec -it boda_app bash"
  echo "  5. rclone config"
  echo "  6. Acceder a UI Admin → Backups"
  echo ""
  exit 0
else
  echo -e "${YELLOW}⚠ FALTAN ARCHIVOS${NC}"
  echo "Revisa los archivos marcados con ${RED}✗${NC}"
  echo ""
  exit 1
fi
