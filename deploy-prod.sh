#!/bin/bash
# deploy-prod.sh
# Despliegue seguro (NO borra BD ni fotos) para ejecutar EN EL SERVIDOR.
# Uso:
#   cd /root/wedding/boda-backend
#   bash deploy-prod.sh
#
# Opcionales:
#   BRANCH=main bash deploy-prod.sh
#   COMPOSE_FILE=docker-compose.yml bash deploy-prod.sh
#   SKIP_FRONTEND=1 bash deploy-prod.sh

set -Eeuo pipefail

# ───────────────────────────────
# Config
# ───────────────────────────────
REPO_DIR="${REPO_DIR:-/root/wedding}"
BACKEND_DIR="${BACKEND_DIR:-$REPO_DIR/boda-backend}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"          # relativo a BACKEND_DIR
PROJECT_NAME="${PROJECT_NAME:-boda}"                       # solo para mensajes/log
SKIP_FRONTEND="${SKIP_FRONTEND:-0}"

# Rutas que NO deben perderse aunque uses git reset (certificados, env, storage, mysql data)
PRESERVE_PATHS=(
  "$BACKEND_DIR/.env"
  "$BACKEND_DIR/docker/traefik/letsencrypt/acme.json"
  "$BACKEND_DIR/storage"
  "$BACKEND_DIR/.docker/mysql"
)

TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="/root/_deploy_backups/${PROJECT_NAME}-${TS}"
mkdir -p "$BACKUP_DIR"

log() { echo -e "[$(date +%F' '%T)] $*"; }

die() { echo -e "ERROR: $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Falta comando requerido: $1"
}

# ───────────────────────────────
# Pre-checks
# ───────────────────────────────
require_cmd git
require_cmd docker

cd "$REPO_DIR" || die "No existe REPO_DIR=$REPO_DIR"
[ -d "$REPO_DIR/.git" ] || die "No es un repo git: $REPO_DIR"
[ -d "$BACKEND_DIR" ] || die "No existe BACKEND_DIR=$BACKEND_DIR"
[ -f "$BACKEND_DIR/$COMPOSE_FILE" ] || die "No existe compose: $BACKEND_DIR/$COMPOSE_FILE"

# docker compose v2
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
else
  require_cmd docker-compose
  DC="docker-compose"
fi

log "🚀 Deploy PROD (seguro) iniciado"
log "Repo: $REPO_DIR | Backend: $BACKEND_DIR | Branch: $BRANCH | Compose: $COMPOSE_FILE"

# ───────────────────────────────
# 1) Backup de archivos críticos
# ───────────────────────────────
log "📦 Backup de paths críticos -> $BACKUP_DIR"
for p in "${PRESERVE_PATHS[@]}"; do
  if [ -e "$p" ]; then
    dest="$BACKUP_DIR$(dirname "$p")"
    mkdir -p "$dest"
    cp -a "$p" "$dest/" || true
    log "  ✓ respaldado: $p"
  else
    log "  - no existe: $p (ok)"
  fi
done

# ───────────────────────────────
# 2) Actualizar código (forzando a la rama, sin borrar untracked)
# ───────────────────────────────
log "🔄 Actualizando código desde origin/$BRANCH"
git fetch --all --prune

git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -b "$BRANCH" "origin/$BRANCH"

# OJO: reset hard no borra UNTRACKED. No usamos git clean aquí.
git reset --hard "origin/$BRANCH"

# ───────────────────────────────
# 3) Restaurar archivos críticos (por si fueran trackeados o sobrescritos)
# ───────────────────────────────
log "🧩 Restaurando archivos críticos (si aplica)"
for p in "${PRESERVE_PATHS[@]}"; do
  src="$BACKUP_DIR$(dirname "$p")/$(basename "$p")"
  if [ -e "$src" ]; then
    mkdir -p "$(dirname "$p")"
    cp -a "$src" "$(dirname "$p")/" || true
    log "  ✓ restaurado: $p"
  fi
done

# ───────────────────────────────
# 4) Levantar/actualizar contenedores (NO down -v, NO prune)
# ───────────────────────────────
cd "$BACKEND_DIR"

log "🐳 Build & Up (sin borrar volúmenes)"
$DC -f "$COMPOSE_FILE" build app queue

if [ "$SKIP_FRONTEND" != "1" ]; then
  $DC -f "$COMPOSE_FILE" build frontend
fi

$DC -f "$COMPOSE_FILE" up -d --remove-orphans

log "✅ Contenedores arriba:"
$DC -f "$COMPOSE_FILE" ps

# ───────────────────────────────
# 5) Composer install dentro del contenedor
# ───────────────────────────────
log "📦 Instalando dependencias (composer) dentro del contenedor app"
$DC -f "$COMPOSE_FILE" exec -T app sh -lc "composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader"

# ───────────────────────────────
# 6) Symlink storage (evita el 404 de fotos y el problema public/storage)
# ───────────────────────────────
log "🔗 Asegurando symlink public/storage -> storage/app/public"
$DC -f "$COMPOSE_FILE" exec -T app sh -lc "rm -rf public/storage && ln -sfn ../storage/app/public public/storage && ls -la public | grep storage"

# ───────────────────────────────
# 7) Permisos mínimos recomendados
# ───────────────────────────────
log "🔐 Ajustando permisos de storage y cache (como root)"
$DC -f "$COMPOSE_FILE" exec -T -u root app sh -lc "\
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data bootstrap/cache && \
chown -R www-data:www-data storage bootstrap/cache && \
chmod -R ug+rwX storage bootstrap/cache \
" || true

# ───────────────────────────────
# 8) Migraciones (no seedea por defecto)
# ───────────────────────────────
log "🗄️ Ejecutando migraciones (no borra datos): php artisan migrate --force"
$DC -f "$COMPOSE_FILE" exec -T app sh -lc "php artisan migrate --force"

# ───────────────────────────────
# 9) Optimización de caches
# ───────────────────────────────
log "⚙️ Optimizando caches"
$DC -f "$COMPOSE_FILE" exec -T app sh -lc "\
php artisan optimize:clear && \
php artisan config:cache && \
php artisan route:cache && \
php artisan view:cache \
" || true

# ───────────────────────────────
# 10) Smoke test básico
# ───────────────────────────────
log "🧪 Smoke test interno (HTTP del contenedor app)"
$DC -f "$COMPOSE_FILE" exec -T app sh -lc "php -v >/dev/null && curl -sS http://localhost/api/public/planes | head -c 200 || true"

log "✅ Deploy terminado (sin borrar BD ni fotos)."
log "📌 Si algo falló, revisa:"
log "   $DC -f $COMPOSE_FILE logs --tail=200 app"
log "   $DC -f $COMPOSE_FILE logs --tail=200 traefik"
