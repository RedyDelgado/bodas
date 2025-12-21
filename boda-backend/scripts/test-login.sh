#!/bin/bash
# Prueba simple de login contra el backend
# Uso:
#   bash boda-backend/scripts/test-login.sh EMAIL PASSWORD [HOST]
# Ejemplo:
#   bash boda-backend/scripts/test-login.sh "redy.delgado@gmail.com" "R3DY-ARDOS" 161.97.169.31

set -euo pipefail

EMAIL=${1:?"Falta EMAIL"}
PASS=${2:?"Falta PASSWORD"}
HOST=${3:-localhost}

login() {
  local url="$1"
  echo "→ Probando: $url"
  local resp
  resp=$(curl -s "$url" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")

  echo "$resp" | jq -C '.' || echo "$resp"

  local token
  token=$(echo "$resp" | jq -r '.token // empty')
  if [ -n "$token" ]; then
    echo "\n✅ Token emitido"
    echo "TOKEN=$token"
    # Persistir token y host para uso posterior
    TOKEN_FILE=${TOKEN_FILE:-/root/wedding/.last_token}
    HOST_FILE=${HOST_FILE:-/root/wedding/.last_host}
    echo "$token" > "$TOKEN_FILE" 2>/dev/null || true
    echo "$HOST"  > "$HOST_FILE"  2>/dev/null || true
    echo "\nToken guardado en $TOKEN_FILE"
    echo "Host guardado en $HOST_FILE"
    echo "\nPuedes probar \"me\" así:" 
    echo "  bash /root/wedding/boda-backend/scripts/me.sh $HOST"
  else
    echo "\n⚠️  No se recibió token (revisa credenciales o logs)"
  fi
}

echo "═══════════════════════════════════════════════"
echo "  TEST LOGIN API ($HOST)"
echo "═══════════════════════════════════════════════"

# Backend directo (puerto 8000)
login "http://$HOST:8000/api/auth/login"

echo ""
# Vía Traefik (/api en 80)
login "http://$HOST/api/auth/login"
