# Índice de documentação

Ponto de entrada principal para a documentação pública do projeto.

## Começando

- [Início rápido](./QUICK-START.md)
- [Referência técnica](./TECHNICAL-REFERENCE.md)
- [Guia operacional](./RUNBOOK.md)

## Arquitetura e dados

- [Arquitetura](./ARCHITECTURE.md)
- [Modelo de dados](./DATA-MODEL.md)
- [Fluxos](./FLOWS.md)
- [Integrações](./INTEGRATIONS.md)

## Plataforma e operação

- [Infra](./INFRA.md)
- [Segurança](./SECURITY.md)
- [Observabilidade](./OBSERVABILITY.md)

## Escopo coberto

- compra pública com múltiplos produtos
- cálculo de total no servidor
- fallback automático entre gateways por prioridade
- refund no gateway original da transação
- RBAC (`ADMIN`, `MANAGER`, `FINANCE`, `USER`)
- logs correlacionados por `requestId` e `trace_id`
- métricas em `/metrics` e stack opcional com Loki/Tempo

## Arquivo

- [Arquivo de docs do projeto](./archive/)
- [Arquivo histórico interno](../archive/)
