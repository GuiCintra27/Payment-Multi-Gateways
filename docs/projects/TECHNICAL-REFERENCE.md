# Referencia tecnica

Guia de consulta rapida para setup, operacao e avaliacao tecnica.

## Servicos e portas

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

Publicos:

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

- `ADMIN`: usuarios, produtos, clientes, transacoes, gateways, refund
- `MANAGER`: usuarios, produtos, clientes, transacoes
- `FINANCE`: produtos, clientes, transacoes, refund
- `USER`: sem acesso a backoffice (`clients`, `transactions`, `gateways`, `users`)

## Variaveis de ambiente principais

Aplicacao:

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

## Comandos de validacao

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
- Smoke observabilidade: `.github/workflows/observability-smoke.yml` (manual)
- Release Please: `.github/workflows/release-please.yml`

## Documentos relacionados

- [Inicio rapido](./QUICK-START.md)
- [Arquitetura](./ARCHITECTURE.md)
- [Integracoes](./INTEGRATIONS.md)
- [Infra](./INFRA.md)
- [Seguranca](./SECURITY.md)
- [Observabilidade](./OBSERVABILITY.md)
- [Runbook](./RUNBOOK.md)
