# Início rápido

Como subir e validar o projeto rapidamente.

## Requisitos

- Node.js 24+
- npm
- Docker com `docker compose`

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário.

Variáveis principais:

- `APP_KEY`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `GATEWAY1_URL`, `GATEWAY2_URL`
- `GATEWAY1_EMAIL`, `GATEWAY1_TOKEN`
- `GATEWAY2_AUTH_TOKEN`, `GATEWAY2_AUTH_SECRET`

## Opção 1: desenvolvimento local (recomendada)

```bash
./scripts/start-dev.sh
```

Esse fluxo:

- sobe MySQL e gateway mocks
- instala dependências, se necessário
- roda migrations
- roda seeders
- inicia o servidor AdonisJS com HMR

## Opção 2: stack completa via Docker

```bash
docker compose up --build
```

## Opção 3: stack completa com observabilidade opcional

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build
```

Nesse modo, o container da aplicação executa:

- `node ace migration:run --force`
- `node ace db:seed`
- `node bin/server.js`

E a stack de observabilidade sobe com:

- Prometheus em `http://localhost:9090`
- Grafana em `http://localhost:3005`
- Loki em `http://localhost:3100`
- Tempo em `http://localhost:3200`
- dashboards provisionados automaticamente na pasta `Payment Gateway`

## Credenciais seed

- usuário admin seedado disponível no ambiente local
- para detalhes, consulte `database/seeders/01_admin_seeder.ts`

## Validação rápida

### Health check

```bash
curl http://localhost:3333
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-03-13T00:00:00.000Z"
}
```

### Metrics

```bash
curl http://localhost:3333/metrics
```

### Rodar testes

```bash
npm test
```

### Lint e typecheck

```bash
npm run lint
npm run typecheck
```

### Smoke operacional

Com a app já rodando:

```bash
./scripts/smoke-e2e.sh
```

### Smoke de observabilidade opcional

Com a stack de observabilidade ativa:

```bash
./scripts/smoke-observability.sh
```

## Credenciais e portas padrão

| Recurso        | URL/porta               |
| -------------- | ----------------------- |
| API            | `http://localhost:3333` |
| Gateway Mock 1 | `http://localhost:3001` |
| Gateway Mock 2 | `http://localhost:3002` |
| MySQL          | `localhost:3306`        |
| Prometheus     | `http://localhost:9090` |
| Grafana        | `http://localhost:3005` |
| Loki           | `http://localhost:3100` |
| Tempo          | `http://localhost:3200` |

## Próximos docs recomendados

- [Referência técnica](./TECHNICAL-REFERENCE.md)
- [Infra](./INFRA.md)
- [Runbook](./RUNBOOK.md)
