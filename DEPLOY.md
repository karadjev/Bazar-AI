# Bazar AI Deploy

## Environments

- Development: `deployments/docker-compose.yml`
- Staging: `deployments/docker-compose.staging.yml`
- Production: `deployments/docker-compose.prod.yml`

Only Nginx is exposed publicly. Frontend, API, PostgreSQL, Redis, MinIO and RabbitMQ live on the internal Docker network.

## Local Development

```bash
make up
make migrate
make seed
```

Open `http://localhost:8080`.

Useful commands:

```bash
make ps
make logs
make restart
make down
```

## Staging

1. Copy env:

```bash
cp deployments/env/staging.env.example deployments/env/staging.env
```

2. Edit secrets and domains in `deployments/env/staging.env`.

3. Deploy:

```bash
make staging-up
make migrate
make seed
```

Staging uses production image builds but HTTP Nginx config by default. Put it behind your cloud TLS/load balancer or adapt production SSL flow if staging has a public domain.

## Production

1. Copy env:

```bash
cp deployments/env/prod.env.example deployments/env/prod.env
```

2. Edit:

- `APP_DOMAIN`
- `LETSENCRYPT_EMAIL`
- `POSTGRES_PASSWORD`
- `JWT_SECRET` (real random value, at least 32 characters)
- `MINIO_ROOT_PASSWORD`
- `PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` (usually `https://APP_DOMAIN`)
- `UPLOAD_BASE_URL` (usually `https://APP_DOMAIN/uploads`)
- AI and Telegram secrets

3. Run preflight before touching the server edge:

```bash
make prod-autofix-env
make prod-preflight
```

4. Start production and run migrations:

```bash
make prod-deploy
```

5. Issue a real Let's Encrypt certificate. This restarts Nginx so it re-renders the HTTPS config:

```bash
make ssl-init
```

6. Run smoke checks and then enable renewal:

```bash
make prod-smoke
```

Renewal:

```bash
make ssl-renew
```

The `certbot` profile also includes a long-running renewal loop:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml --profile ssl up -d certbot
```

## Rollback

If a deployment is bad:

```bash
git checkout <previous-sha>
make prod-deploy
```

Database volumes are persistent and are not removed by deploy commands.

## Zero-Downtime Strategy

For a single-server alpha, `make prod-deploy` rebuilds and recreates services predictably. For lower downtime, scale app services before deploy:

```bash
docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml up -d --scale api=2 --scale frontend=2
```

Nginx proxies by service name on the internal network. A later CI/CD pipeline can tag images as:

- `bazar-ai-api:<git-sha>`
- `bazar-ai-web:<git-sha>`
- `bazar-ai-api:staging`
- `bazar-ai-api:production`

## Common Issues

- `registry.npmjs.org ENOTFOUND`: DNS/network issue on the host. Use a network with npm access, then rerun `make up`.
- Docker daemon unavailable: start Docker Desktop or Docker Engine before `make up`.
- Nginx unhealthy in production: check certificates exist in `letsencrypt` volume and `APP_DOMAIN` matches the cert path.
- API unhealthy: check `DATABASE_URL`, Postgres health, and `make logs`.
