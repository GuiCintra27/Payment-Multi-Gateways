# Indice de documentacao

Ponto de entrada principal para a documentacao publica do projeto.

## Comecando

- [Inicio rapido](./QUICK-START.md)
- [Referencia tecnica](./TECHNICAL-REFERENCE.md)
- [Guia operacional](./RUNBOOK.md)

## Arquitetura e dados

- [Arquitetura](./ARCHITECTURE.md)
- [Modelo de dados](./DATA-MODEL.md)
- [Fluxos](./FLOWS.md)
- [Integracoes](./INTEGRATIONS.md)

## Plataforma e operacao

- [Infra](./INFRA.md)
- [Seguranca](./SECURITY.md)
- [Observabilidade](./OBSERVABILITY.md)

## Escopo coberto

- compra publica com multiplos produtos
- calculo de total no servidor
- fallback automatico entre gateways por prioridade
- refund no gateway original da transacao
- RBAC (`ADMIN`, `MANAGER`, `FINANCE`, `USER`)
- logs correlacionados por `requestId` e `trace_id`
- metricas em `/metrics` e stack opcional com Loki/Tempo

## Arquivo

- [Arquivo de docs do projeto](./archive/)
- [Arquivo historico interno](../archive/)
