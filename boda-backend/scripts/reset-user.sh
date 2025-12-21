#!/bin/bash
# Uso: bash boda-backend/scripts/reset-user.sh EMAIL PASSWORD [activate]

set -euo pipefail

EMAIL=${1:?"Falta EMAIL"}
PASS=${2:?"Falta PASSWORD"}
ACTIVATE=${3:-true}

EXTRA_FLAG=""
if [ "$ACTIVATE" = "true" ] || [ "$ACTIVATE" = "1" ]; then
  EXTRA_FLAG="--activate"
fi

docker exec boda_app php artisan user:reset-password "$EMAIL" "$PASS" $EXTRA_FLAG
