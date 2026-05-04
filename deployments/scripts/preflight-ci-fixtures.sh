#!/usr/bin/env bash
set -euo pipefail

staging_env="$(mktemp)"
prod_env="$(mktemp)"

cleanup() {
  rm -f "$staging_env" "$prod_env"
}
trap cleanup EXIT

cat >"$staging_env" <<'EOF'
POSTGRES_USER=bazar
POSTGRES_PASSWORD=0123456789abcdef0123456789abcdef
POSTGRES_DB=bazar_ai
JWT_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
ALLOWED_ORIGINS=https://staging.example.org
PUBLIC_APP_URL=https://staging.example.org
NEXT_PUBLIC_APP_URL=https://staging.example.org
NEXT_PUBLIC_SITE_URL=https://staging.example.org
NEXT_PUBLIC_API_URL=/api
UPLOAD_BASE_URL=https://staging.example.org/uploads
MINIO_ROOT_USER=bazar
MINIO_ROOT_PASSWORD=abcdef0123456789abcdef0123456789
S3_BUCKET=bazar-ai
EOF

cat >"$prod_env" <<'EOF'
POSTGRES_USER=bazar
POSTGRES_PASSWORD=abcdef0123456789abcdef0123456789
POSTGRES_DB=bazar_ai
JWT_SECRET=abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789
ALLOWED_ORIGINS=https://bazar-ci-check.example.org
PUBLIC_APP_URL=https://bazar-ci-check.example.org
NEXT_PUBLIC_APP_URL=https://bazar-ci-check.example.org
NEXT_PUBLIC_SITE_URL=https://bazar-ci-check.example.org
NEXT_PUBLIC_API_URL=/api
UPLOAD_BASE_URL=https://bazar-ci-check.example.org/uploads
MINIO_ROOT_USER=bazar
MINIO_ROOT_PASSWORD=0123456789abcdef0123456789abcdef
S3_BUCKET=bazar-ai
APP_DOMAIN=bazar-ci-check.example.org
LETSENCRYPT_EMAIL=ci@example.org
EOF

echo "INFO: run staging preflight fixture"
bash deployments/scripts/preflight.sh "$staging_env" deployments/docker-compose.staging.yml staging

echo "INFO: run production preflight fixture"
bash deployments/scripts/preflight.sh "$prod_env" deployments/docker-compose.prod.yml prod

echo "Preflight CI fixtures passed."
