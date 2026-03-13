# BeTalent Payment Gateway

API REST multi-gateway de pagamentos para o teste tecnico BeTalent, implementada com AdonisJS 6, TypeScript e MySQL.

## Visao geral

O projeto cobre fluxo de compra publica com multiplos produtos, calculo de total no servidor, fallback automatico por prioridade entre gateways e refund no gateway original da transacao.

Tambem inclui camada de operacao com:

- `X-Request-Id` end-to-end;
- metricas em `/metrics`;
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

## Inicio rapido

Opcao recomendada:

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

- modelagem e persistencia para dominio de pagamentos;
- Strategy + Factory para adapters de gateway com contratos distintos;
- fallback resiliente entre gateways ativos;
- RBAC por perfis de backoffice;
- logs estruturados e correlacao por `requestId` e `trace_id`;
- validacao automatizada de fluxos criticos.

## Mapa de documentacao

Comece aqui:

- `docs/projects/INDEX.md`

Documentacao principal:

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

## Operacao e validacao

Validacoes principais:

```bash
npm run lint
npm run typecheck
npm test
./scripts/smoke-e2e.sh
./scripts/smoke-observability.sh
```

## Estado atual

Projeto pronto para entrega tecnica no escopo do teste.

Pontos extras pendentes apenas como opcional: alertas operacionais e evolucao enterprise da pipeline de observabilidade.
