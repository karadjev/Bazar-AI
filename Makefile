DEV_COMPOSE=docker compose --env-file deployments/env/dev.env -f deployments/docker-compose.yml
STAGING_ENV_GUARD=env -u JWT_SECRET -u POSTGRES_PASSWORD -u MINIO_ROOT_PASSWORD -u ALLOWED_ORIGINS -u PUBLIC_APP_URL -u NEXT_PUBLIC_APP_URL -u NEXT_PUBLIC_SITE_URL
PROD_ENV_GUARD=env -u JWT_SECRET -u POSTGRES_PASSWORD -u MINIO_ROOT_PASSWORD -u ALLOWED_ORIGINS -u PUBLIC_APP_URL -u NEXT_PUBLIC_APP_URL -u NEXT_PUBLIC_SITE_URL -u APP_DOMAIN -u LETSENCRYPT_EMAIL
STAGING_COMPOSE=$(STAGING_ENV_GUARD) docker compose --env-file deployments/env/staging.env -f deployments/docker-compose.staging.yml
PROD_COMPOSE=$(PROD_ENV_GUARD) docker compose --env-file deployments/env/prod.env -f deployments/docker-compose.prod.yml

.PHONY: env-init install up down restart logs ps build migrate seed test lint api-test web-lint web-build scripts-lint verify verify-fast openapi-lint staging-up prod-up prod-migrate prod-deploy prod-down prod-logs prod-ps prod-nginx-validate prod-nginx-reload prod-preflight staging-preflight prod-autofix-env staging-autofix-env prod-smoke prod-ready deploy-guard-local ssl-dummy ssl-init ssl-renew npm-verbose api web

env-init:
	cp -n deployments/env/dev.env.example deployments/env/dev.env || true
	cp -n deployments/env/staging.env.example deployments/env/staging.env || true
	cp -n deployments/env/prod.env.example deployments/env/prod.env || true

install: env-init
	cd apps/web && npm install

up: env-init
	$(DEV_COMPOSE) up -d --build

down:
	$(DEV_COMPOSE) down

restart:
	$(DEV_COMPOSE) restart

logs:
	$(DEV_COMPOSE) logs -f --tail=200

ps:
	$(DEV_COMPOSE) ps

build:
	$(DEV_COMPOSE) build

migrate:
	$(DEV_COMPOSE) exec -T postgres sh -lc "for f in /docker-entrypoint-initdb.d/*.sql; do psql -U bazar -d bazar_ai -f $$f; done"

seed:
	$(DEV_COMPOSE) exec -T postgres psql -U bazar -d bazar_ai < apps/api/seeds/001_demo.sql

test:
	cd apps/api && go test ./...

api-test:
	cd apps/api && go test ./...

web-lint:
	cd apps/web && npm run lint

web-build:
	cd apps/web && NEXT_PUBLIC_API_URL=/api NEXT_PUBLIC_APP_URL=https://ci.local NEXT_PUBLIC_SITE_URL=https://ci.local npm run build

scripts-lint:
	bash -n deployments/scripts/preflight.sh
	bash -n deployments/scripts/autofix-env.sh
	bash -n deployments/scripts/preflight-ci-fixtures.sh

lint: web-lint

verify: api-test web-lint web-build openapi-lint scripts-lint

verify-fast: api-test web-lint openapi-lint scripts-lint

# Проверка OpenAPI (нужен npx / Node для загрузки @redocly/cli)
openapi-lint:
	cd apps/api && npx --yes @redocly/cli@1 lint openapi.yaml

staging-up:
	$(STAGING_COMPOSE) up -d --build

prod-up:
	$(PROD_COMPOSE) up -d --build

prod-migrate:
	$(PROD_COMPOSE) up -d postgres
	$(PROD_COMPOSE) --profile ops run --rm migrate

prod-preflight:
	bash deployments/scripts/preflight.sh deployments/env/prod.env deployments/docker-compose.prod.yml prod

