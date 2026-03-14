# Status Atual do Projeto

Snapshot consolidado em 2026-03-14.

## Resumo executivo

O projeto está funcional e com bônus de senioridade entregues.
O core de pagamentos, a cobertura de testes principal e a camada de observabilidade avançada opcional estão implementados e validados.

## Atualizações recentes (2026-03-14)

- revisão de coerência e acentuação da documentação ativa (`README`, `AGENTS`, `docs/local`, `docs/projects`)
- saneamento da resposta de `/gateways` para não expor `credentials`
- inclusão de teste funcional para validar que `/gateways` não retorna `credentials`

## Status por fase

| Fase | Situação | Resultado |
| ---- | -------- | --------- |
| F1 | Concluída | setup, Docker, CI e release automation |
| F2 | Concluída | modelagem, migrations, seeders, auth e RBAC |
| F3 | Concluída | compra, fallback por prioridade, transações e refund |
| F4 | Concluída | cobertura dos fluxos críticos e cenários de erro principais |
| F5 | Concluída | documentação pública em `docs/projects/` |
| F6 | Concluída | `X-Request-Id`, `/metrics`, smoke operacional e dashboards base |
| F7 | Concluída | logs centralizados + tracing leve + correlação + smoke opcional |

## Resultado da fase F7 (Logs + Tracing)

### Concluído

- `docker-compose.monitoring.yaml` expandido com:
  - `loki`
  - `promtail`
  - `tempo`
  - mantendo `prometheus` e `grafana`
- configurações versionadas:
  - `observability/loki/loki.yml`
  - `observability/promtail/promtail.yml`
  - `observability/tempo/tempo.yml`
- tracing leve com OpenTelemetry:
  - bootstrap em `start/telemetry.ts`
  - lifecycle em `app/services/telemetry_service.ts`
  - spans manuais em compra, orquestração/fallback e refund
- padronização de log contextual:
  - `app/services/observability_log_context.ts`
  - campos: `requestId`, `route`, `gateway`, `transactionId`, `status`, `trace_id`
- correlação operacional:
  - datasource `Loki` + `Tempo` provisionadas no Grafana
  - derived field por `trace_id`
- dashboard novo provisionado:
  - `Payment Incident Triage`
- documentação reorganizada em formato de hub:
  - `docs/projects/TECHNICAL-REFERENCE.md`
  - `docs/archive/README.md`
  - `docs/local/README.md`
  - documentos legados movidos para `docs/archive/local/`
- smoke de observabilidade:
  - `scripts/smoke-observability.sh`
  - valida logs no Loki e traces no Tempo para compra/fallback/refund/no-active
- workflow opcional manual:
  - `.github/workflows/observability-smoke.yml`
  - `workflow_dispatch`, não bloqueante da CI principal

### Parcial

- nenhum item parcial dentro do escopo definido do F7

### Pendente real

- alertas operacionais (Prometheus/Grafana Alerting)
- evolução para pipeline enterprise de logs/tracing (retenção longa, políticas multi-tenant, SIEM)

### Validação executada

Executado localmente em 2026-03-13:

- `npm run lint`
- `npm run typecheck`
- `NODE_ENV=test ... node ace migration:fresh --force`
- `NODE_ENV=test ... RUN_REAL_GATEWAY_TESTS=true npm test`
  - resultado: `66/66` testes passando
- `./scripts/smoke-e2e.sh`
- `./scripts/smoke-observability.sh`
  - cenários validados:
    - datasources do Grafana provisionadas (`Prometheus`, `Loki`, `Tempo`)
    - compra com fallback
    - refund
    - erro controlado sem gateways ativos
    - ingestão de logs no Loki
    - presença de spans no Tempo

## Estado por área

| Área | Status |
| ---- | ------ |
| Core de negócio (purchase/fallback/refund) | Concluído |
| Integração com gateways mockados | Concluído |
| Segurança básica de API/RBAC | Concluído |
| Observabilidade leve (`X-Request-Id` + metrics) | Concluído |
| Observabilidade avançada opcional (Loki/Promtail/Tempo) | Concluído |
| Documentação pública | Concluído |
| CI principal (lint/typecheck/test/smoke-e2e) | Concluído |
| CI opcional de observabilidade | Concluído |

## Próxima fase ativa

Não há fase obrigatória pendente para o escopo atual.
Próximos incrementos são opcionais (alertas e evolução de observabilidade).
