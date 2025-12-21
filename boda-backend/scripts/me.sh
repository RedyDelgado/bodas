#!/bin/bash
# Llama /auth/me usando el último token guardado por test-login.sh
# Uso: bash boda-backend/scripts/me.sh [HOST]

set -euo pipefail

TOKEN_FILE=${TOKEN_FILE:-/root/wedding/.last_token}
HOST_FILE=${HOST_FILE:-/root/wedding/.last_host}

if [ ! -f "$TOKEN_FILE" ]; then
  echo "❌ No se encontró token en $TOKEN_FILE (ejecuta test-login.sh primero)"
  exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")
HOST=${1:-}
if [ -z "$HOST" ] && [ -f "$HOST_FILE" ]; then
  HOST=$(cat "$HOST_FILE")
fi
HOST=${HOST:-localhost}

echo "Usando HOST=$HOST"
curl -s "http://$HOST:8000/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq -C '.' || true
