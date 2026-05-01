#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-deployments/env/prod.env}"
COMPOSE_FILE="${2:-deployments/docker-compose.prod.yml}"
MODE="${3:-prod}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE"
  exit 1
fi
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: compose file not found: $COMPOSE_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required_common=(
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  JWT_SECRET
  ALLOWED_ORIGINS
  PUBLIC_APP_URL
  NEXT_PUBLIC_APP_URL
)

required_prod=(
  APP_DOMAIN
  LETSENCRYPT_EMAIL
)

fail=0

for key in "${required_common[@]}"; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "ERROR: $key is empty"
    fail=1
  fi
done

if [[ "$MODE" == "prod" ]]; then
  for key in "${required_prod[@]}"; do
    value="${!key:-}"
    if [[ -z "$value" ]]; then
      echo "ERROR: $key is empty"
      fail=1
    fi
  done
fi

if [[ "${JWT_SECRET:-}" == "change-me" || "${JWT_SECRET:-}" == *"placeholder"* || "${#JWT_SECRET:-0}" -lt 32 ]]; then
  echo "ERROR: JWT_SECRET must be non-placeholder and >= 32 chars"
  fail=1
fi

if [[ "${POSTGRES_PASSWORD:-}" == "change-me" || "${POSTGRES_PASSWORD:-}" == "bazar_dev" ]]; then
  echo "ERROR: POSTGRES_PASSWORD is weak/placeholder"
  fail=1
fi

if [[ "${MINIO_ROOT_PASSWORD:-}" == "change-me" || "${MINIO_ROOT_PASSWORD:-}" == "bazar_dev_password" ]]; then
  echo "ERROR: MINIO_ROOT_PASSWORD is weak/placeholder"
  fail=1
fi

if [[ -n "${PUBLIC_APP_URL:-}" && "${ALLOWED_ORIGINS:-}" != *"${PUBLIC_APP_URL}"* ]]; then
  echo "WARN: ALLOWED_ORIGINS does not include PUBLIC_APP_URL (${PUBLIC_APP_URL})"
fi

if [[ "$MODE" == "prod" && -n "${APP_DOMAIN:-}" ]]; then
  if [[ "${PUBLIC_APP_URL:-}" != "https://${APP_DOMAIN}" ]]; then
    echo "WARN: PUBLIC_APP_URL should usually be https://${APP_DOMAIN}"
  fi
fi

echo "INFO: rendering compose config..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/tmp/bazar-preflight.compose.rendered.yml
echo "INFO: compose config rendered ok"

if [[ "$fail" -ne 0 ]]; then
  echo "Preflight failed."
  exit 1
fi

echo "Preflight passed."
