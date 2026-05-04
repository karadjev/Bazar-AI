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

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is required for preflight checks"
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose is required for preflight checks"
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "ERROR: docker daemon is not reachable; start Docker and retry"
  exit 1
fi

required_common=(
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  JWT_SECRET
  ALLOWED_ORIGINS
  PUBLIC_APP_URL
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_API_URL
  UPLOAD_BASE_URL
  MINIO_ROOT_USER
  MINIO_ROOT_PASSWORD
  S3_BUCKET
)

required_prod=(
  APP_DOMAIN
  LETSENCRYPT_EMAIL
)

for key in "${required_common[@]}" "${required_prod[@]}"; do
  unset "$key" || true
done

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

fail=0
rendered_compose_file="$(mktemp)"

cleanup() {
  rm -f "$rendered_compose_file"
}
trap cleanup EXIT

error() {
  echo "ERROR: $*"
  fail=1
}

warn() {
  echo "WARN: $*"
}

trim_trailing_slash() {
  local value="$1"
  printf '%s' "${value%/}"
}

contains_origin() {
  local needle="$1"
  local raw="${2:-}"
  local origin
  IFS=',' read -ra origins <<< "$raw"
  for origin in "${origins[@]}"; do
    origin="$(trim_trailing_slash "${origin//[[:space:]]/}")"
    if [[ "$origin" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

for key in "${required_common[@]}"; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    error "$key is empty"
  fi
done

if [[ "$MODE" == "prod" ]]; then
  for key in "${required_prod[@]}"; do
    value="${!key:-}"
    if [[ -z "$value" ]]; then
      error "$key is empty"
    fi
  done
fi

jwt_len=0
if [[ -n "${JWT_SECRET:-}" ]]; then
  jwt_len=${#JWT_SECRET}
fi
if [[ "${JWT_SECRET:-}" == "change-me" || "${JWT_SECRET:-}" == *"placeholder"* || "$jwt_len" -lt 32 ]]; then
  error "JWT_SECRET must be non-placeholder and >= 32 chars"
fi

if [[ -z "${POSTGRES_PASSWORD:-}" || "${POSTGRES_PASSWORD:-}" == "change-me" || "${POSTGRES_PASSWORD:-}" == "bazar_dev" || "${#POSTGRES_PASSWORD}" -lt 16 ]]; then
  error "POSTGRES_PASSWORD is weak/placeholder or shorter than 16 chars"
fi

if [[ -z "${MINIO_ROOT_PASSWORD:-}" || "${MINIO_ROOT_PASSWORD:-}" == "change-me" || "${MINIO_ROOT_PASSWORD:-}" == "bazar_dev_password" || "${#MINIO_ROOT_PASSWORD}" -lt 16 ]]; then
  error "MINIO_ROOT_PASSWORD is weak/placeholder or shorter than 16 chars"
fi

if [[ "${ALLOWED_ORIGINS:-}" == "*" || "${ALLOWED_ORIGINS:-}" == *",*"* || "${ALLOWED_ORIGINS:-}" == *"*,"* ]]; then
  error "ALLOWED_ORIGINS cannot contain wildcard origins"
fi

IFS=',' read -ra origin_items <<< "${ALLOWED_ORIGINS:-}"
for origin in "${origin_items[@]}"; do
  origin="$(trim_trailing_slash "${origin//[[:space:]]/}")"
  if [[ -z "$origin" ]]; then
    continue
  fi
  if [[ ! "$origin" =~ ^https?://[^/[:space:]]+$ ]]; then
    error "ALLOWED_ORIGINS entries must be http/https origins without paths: ${origin}"
  fi
done

public_origin="$(trim_trailing_slash "${PUBLIC_APP_URL:-}")"
next_public_origin="$(trim_trailing_slash "${NEXT_PUBLIC_APP_URL:-}")"
site_origin="$(trim_trailing_slash "${NEXT_PUBLIC_SITE_URL:-}")"
upload_origin="$(trim_trailing_slash "${UPLOAD_BASE_URL:-}")"

if [[ -n "$public_origin" && ! "$public_origin" =~ ^https?://[^/[:space:]]+$ ]]; then
  error "PUBLIC_APP_URL must be an absolute origin without a path"
fi
if [[ -n "$next_public_origin" && ! "$next_public_origin" =~ ^https?://[^/[:space:]]+$ ]]; then
  error "NEXT_PUBLIC_APP_URL must be an absolute origin without a path"
fi
if [[ -n "$site_origin" && ! "$site_origin" =~ ^https?://[^/[:space:]]+$ ]]; then
  error "NEXT_PUBLIC_SITE_URL must be an absolute origin without a path"
fi
if [[ -n "$upload_origin" && ! "$upload_origin" =~ ^https?://[^[:space:]]+/uploads$ ]]; then
  error "UPLOAD_BASE_URL should be an absolute /uploads URL for the bundled API storage"
fi
if [[ -n "$public_origin" ]] && ! contains_origin "$public_origin" "${ALLOWED_ORIGINS:-}"; then
  error "ALLOWED_ORIGINS must include PUBLIC_APP_URL (${PUBLIC_APP_URL})"
fi

if [[ "$MODE" == "prod" && -n "${APP_DOMAIN:-}" ]]; then
  if [[ "${APP_DOMAIN}" == "example.com" || "${APP_DOMAIN}" == *.example.com || "${APP_DOMAIN}" == "localhost" || "${APP_DOMAIN}" == *"://"* || "${APP_DOMAIN}" == */* ]]; then
    error "APP_DOMAIN must be your real domain without scheme/path, not ${APP_DOMAIN}"
  fi
  if [[ "${LETSENCRYPT_EMAIL:-}" == "admin@example.com" || ! "${LETSENCRYPT_EMAIL:-}" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]]; then
    error "LETSENCRYPT_EMAIL must be a real email address"
  fi
  expected_origin="https://${APP_DOMAIN}"
  if [[ "$public_origin" != "$expected_origin" ]]; then
    error "PUBLIC_APP_URL must be ${expected_origin}"
  fi
  if [[ "$next_public_origin" != "$expected_origin" ]]; then
    error "NEXT_PUBLIC_APP_URL must be ${expected_origin}"
  fi
  if [[ "$site_origin" != "$expected_origin" ]]; then
    error "NEXT_PUBLIC_SITE_URL must be ${expected_origin}"
  fi
  if [[ "$upload_origin" != "${expected_origin}/uploads" ]]; then
    error "UPLOAD_BASE_URL must be ${expected_origin}/uploads"
  fi
  if [[ "${NEXT_PUBLIC_API_URL:-}" != "/api" ]]; then
    error "NEXT_PUBLIC_API_URL must be /api for the bundled Nginx edge"
  fi
elif [[ "$MODE" != "prod" ]]; then
  warn "staging preflight does not validate DNS/TLS ownership"
fi

if [[ "$fail" -ne 0 ]]; then
  echo "Preflight failed."
  exit 1
fi

echo "INFO: rendering compose config..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >"$rendered_compose_file"
echo "INFO: compose config rendered ok"

echo "INFO: validating nginx config..."
if [[ "$MODE" == "prod" ]]; then
  echo "INFO: validating nginx bootstrap config..."
  docker run --rm --add-host frontend:127.0.0.1 --add-host api:127.0.0.1 -e APP_DOMAIN="${APP_DOMAIN}" -v "$PWD/deployments/nginx/nginx.bootstrap.conf:/tmp/nginx.template:ro" nginx:1.27.3-alpine /bin/sh -ec "envsubst '\$APP_DOMAIN' < /tmp/nginx.template > /tmp/nginx.conf && nginx -t -c /tmp/nginx.conf"
  if command -v openssl >/dev/null 2>&1; then
    cert_tmp="$(mktemp -d)"
    trap 'rm -rf "$cert_tmp"' EXIT
    mkdir -p "$cert_tmp/live/${APP_DOMAIN}"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "$cert_tmp/live/${APP_DOMAIN}/privkey.pem" \
      -out "$cert_tmp/live/${APP_DOMAIN}/fullchain.pem" \
      -subj "/CN=${APP_DOMAIN}" >/dev/null 2>&1
    echo "INFO: validating nginx HTTPS config..."
    docker run --rm --add-host frontend:127.0.0.1 --add-host api:127.0.0.1 -e APP_DOMAIN="${APP_DOMAIN}" -v "$PWD/deployments/nginx/nginx.prod.conf:/tmp/nginx.template:ro" -v "$cert_tmp:/etc/letsencrypt:ro" nginx:1.27.3-alpine /bin/sh -ec "envsubst '\$APP_DOMAIN' < /tmp/nginx.template > /tmp/nginx.conf && nginx -t -c /tmp/nginx.conf"
  else
    warn "openssl is unavailable; skipped HTTPS nginx config validation with a test certificate"
  fi
else
  docker run --rm --add-host frontend:127.0.0.1 --add-host api:127.0.0.1 -v "$PWD/deployments/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:1.27.3-alpine nginx -t
fi
echo "INFO: nginx config validated ok"

echo "Preflight passed."
