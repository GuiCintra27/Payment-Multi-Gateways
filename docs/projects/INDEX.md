# Project Docs Index

Hub principal da documentacao publica do projeto.

## Leitura recomendada

1. [QUICK-START.md](./QUICK-START.md)
2. [ARCHITECTURE.md](./ARCHITECTURE.md)
3. [FLOWS.md](./FLOWS.md)
4. [INTEGRATIONS.md](./INTEGRATIONS.md)
5. [DATA-MODEL.md](./DATA-MODEL.md)
6. [SECURITY.md](./SECURITY.md)
7. [INFRA.md](./INFRA.md)
8. [RUNBOOK.md](./RUNBOOK.md)
9. [OBSERVABILITY.md](./OBSERVABILITY.md)

## Resumo do sistema

Esta API recebe compras publicas, calcula o total no servidor, tenta cobrar no gateway ativo de maior prioridade e, em caso de falha, faz fallback automatico para os proximos gateways ativos. Em seguida, persiste a transacao, os produtos comprados e permite reembolso no gateway original.

## Escopo coberto

- autenticacao por access token
- RBAC por role
- CRUD de usuarios
- CRUD de produtos
- listagem de clientes
- listagem e detalhe de transacoes
- compra publica
- reembolso
- gestao de gateways

## Estado atual

- Core funcional: concluido
- Testes dos fluxos principais: validados
- Documentacao publica minima: concluida
- Observabilidade leve: `X-Request-Id` implementado
- Observabilidade leve: `/metrics` implementado
- Operação: smoke automatizado implementado
- Observabilidade avancada: opcional via compose dedicado

## Documentos locais

Documentos de trabalho interno ficam em `docs/local/`:

- `handoff-status.md`
- `implementation-roadmap.md`
