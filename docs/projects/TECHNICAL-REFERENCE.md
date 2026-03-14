# Referência técnica

Guia de consulta rápida para setup, operação e avaliação técnica.

## Serviços e portas

- API: `http://localhost:3333`
- Gateway Mock 1: `http://localhost:3001`
- Gateway Mock 2: `http://localhost:3002`
- MySQL: `localhost:3306`

Stack opcional de observabilidade:

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3005`
- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200`

## Endpoints principais

Públicos:

- `GET /`
- `GET /metrics`
- `POST /login`
- `POST /purchases`

Autenticados:

- `POST /logout`
- `GET/POST/GET by id/PUT/DELETE /users`
- `GET/POST/GET by id/PUT/DELETE /products`
- `GET /clients`
- `GET /clients/:id`
- `GET /gateways`
- `PATCH /gateways/:id/toggle`
- `PATCH /gateways/:id/priority`
- `GET /transactions`
- `GET /transactions/:id`
- `POST /transactions/:id/refund`

## Matriz de acesso (resumo)

- `ADMIN`: usuários, produtos, clientes, transações, gateways, refund
- `MANAGER`: usuários, produtos, clientes, transações
- `FINANCE`: produtos, clientes, transações, refund
- `USER`: sem acesso a backoffice (`clients`, `transactions`, `gateways`, `users`)

## Variáveis de ambiente principais

Aplicação:

- `APP_KEY`
- `LOG_LEVEL`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `GATEWAY1_URL`, `GATEWAY1_EMAIL`, `GATEWAY1_TOKEN`
- `GATEWAY2_URL`, `GATEWAY2_AUTH_TOKEN`, `GATEWAY2_AUTH_SECRET`

Tracing:

- `OTEL_TRACING_ENABLED`
- `OTEL_DIAGNOSTICS_ENABLED`
- `OTEL_SERVICE_NAME`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

Testes:

- `RUN_REAL_GATEWAY_TESTS=true`

## Comandos de validação

Base:

```bash
npm run lint
npm run typecheck
npm test
```

Smoke funcional:

```bash
./scripts/smoke-e2e.sh
```

Smoke de observabilidade:

```bash
./scripts/smoke-observability.sh
```

## CI e release

- CI principal: `.github/workflows/ci.yml` (branch `master`)
- Smoke de observabilidade: `.github/workflows/observability-smoke.yml` (manual)
- Release Please: `.github/workflows/release-please.yml`

## Documentos relacionados

- [Início rápido](./QUICK-START.md)
- [Arquitetura](./ARCHITECTURE.md)
- [Integrações](./INTEGRATIONS.md)
- [Infra](./INFRA.md)
- [Segurança](./SECURITY.md)
- [Observabilidade](./OBSERVABILITY.md)
- [Runbook](./RUNBOOK.md)
