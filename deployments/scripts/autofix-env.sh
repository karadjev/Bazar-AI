#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-deployments/env/prod.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE"
  exit 1
fi

tmp_file="$(mktemp)"
cp "$ENV_FILE" "$tmp_file"

if ! command -v openssl >/dev/null 2>&1; then
  echo "ERROR: openssl is required for secret generation"
  exit 1
fi

set_key() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$tmp_file"; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|g" "$tmp_file"
  else
    echo "${key}=${value}" >> "$tmp_file"
  fi
}

get_val() {
  local key="$1"
  local v
  v="$(grep -E "^${key}=" "$tmp_file" | sed "s/^${key}=//" || true)"
  echo "$v"
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

jwt_secret="$(get_val JWT_SECRET)"
if [[ -z "$jwt_secret" || "$jwt_secret" == "change-me" || "$jwt_secret" == *"placeholder"* || "${#jwt_secret}" -lt 32 ]]; then
  set_key JWT_SECRET "$(openssl rand -hex 32)"
  echo "INFO: generated strong JWT_SECRET"
fi

pg_password="$(get_val POSTGRES_PASSWORD)"
if [[ -z "$pg_password" || "$pg_password" == "change-me" || "$pg_password" == "bazar_dev" || "${#pg_password}" -lt 16 ]]; then
  set_key POSTGRES_PASSWORD "$(openssl rand -hex 16)"
  echo "INFO: generated strong POSTGRES_PASSWORD"
fi

minio_password="$(get_val MINIO_ROOT_PASSWORD)"
if [[ -z "$minio_password" || "$minio_password" == "change-me" || "$minio_password" == "bazar_dev_password" || "${#minio_password}" -lt 16 ]]; then
  set_key MINIO_ROOT_PASSWORD "$(openssl rand -hex 16)"
  echo "INFO: generated strong MINIO_ROOT_PASSWORD"
fi

bucket="$(get_val S3_BUCKET)"
if [[ -z "$bucket" ]]; then
  set_key S3_BUCKET "bazar-ai"
  echo "INFO: initialized S3_BUCKET"
fi

app_domain="$(get_val APP_DOMAIN)"
if [[ -n "$app_domain" && "$app_domain" != "example.com" && "$app_domain" != *.example.com && "$app_domain" != *"://"* && "$app_domain" != */* ]]; then
  expected_origin="https://${app_domain}"
  for key in PUBLIC_APP_URL NEXT_PUBLIC_APP_URL NEXT_PUBLIC_SITE_URL; do
    current="$(get_val "$key")"
    if [[ -z "$current" || "$current" == *"example.com"* || "$current" == http://localhost* ]]; then
      set_key "$key" "$expected_origin"
      echo "INFO: set $key from APP_DOMAIN"
    fi
  done
  upload_base_url="$(get_val UPLOAD_BASE_URL)"
  if [[ -z "$upload_base_url" || "$upload_base_url" == *"example.com"* || "$upload_base_url" == http://localhost* ]]; then
    set_key UPLOAD_BASE_URL "${expected_origin}/uploads"
    echo "INFO: set UPLOAD_BASE_URL from APP_DOMAIN"
  fi
  allowed_origins="$(get_val ALLOWED_ORIGINS)"
  normalized_expected_origin="$(trim_trailing_slash "$expected_origin")"
  if [[ -z "$allowed_origins" || "$allowed_origins" == *"example.com"* || "$allowed_origins" == "*" ]]; then
    set_key ALLOWED_ORIGINS "$normalized_expected_origin"
    echo "INFO: set ALLOWED_ORIGINS from APP_DOMAIN"
  elif ! contains_origin "$normalized_expected_origin" "$allowed_origins"; then
    set_key ALLOWED_ORIGINS "${allowed_origins},${normalized_expected_origin}"
    echo "INFO: appended APP_DOMAIN origin to ALLOWED_ORIGINS"
  fi
fi

next_public_api_url="$(get_val NEXT_PUBLIC_API_URL)"
if [[ -z "$next_public_api_url" ]]; then
  set_key NEXT_PUBLIC_API_URL "/api"
  echo "INFO: initialized NEXT_PUBLIC_API_URL"
fi

public_url="$(get_val PUBLIC_APP_URL)"
if [[ -n "$public_url" ]]; then
  for key in NEXT_PUBLIC_APP_URL NEXT_PUBLIC_SITE_URL; do
    current="$(get_val "$key")"
    if [[ -z "$current" ]]; then
      set_key "$key" "$public_url"
      echo "INFO: initialized $key from PUBLIC_APP_URL"
    fi
  done
  upload_base_url="$(get_val UPLOAD_BASE_URL)"
  if [[ -z "$upload_base_url" ]]; then
    set_key UPLOAD_BASE_URL "${public_url%/}/uploads"
    echo "INFO: initialized UPLOAD_BASE_URL from PUBLIC_APP_URL"
  fi
fi

allowed_origins="$(get_val ALLOWED_ORIGINS)"
if [[ -n "$public_url" && -z "$allowed_origins" ]]; then
  set_key ALLOWED_ORIGINS "$public_url"
  echo "INFO: initialized ALLOWED_ORIGINS from PUBLIC_APP_URL"
elif [[ -n "$public_url" ]]; then
  normalized_public_origin="$(trim_trailing_slash "$public_url")"
  if ! contains_origin "$normalized_public_origin" "$allowed_origins"; then
    set_key ALLOWED_ORIGINS "${allowed_origins},${normalized_public_origin}"
    echo "INFO: appended PUBLIC_APP_URL to ALLOWED_ORIGINS"
  fi
fi

cp "$tmp_file" "$ENV_FILE"
rm -f "$tmp_file" "$tmp_file.bak"
echo "Done: $ENV_FILE"
