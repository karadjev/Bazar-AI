# Production Deploy Runbook

This runbook is for the current `deployments/docker-compose.prod.yml` stack (`nginx`, `frontend`, `api`, `postgres`, `redis`, `minio`, `rabbitmq`).

## 1) Preflight

Run from project root.

```bash
docker --version
docker compose version
test -f deployments/env/prod.env || echo "Missing deployments/env/prod.env"
make prod-preflight
```

If preflight fails because of weak/placeholder secrets, auto-fix env safely:

```bash
make prod-autofix-env
make prod-preflight
```

Validate required env keys quickly:

```bash
set -a && source deployments/env/prod.env && set +a
printf "%s\n" "$APP_DOMAIN" "$POSTGRES_DB" "$POSTGRES_USER" "$JWT_SECRET" "$ALLOWED_ORIGINS" | sed 's/./*/g'
```

Render and validate compose:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml config >/tmp/bazar-prod.compose.rendered.yml
```

## 2) First-time TLS bootstrap (one-time)

If certs are not present yet, start stack without HTTPS server dependency on existing certs:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml up -d api frontend postgres redis minio rabbitmq
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml up -d nginx
```

Issue certificate:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml run --rm certbot certonly --webroot -w /var/www/certbot -d "$APP_DOMAIN" --email "$LETSENCRYPT_EMAIL" --agree-tos --no-eff-email
```

Restart nginx after cert issue:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml restart nginx
```

## 3) Regular deploy

Pull/build and restart:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml pull
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml build --pull frontend api
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml --profile ops run --rm migrate
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml up -d
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml exec -T nginx nginx -t
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml exec -T nginx nginx -s reload
```

One-command flow (recommended):

```bash
make prod-ready
```

Pipeline-friendly one-liner:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml exec -T nginx nginx -t && docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml exec -T nginx nginx -s reload
```

## 4) Post-deploy checks

Container and health status:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml ps
```

Endpoint smoke checks:

```bash
curl -fsS "https://$APP_DOMAIN/nginx-health"
curl -fsS "https://$APP_DOMAIN/health"
curl -I "https://$APP_DOMAIN/"
```

Check API via public edge:

```bash
curl -fsS "https://$APP_DOMAIN/api/dashboard/analytics?guest=1" || true
```

## 5) Logs and debugging

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml logs -f --tail=200 nginx api frontend
```

Check rendered Nginx config inside container:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml exec nginx nginx -t
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml exec nginx cat /etc/nginx/nginx.conf
```

## 6) Rollback

If new app images fail:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml logs --tail=200 api frontend nginx
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml down
```

Re-deploy last known good image tags (or pinned SHA tags) and bring up:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml up -d
```

Important: do not delete named volumes (`postgres_data`, `redis_data`, `minio_data`, `rabbitmq_data`) during rollback.

## 7) Safe migration note

Current project still mounts SQL files via `docker-entrypoint-initdb.d`; those run only on first DB initialization. For existing DB volumes, always execute the explicit migration step:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml --profile ops run --rm migrate
```
