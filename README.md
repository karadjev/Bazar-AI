# Bazar AI

AI SaaS-платформа для быстрого запуска локальных интернет-магазинов. Первый фокус: Кавказ и малый бизнес, которому нужен магазин, CRM, AI-контент и Telegram/WhatsApp-заказы без команды разработки.

## Что уже заложено

- `apps/api` - Go backend с модульной структурой, healthcheck и MVP API.
- `apps/web` - Next.js frontend-каркас premium SaaS dashboard/public store.
- `docs` - архитектура, roadmap и MVP scope.
- `deployments` - Docker Compose для PostgreSQL, Redis, MinIO и RabbitMQ.
- `apps/api/migrations` - стартовая SQL-схема основных таблиц.

## One-Command Docker Start

```bash
make up
```

Открой `http://localhost:8080`. Nginx проксирует frontend, `/api/*`, `/health` и `/uploads/*`.

После первого запуска можно применить seed-данные:

```bash
make migrate
make seed
```

Проверка контейнеров:

```bash
make ps
make logs
```

## Local Non-Docker Development

```bash
cd apps/api
go run ./cmd/api

cd apps/web
npm install
npm run dev
```

API будет на `http://localhost:8080`, frontend на `http://localhost:3000`.

Если локальный `npm install` упирается в DNS/registry, проверь:

```bash
cd apps/web
npm config get registry
npm install --verbose
```

Registry закреплен в `apps/web/.npmrc`, версия Node закреплена в `apps/web/.nvmrc`.

## Инфраструктура

- Development: [docker-compose.yml](/Users/ilezkaradjev/Desktop/bazar%20AI/deployments/docker-compose.yml)
- Staging: [docker-compose.staging.yml](/Users/ilezkaradjev/Desktop/bazar%20AI/deployments/docker-compose.staging.yml)
- Production: [docker-compose.prod.yml](/Users/ilezkaradjev/Desktop/bazar%20AI/deployments/docker-compose.prod.yml)
- Deploy guide: [DEPLOY.md](/Users/ilezkaradjev/Desktop/bazar%20AI/DEPLOY.md)

В development наружу открыт только Nginx на `localhost:8080`. В staging/production frontend, backend, PostgreSQL, Redis, MinIO и RabbitMQ доступны только во внутренней Docker network.

## Переменные окружения API

```bash
DATABASE_URL=postgres://bazar:bazar_dev@localhost:5432/bazar_ai?sslmode=disable
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
JWT_SECRET=change-me
TELEGRAM_BOT_TOKEN=
PUBLIC_APP_URL=http://localhost:3000
AI_API_URL=
AI_API_KEY=
AI_MODEL=gpt-4o-mini
REDIS_URL=redis://redis:6379/0
STORAGE_ENDPOINT=minio:9000
STORAGE_ACCESS_KEY=bazar
STORAGE_SECRET_KEY=bazar_dev_password
```

Для `APP_ENV=staging` и `APP_ENV=production` API завершится с ошибкой на старте, если не заданы критичные переменные: `DATABASE_URL`, `JWT_SECRET`, `PUBLIC_APP_URL`, `UPLOAD_BASE_URL`. `JWT_SECRET` должен быть реальным секретом длиной минимум 32 символа, а `ALLOWED_ORIGINS=*` в этих окружениях запрещен.

API отдает Prometheus-compatible счетчики ответов на `/metrics`: `bazar_api_http_responses_total` с лейблами `method`, `endpoint`, `status`, `status_class`.

## Demo Flow

1. `make up`
2. `make migrate`
3. `make seed`
4. Открыть `http://localhost:8080`
5. Пройти onboarding: ниша -> город -> контакты -> стиль -> генерация.
6. Открыть dashboard, добавить товар и фото, подключить Telegram, открыть публичную витрину.
7. На витрине добавить товар в корзину и оформить заказ.

Alpha e2e после установки frontend-зависимостей:

```bash
cd apps/web
E2E_API_URL=http://127.0.0.1:8080 npm run e2e
```

## MVP-цель

Пользователь должен зарегистрироваться, пройти онбординг, создать магазин за 5 минут, добавить товар, сгенерировать AI-описание, получить публичную ссылку, принять заказ и увидеть его в CRM/Telegram.
