#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-deployments/env/prod.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE"
  exit 1
fi

tmp_file="$(mktemp)"
cp "$ENV_FILE" "$tmp_file"

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

jwt_secret="$(get_val JWT_SECRET)"
if [[ -z "$jwt_secret" || "$jwt_secret" == "change-me" || "$jwt_secret" == *"placeholder"* || "${#jwt_secret}" -lt 32 ]]; then
  set_key JWT_SECRET "$(openssl rand -hex 32)"
  echo "INFO: generated strong JWT_SECRET"
fi

pg_password="$(get_val POSTGRES_PASSWORD)"
if [[ -z "$pg_password" || "$pg_password" == "change-me" || "$pg_password" == "bazar_dev" ]]; then
  set_key POSTGRES_PASSWORD "$(openssl rand -hex 16)"
  echo "INFO: generated strong POSTGRES_PASSWORD"
fi

minio_password="$(get_val MINIO_ROOT_PASSWORD)"
if [[ -z "$minio_password" || "$minio_password" == "change-me" || "$minio_password" == "bazar_dev_password" ]]; then
  set_key MINIO_ROOT_PASSWORD "$(openssl rand -hex 16)"
  echo "INFO: generated strong MINIO_ROOT_PASSWORD"
fi

public_url="$(get_val PUBLIC_APP_URL)"
allowed_origins="$(get_val ALLOWED_ORIGINS)"
if [[ -n "$public_url" && -z "$allowed_origins" ]]; then
  set_key ALLOWED_ORIGINS "$public_url"
  echo "INFO: initialized ALLOWED_ORIGINS from PUBLIC_APP_URL"
elif [[ -n "$public_url" && "$allowed_origins" != *"$public_url"* ]]; then
  set_key ALLOWED_ORIGINS "${allowed_origins},${public_url}"
  echo "INFO: appended PUBLIC_APP_URL to ALLOWED_ORIGINS"
fi

cp "$tmp_file" "$ENV_FILE"
rm -f "$tmp_file" "$tmp_file.bak"
echo "Done: $ENV_FILE"
