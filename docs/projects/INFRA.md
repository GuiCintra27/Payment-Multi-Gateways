# Infra

Resumo da infraestrutura local e de CI.

## Docker Compose

Servicos definidos em `docker-compose.yaml`:

| Servico        | Funcao                  | Porta          |
| -------------- | ----------------------- | -------------- |
| `mysql`        | persistencia principal  | `3306`         |
| `gateway-mock` | mocks dos dois gateways | `3001`, `3002` |
| `app`          | API AdonisJS            | `3333`         |

Endpoints operacionais da app:

- `/` para health check
- `/metrics` para metricas Prometheus

Stack opcional de observabilidade em `docker-compose.monitoring.yaml`:

| Servico      | Funcao                            | Porta padrao |
| ------------ | --------------------------------- | ------------ |
| `prometheus` | coleta de metricas                | `9090`       |
| `grafana`    | visualizacao e correlacao         | `3005`       |
| `loki`       | armazenamento e consulta de logs  | `3100`       |
| `promtail`   | coleta de logs dos containers     | interna (`9080`) |
| `tempo`      | armazenamento e consulta de trace | `3200`       |

Provisionamento automatico do Grafana:

- datasource `Prometheus`
- datasource `Loki`
- datasource `Tempo`
- pasta `Payment Gateway`
- dashboard `Payment Gateway Overview`
- dashboard `Gateway Reliability`
- dashboard `Payment Incident Triage`

## Comportamento do container da app

Ao subir a stack completa, o servico `app` executa:

```sh
node ace migration:run --force
node ace db:seed
node bin/server.js
```

## Persistencia

- volume `mysql_data` para dados do MySQL
- volume `prometheus_data` para metricas
- volume `grafana_data` para estado do Grafana
- volume `loki_data` para logs
- volume `tempo_data` para traces

## CI

O workflow principal:

- usa `node:24`
- sobe MySQL 8 como service
- sobe `matheusprotzen/gateways-mock`
- espera os mocks responderem
- roda `npm run lint`
- roda `npm run typecheck`
- roda `node ace migration:fresh --force`
- roda `npm test`

Depois disso, um job de smoke sobe a stack via Docker Compose.
Esse job executa `./scripts/smoke-e2e.sh` para validar login, produto, compra, transacao, refund e metricas.

Smoke de observabilidade:

- workflow manual `observability-smoke.yml`
- executa `./scripts/smoke-observability.sh`
- nao bloqueia CI principal

## Variaveis principais

| Variavel                 | Uso                             |
| ------------------------ | ------------------------------- |
| `APP_KEY`                | chave da app                    |
| `LOG_LEVEL`              | nivel de log                    |
| `DB_*`                   | conexao com MySQL               |
| `GATEWAY1_*`             | integracao com gateway 1        |
| `GATEWAY2_*`             | integracao com gateway 2        |
| `OTEL_TRACING_ENABLED`   | liga/desliga tracing OTEL       |
| `OTEL_SERVICE_NAME`      | nome do servico OTEL            |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | endpoint OTLP HTTP de traces |
| `RUN_REAL_GATEWAY_TESTS` | habilita testes reais com mocks |

## Ambientes praticos

### Dev local

- app no host
- banco e mocks via Docker

### Full Docker

- tudo em containers

### Full Docker com observabilidade

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build
```

### Validacao de CI local

O projeto foi validado em ambiente dockerizado com `node:24`, MySQL e gateway mocks reais.
