# Roadmap de Implementacao

Roadmap revisado em 2026-03-13 com base no estado real do repositorio.

## Objetivo

Entregar e sustentar uma API multi-gateway para o teste tecnico BeTalent com:

- corretude funcional de compra, fallback e refund
- cobertura de testes dos fluxos criticos
- documentacao profissional e sincronizada
- sinais claros de senioridade com baixo acoplamento

## Principio de execucao

Prioridade sempre em alinhamento entre:

1. requisito
2. codigo
3. testes
4. documentacao

## Fases

| Fase | Objetivo | Status |
| ---- | -------- | ------ |
| F1 | Setup, Docker, CI e release automation | Concluida |
| F2 | Modelagem, migrations, seeders, auth e RBAC | Concluida |
| F3 | Core de compra, gateways, transacoes e refund | Concluida |
| F4 | Testes dos fluxos criticos | Concluida |
| F5 | Documentacao publica | Concluida |
| F6 | Bonus de observabilidade leve e operacao | Concluida |
| F7 | Logs centralizados + tracing leve | Concluida |

## Resultado consolidado por fase

### F1

- compose, Dockerfile, scripts, CI e Release Please entregues

### F2

- schema principal, seeders, auth e RBAC entregues

### F3

- compra publica, fallback por prioridade, persistencia de transacoes e refund entregues

### F4

- suite funcional/unitaria cobrindo fluxos criticos entregue
- validacao com mocks reais habilitada por `RUN_REAL_GATEWAY_TESTS`

### F5

- `README.md` e `docs/projects/` entregues

### F6

- `X-Request-Id`, `/metrics`, dashboards base e smoke operacional entregues

### F7

- Loki + Promtail + Tempo no overlay opcional entregues
- OpenTelemetry com spans manuais minimos entregue
- correlacao `requestId` + `trace_id` em logs/traces entregue
- dashboard de triagem de incidente entregue
- smoke de observabilidade + workflow manual opcional entregue
- reorganizacao documental em padrao `projects/local/archive` entregue

## Validacao do ciclo atual

Executado em 2026-03-13:

- `npm run lint`
- `npm run typecheck`
- `NODE_ENV=test ... node ace migration:fresh --force`
- `NODE_ENV=test ... RUN_REAL_GATEWAY_TESTS=true npm test`
  - resultado: `66/66` testes passando
- `./scripts/smoke-e2e.sh`
- `./scripts/smoke-observability.sh`

## Backlog real apos F7

### Prioridade 1 (opcional)

- alertas operacionais (ex.: `all_failed_total`, `no_active_total`, erro por gateway)

### Prioridade 2 (opcional)

- evolucao de observabilidade para perfil enterprise:
  - retention mais longa
  - politicas de custo/volume
  - integracao com stack central corporativa

### Fora de escopo deste teste

- mensageria/outbox/DLQ
- antifraude dedicado
- arquitetura distribuida completa

## Fase ativa

Sem fase obrigatoria ativa.
Projeto pronto para apresentacao tecnica, com incrementos futuros opcionais.
