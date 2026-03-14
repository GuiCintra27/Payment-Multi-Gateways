# Roadmap de Implementação

Roadmap revisado em 2026-03-14 com base no estado real do repositório.

## Objetivo

Entregar e sustentar uma API multi-gateway de pagamentos com:

- corretude funcional de compra, fallback e refund
- cobertura de testes dos fluxos críticos
- documentação profissional e sincronizada
- sinais claros de senioridade com baixo acoplamento

## Princípio de execução

Prioridade sempre em alinhamento entre:

1. requisito
2. código
3. testes
4. documentação

## Fases

| Fase | Objetivo | Status |
| ---- | -------- | ------ |
| F1 | Setup, Docker, CI e release automation | Concluída |
| F2 | Modelagem, migrations, seeders, auth e RBAC | Concluída |
| F3 | Core de compra, gateways, transações e refund | Concluída |
| F4 | Testes dos fluxos críticos | Concluída |
| F5 | Documentação pública | Concluída |
| F6 | Bônus de observabilidade leve e operação | Concluída |
| F7 | Logs centralizados + tracing leve | Concluída |

## Resultado consolidado por fase

### F1

- compose, Dockerfile, scripts, CI e Release Please entregues

### F2

- schema principal, seeders, auth e RBAC entregues

### F3

- compra pública, fallback por prioridade, persistência de transações e refund entregues

### F4

- suíte funcional/unitária cobrindo fluxos críticos entregue
- validação com mocks reais habilitada por `RUN_REAL_GATEWAY_TESTS`

### F5

- `README.md` e `docs/projects/` entregues

### F6

- `X-Request-Id`, `/metrics`, dashboards base e smoke operacional entregues

### F7

- Loki + Promtail + Tempo no overlay opcional entregues
- OpenTelemetry com spans manuais mínimos entregue
- correlação `requestId` + `trace_id` em logs/traces entregue
- dashboard de triagem de incidente entregue
- smoke de observabilidade + workflow manual opcional entregue
- reorganização documental em padrão `projects/local/archive` entregue

## Validação do ciclo atual

Executado em 2026-03-13:

- `npm run lint`
- `npm run typecheck`
- `NODE_ENV=test ... node ace migration:fresh --force`
- `NODE_ENV=test ... RUN_REAL_GATEWAY_TESTS=true npm test`
  - resultado: `66/66` testes passando
- `./scripts/smoke-e2e.sh`
- `./scripts/smoke-observability.sh`

## Backlog real após F7

### Prioridade 1 (opcional)

- alertas operacionais (ex.: `all_failed_total`, `no_active_total`, erro por gateway)

### Prioridade 2 (opcional)

- evolução de observabilidade para perfil enterprise:
  - retenção mais longa
  - políticas de custo/volume
  - integração com stack central corporativa

### Fora de escopo deste ciclo

- mensageria/outbox/DLQ
- antifraude dedicado
- arquitetura distribuída completa

## Fase ativa

Sem fase obrigatória ativa.
Projeto pronto para apresentação técnica, com incrementos opcionais futuros.