staging-preflight:
	bash deployments/scripts/preflight.sh deployments/env/staging.env deployments/docker-compose.staging.yml staging

prod-autofix-env:
	bash deployments/scripts/autofix-env.sh deployments/env/prod.env

staging-autofix-env:
	bash deployments/scripts/autofix-env.sh deployments/env/staging.env

prod-deploy:
	$(PROD_COMPOSE) pull || true
	$(PROD_COMPOSE) up -d --build --remove-orphans postgres redis minio rabbitmq
	$(PROD_COMPOSE) --profile ops run --rm migrate
	$(PROD_COMPOSE) up -d --build --remove-orphans
	$(PROD_COMPOSE) restart nginx
	$(PROD_COMPOSE) exec -T nginx nginx -t
	$(PROD_COMPOSE) exec -T nginx nginx -s reload

prod-down:
	$(PROD_COMPOSE) down

prod-logs:
	$(PROD_COMPOSE) logs -f --tail=200

prod-ps:
	$(PROD_COMPOSE) ps

prod-nginx-validate:
	$(PROD_COMPOSE) exec -T nginx nginx -t

prod-nginx-reload: prod-nginx-validate
	$(PROD_COMPOSE) exec -T nginx nginx -s reload

prod-smoke:
	@echo "== nginx-health =="
	@DOMAIN=$$(grep '^APP_DOMAIN=' deployments/env/prod.env | cut -d= -f2); curl -fsS "https://$$DOMAIN/nginx-health" && echo
	@echo "== api health via edge =="
	@DOMAIN=$$(grep '^APP_DOMAIN=' deployments/env/prod.env | cut -d= -f2); curl -fsS "https://$$DOMAIN/health" && echo
	@echo "== dashboard analytics via edge =="
	@DOMAIN=$$(grep '^APP_DOMAIN=' deployments/env/prod.env | cut -d= -f2); curl -fsS "https://$$DOMAIN/api/dashboard/analytics?guest=1" && echo
	@echo "== root response =="
	@DOMAIN=$$(grep '^APP_DOMAIN=' deployments/env/prod.env | cut -d= -f2); curl -fsSI "https://$$DOMAIN/" | sed -n '1,6p'

prod-ready:
	$(MAKE) prod-autofix-env
	$(MAKE) prod-preflight
	$(MAKE) prod-deploy
	$(MAKE) prod-smoke

deploy-guard-local:
	bash deployments/scripts/preflight-ci-fixtures.sh

ssl-dummy:
	DOMAIN=$$(grep '^APP_DOMAIN=' deployments/env/prod.env | cut -d= -f2); docker run --rm -v bazar-ai-prod_letsencrypt:/etc/letsencrypt alpine:3.22 sh -c "apk add --no-cache openssl >/dev/null && mkdir -p /etc/letsencrypt/live/$$DOMAIN && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /etc/letsencrypt/live/$$DOMAIN/privkey.pem -out /etc/letsencrypt/live/$$DOMAIN/fullchain.pem -subj '/CN=$$DOMAIN'"

ssl-init:
	$(PROD_COMPOSE) run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot -d $$(grep '^APP_DOMAIN=' deployments/env/prod.env | cut -d= -f2) --email $$(grep '^LETSENCRYPT_EMAIL=' deployments/env/prod.env | cut -d= -f2) --agree-tos --no-eff-email --force-renewal
	$(PROD_COMPOSE) restart nginx
	$(PROD_COMPOSE) exec -T nginx nginx -t

ssl-renew:
	$(PROD_COMPOSE) run --rm certbot renew --webroot -w /var/www/certbot
	$(PROD_COMPOSE) exec nginx nginx -s reload

npm-verbose:
	cd apps/web && npm config get registry && npm install --verbose

api:
	cd apps/api && go run ./cmd/api

web:
	cd apps/web && npm run dev
