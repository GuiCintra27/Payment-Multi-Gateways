# Observability

Stack opcional de observabilidade para demonstracao operacional do projeto.

## Objetivo

Esta camada nao e necessaria para o funcionamento da API. Ela existe para demonstrar maturidade operacional com baixo acoplamento ao core.

O escopo atual inclui:

- endpoint `/metrics` em formato Prometheus
- Prometheus para coleta
- Grafana para visualizacao
- dashboards provisionados automaticamente para operacao e demonstracao

## Como subir

Suba a stack principal junto com a stack de observabilidade:

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build
```

## Portas padrao

| Servico    | URL padrao              |
| ---------- | ----------------------- |
| Prometheus | `http://localhost:9090` |
| Grafana    | `http://localhost:3005` |

Portas podem ser sobrescritas com:

- `PROMETHEUS_PORT`
- `GRAFANA_PORT`

## Credenciais do Grafana

Padrao:

- usuario: `admin`
- senha: `admin`

Podem ser sobrescritas com:

- `GRAFANA_ADMIN_USER`
- `GRAFANA_ADMIN_PASSWORD`

## Fonte de dados

O Grafana provisiona automaticamente uma datasource `Prometheus` apontando para:

```text
http://prometheus:9090
```

Tambem provisiona automaticamente uma pasta `Payment Gateway` com dois dashboards:

- `Payment Gateway Overview`
- `Gateway Reliability`

## Metricas disponiveis

Exemplos de metricas expostas:

- `app_purchases_total`
- `app_purchase_amount_cents_total`
- `app_refunds_total`
- `app_refund_amount_cents_total`
- `app_gateway_charge_attempts_total`
- `app_gateway_charge_success_total`
- `app_gateway_charge_failures_total`
- `app_gateway_refund_attempts_total`
- `app_gateway_refund_success_total`
- `app_gateway_refund_failures_total`
- `app_gateway_fallback_activated_total`
- `app_gateway_fallback_recovered_total`
- `app_gateway_no_active_total`
- `app_gateway_all_failed_total`

## Dashboards provisionados

### Payment Gateway Overview

Leitura executiva e de negocio:

- taxa de aprovacao
- GMV aprovado
- taxa de refund
- taxa de recuperacao por fallback
- compras por status final
- volume financeiro aprovado e reembolsado por gateway
- distribuicao de sucesso por gateway
- incidentes de fallback, indisponibilidade e exaustao total

### Gateway Reliability

Leitura operacional por integracao:

- taxa de sucesso de charge por gateway
- taxa de falha de charge por gateway
- taxa de sucesso de refund por gateway
- tentativas de charge por gateway
- falhas de charge por gateway
- GMV aprovado por gateway
- eficiencia do fallback ao longo do tempo

## Consultas uteis no Prometheus

Total de compras aprovadas:

```promql
app_purchases_total{status="approved"}
```

Falhas por gateway:

```promql
app_gateway_charge_failures_total
```

Refunds com sucesso:

```promql
app_refunds_total{status="success"}
```

Volume aprovado por gateway:

```promql
sum by (gateway) (increase(app_purchase_amount_cents_total{status="approved"}[1h])) / 100
```

Taxa de recuperacao por fallback:

```promql
sum(increase(app_gateway_fallback_recovered_total[1h]))
/
clamp_min(sum(increase(app_gateway_fallback_activated_total[1h])), 1)
```

## Limites atuais

- nao ha alertas configurados
- nao ha Loki/Promtail
- nao ha traces distribuídos
- as metricas sao mantidas em memoria da aplicacao

## Quando usar

Esta stack vale para:

- demonstracao tecnica
- troubleshooting local
- inspecao rapida de comportamento da API

Nao substitui uma observabilidade de producao completa.
