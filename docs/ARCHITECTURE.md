# Bazar AI Architecture

## Product Principle

Bazar AI is not a website builder. It is an AI commerce operating system for small local sellers: storefront, CRM, content, orders, notifications and growth tools in one flow.

## Monorepo Layout

```text
apps/
  api/       Go backend
  web/       Next.js frontend
docs/        product and engineering docs
deployments/ local infrastructure
```

## Backend

The Go backend follows a clean modular shape:

- `cmd/api` - HTTP entrypoint.
- `internal/{domain}` - feature modules.
- `pkg/config` - configuration.
- `pkg/httpx` - shared HTTP helpers.
- `migrations` - PostgreSQL schema.

Current MVP modules:

- Auth contracts.
- Stores and onboarding.
- Products.
- Orders.
- AI generation logging and mock generation.
- Admin statistics.

Next implementation step is replacing in-memory repositories with PostgreSQL repositories and adding JWT refresh-token rotation.

## Frontend

The frontend is planned as a premium, mobile-first SaaS interface:

- Dashboard.
- Onboarding wizard.
- Product manager.
- Order CRM.
- Store editor.
- Public storefront.
- Admin panel.

The first screen should be the working dashboard, not a marketing landing page.

## Infrastructure

Local development stack:

- PostgreSQL for durable data.
- Redis for sessions, cache and rate limits.
- MinIO for product/banner images.
- RabbitMQ for async notifications and AI jobs.

Deployment operations:

- See `docs/DEPLOY_RUNBOOK.md` for production deploy, health checks, TLS bootstrap, and rollback flow.

Scale path:

- OpenTelemetry traces.
- Prometheus metrics.
- Grafana dashboards.
- Kubernetes deployment once beta traffic grows.

## Security Baseline

- JWT access and rotated refresh tokens.
- RBAC for platform/admin/store roles.
- Rate limiting on auth, public order creation and AI generation.
- MIME and file size validation.
- Audit logs for admin and sensitive store actions.
- SQL via typed repositories or query builders, never string-concatenated user input.
