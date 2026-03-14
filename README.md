# Payment Multi Gateway

API REST multi-gateway de pagamentos implementada com AdonisJS 6, TypeScript e MySQL.

## Visão geral

O projeto cobre fluxo de compra pública com múltiplos produtos, cálculo de total no servidor, fallback automático por prioridade entre gateways e reembolso no gateway original da transação.

Também inclui camada de operação com:

- `X-Request-Id` end-to-end;
- métricas em `/metrics`;
- stack opcional de logs e traces (Loki/Promtail/Tempo);
- smoke funcional e smoke de observabilidade.

## Tecnologias

- Node.js 24+
- AdonisJS 6
- TypeScript
- MySQL 8 + Lucid ORM
- VineJS
- Japa
- Prometheus + Grafana (opcional)
- Loki + Tempo (opcional)

## Início rápido

Opção recomendada:

```bash
./scripts/start-dev.sh
```

Stack completa via Docker:

```bash
docker compose up --build
```

Com observabilidade opcional:

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build
```

## O que este projeto demonstra

- modelagem e persistência para domínio de pagamentos;
- Strategy + Factory para adapters de gateway com contratos distintos;
- fallback resiliente entre gateways ativos;
- RBAC por perfis de backoffice;
- logs estruturados e correlação por `requestId` e `trace_id`;
- validação automatizada de fluxos críticos.

## Mapa de documentação

Comece aqui:

- `docs/projects/INDEX.md`

Documentação principal:

- `docs/projects/QUICK-START.md`
- `docs/projects/TECHNICAL-REFERENCE.md`
- `docs/projects/ARCHITECTURE.md`
- `docs/projects/FLOWS.md`
- `docs/projects/INTEGRATIONS.md`
- `docs/projects/DATA-MODEL.md`
- `docs/projects/SECURITY.md`
- `docs/projects/INFRA.md`
- `docs/projects/OBSERVABILITY.md`
- `docs/projects/RUNBOOK.md`

## Operação e validação

Validações principais:

```bash
npm run lint
npm run typecheck
npm test
./scripts/smoke-e2e.sh
./scripts/smoke-observability.sh
```

## Estado atual

Projeto pronto para entrega técnica em contexto de produção.

Pontos extras pendentes apenas como opcionais: alertas operacionais e evolução enterprise da pipeline de observabilidade.
