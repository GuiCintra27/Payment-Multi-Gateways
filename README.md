# BeTalent Payment Gateway

API REST multi-gateway de pagamentos construída com AdonisJS 6, TypeScript e MySQL para atender ao teste técnico da BeTalent.

O projeto implementa compra publica com multiplos produtos, calculo do total no servidor, fallback automatico entre gateways por prioridade, RBAC, reembolso e cobertura automatizada dos fluxos principais.

## Destaques

- AdonisJS 6 com TypeScript
- MySQL 8 com Lucid ORM
- Dois gateways com autenticacao e contratos distintos
- Fallback automatico por prioridade
- Access Tokens opaque para autenticacao
- RBAC com `ADMIN`, `MANAGER`, `FINANCE` e `USER`
- `X-Request-Id` com propagacao basica para os gateways
- Docker Compose para app, banco e mocks
- Suite validada com `49/49` testes passando em `node:24`

## Stack

- Runtime: Node.js 24+
- Framework: AdonisJS 6
- Banco: MySQL 8
- ORM: Lucid
- Validacao: VineJS
- Testes: Japa

## Subir localmente

### Opcao recomendada

```bash
./scripts/start-dev.sh
```

### Stack completa via Docker

```bash
docker compose up --build
```

## Endpoints e portas

- API: `http://localhost:3333`
- Gateway Mock 1: `http://localhost:3001`
- Gateway Mock 2: `http://localhost:3002`
- MySQL: `localhost:3306`

## Documentacao

- [Hub de documentacao](docs/projects/INDEX.md)
- [Quick start](docs/projects/QUICK-START.md)
- [Arquitetura](docs/projects/ARCHITECTURE.md)
- [Modelo de dados](docs/projects/DATA-MODEL.md)
- [Fluxos](docs/projects/FLOWS.md)
- [Integracoes](docs/projects/INTEGRATIONS.md)
- [Infra](docs/projects/INFRA.md)
- [Seguranca](docs/projects/SECURITY.md)
- [Runbook](docs/projects/RUNBOOK.md)

## Estado atual

O core funcional, a documentacao publica e a base principal de testes ja estao implementados e validados. Os proximos incrementos naturais sao metricas em `/metrics`, smoke operacional dedicado e ampliacao de cenarios de teste.
