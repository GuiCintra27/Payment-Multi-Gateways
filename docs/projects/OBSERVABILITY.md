# Observabilidade

Stack opcional de observabilidade avançada para demonstração operacional, sem alterar endpoints de negócio.

## Objetivo

Esta camada existe para elevar maturidade técnica percebida com baixo acoplamento ao core de pagamentos.

Escopo implementado:

- métricas Prometheus em `/metrics`
- logs centralizados com Loki + Promtail
- tracing distribuído leve com OpenTelemetry + Tempo
- correlação por `requestId` e `trace_id`
- Grafana com datasources e dashboards provisionados
- smoke opcional de observabilidade (`scripts/smoke-observability.sh`)

## Como subir

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build
```

## Componentes e portas padrão

| Serviço      | URL padrão              |
| ------------ | ----------------------- |
| Prometheus   | `http://localhost:9090` |
| Grafana      | `http://localhost:3005` |
| Loki         | `http://localhost:3100` |
| Tempo        | `http://localhost:3200` |
| OTLP HTTP    | `http://localhost:4318` |

Variáveis de porta suportadas:

- `PROMETHEUS_PORT`
- `GRAFANA_PORT`
- `LOKI_PORT`
- `TEMPO_PORT`
- `OTLP_HTTP_PORT`

## Tracing da aplicação

A aplicação suporta tracing por variáveis de ambiente:

- `OTEL_TRACING_ENABLED` (default recomendado: `false` fora da stack de observabilidade)
- `OTEL_SERVICE_NAME`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`
- `OTEL_DIAGNOSTICS_ENABLED`

No overlay de observabilidade, o tracing já sobe apontando para:

```text
http://tempo:4318/v1/traces
```

## Logs estruturados

Fluxos críticos (compra, fallback e refund) foram padronizados para incluir:

- `requestId`
- `route`
- `gateway`
- `transactionId`
- `status`
- `trace_id` (quando houver span ativo)

Regras de segurança aplicadas:

- não logar PAN completo
- não logar CVV
- não expor credenciais de gateway

## Grafana provisionado

Datasources provisionadas automaticamente:

- `Prometheus` (`uid: prometheus`)
- `Loki` (`uid: loki`)
- `Tempo` (`uid: tempo`)

Correlação habilitada:

- Loki -> Tempo por `trace_id` (derived field)
- Tempo -> Loki para logs por trace

Dashboards provisionados na pasta `Payment Gateway`:

- `Payment Gateway Overview`
- `Gateway Reliability`
- `Payment Incident Triage`

## Consultas úteis

### Prometheus

```promql
sum(increase(app_gateway_fallback_activated_total[1h]))
```

```promql
sum(increase(app_gateway_all_failed_total[1h]))
```

### Loki (LogQL)

Logs de erro por request:

```logql
{service="app"} | json | requestId="obs-smoke-123-fallback" | status="error"
```

Fallbacks:

```logql
{service="app"} |= "Gateway charge failed, trying next"
```

### Tempo API

Consulta de trace por id:

```bash
curl http://localhost:3200/api/traces/<trace_id>
```

## Smoke de observabilidade

Script dedicado:

```bash
./scripts/smoke-observability.sh
```

Cenários cobertos:

- validação das datasources provisionadas no Grafana (`Prometheus`, `Loki`, `Tempo`)
- compra aprovada com fallback real (`gateway1` falha -> `gateway2` recupera)
- refund da transação fallback
- falha controlada sem gateways ativos (`503`)
- validação de logs no Loki e traces no Tempo

Workflow GitHub Actions opcional e manual:

- `.github/workflows/observability-smoke.yml`
- gatilho: `workflow_dispatch`
- não bloqueia a CI principal

## Troubleshooting rápido

Se Loki/Tempo não responderem:

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml logs -f loki promtail tempo
```

Se o Grafana não mostrar traces:

1. validar datasource `Tempo` provisionada
2. confirmar `OTEL_TRACING_ENABLED=true` no container `app` da stack de observabilidade
3. gerar tráfego novo (purchase/refund) e consultar Explore novamente

## Limites atuais

- sem alertas operacionais configurados
- sem pipeline enterprise de logs/tracing (ex.: retenção de longo prazo, multi-tenant, SIEM)
- métricas da aplicação mantidas em memória

Esta stack é focada em demonstração técnica e troubleshooting local.
