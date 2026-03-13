# Roadmap de Implementação

Plano revisado a partir do estado real do repositório e dos padrões extraídos do projeto de referência `~/Projects/Mine/payment-gateway`.

## Objetivo do projeto

Entregar uma API REST multi-gateway para o teste técnico BeTalent, com foco em:

- correção funcional do fluxo de compra e reembolso
- boa organização arquitetural
- documentação profissional
- sinais claros de maturidade técnica sem cair em overengineering

## Princípio de priorização

Antes de adicionar bônus, o projeto precisa ficar consistente com o que já promete:

1. requisito
2. implementação
3. testes
4. documentação

Se esses quatro itens não estiverem alinhados, o ganho percebido de qualquer bônus cai.

## Fases revisadas

| Fase | Objetivo | Status |
|---|---|---|
| F1 | Setup, Docker, CI e automação de release | Concluída |
| F2 | Modelagem, migrations, models, seeders, auth e RBAC | Concluída |
| F3 | Core funcional de compras, gateways, transações e refund | Parcialmente concluída |
| F4 | Testes dos fluxos críticos | Pendente em boa parte |
| F5 | Documentação pública do projeto | Pendente |
| F6 | Bônus de senioridade de alto retorno | Pendente |

## Resultado por fase

### F1 - Setup, Docker, CI e automação de release

Status: concluída

Concluído:

- `docker-compose.yaml` com app, MySQL e gateway mocks
- `Dockerfile`
- `scripts/start-dev.sh`
- workflow de CI
- Release Please

Validação registrada:

- revisão estrutural do repositório
- rotas, compose, scripts e workflows presentes no código

### F2 - Modelagem, migrations, models, seeders, auth e RBAC

Status: concluída

Concluído:

- migrations principais
- models principais
- seeders de admin e gateways
- login/logout com access token
- middleware RBAC
- CRUDs de usuários e produtos

Validação registrada:

- revisão estática de migrations, models, rotas, controllers e validators

### F3 - Core funcional de compras, gateways, transações e refund

Status: parcialmente concluída

Concluído:

- fluxo principal de compra implementado
- adapters dos dois gateways implementados
- fallback por prioridade implementado
- listagem e detalhe de transações implementados
- refund implementado
- permissão de `transactions` alinhada para incluir `USER`
- reorder de prioridade dos gateways ajustado para manter sequência única
- resposta explícita para compra quando não há gateways ativos

Parcial:

- compra pública com cobertura funcional inicial
- fallback ainda sem prova integrada com os mocks reais
- refund com cobertura funcional inicial
- gestão de gateways com cobertura inicial, mas ainda não completa

Pendente:

- testes de integração do fallback real entre gateways
- testes do fluxo completo de refund
- revisão final dos contratos de erro dos adapters

Validação registrada:

- revisão estática do código
- criação de cobertura funcional inicial para `transactions` e `gateways`

### F4 - Testes dos fluxos críticos

Status: parcialmente iniciada, ainda pendente em boa parte

Concluído:

- testes funcionais de auth
- testes funcionais de RBAC
- testes funcionais de users
- testes funcionais de products
- testes funcionais iniciais de transactions
- testes funcionais iniciais de gateways
- testes funcionais iniciais de purchases
- testes funcionais iniciais de refunds
- testes unitários de validators, `GatewayFactory` e `GatewayService`

Pendente:

- fallback real entre gateways
- integração com os gateway mocks
- cenários mais completos de purchase e refund

Validação registrada:

- apenas por inspeção de arquivos de teste nesta sessão
- sem execução local por indisponibilidade de `node` e `npm`

## Backlog por prioridade

### Prioridade 1: fechar o core já iniciado

- Adicionar testes de integração para fallback real entre gateways.
- Revisar contratos e tratamento de erro dos adapters.
- ampliar cenários funcionais de `POST /purchases` e `POST /transactions/:id/refund`
- ampliar testes dos endpoints de gateways e transações já iniciados

### Prioridade 2: documentação pública mínima

Criar `docs/projects/` com, no mínimo:

- `INDEX.md`
- `QUICK-START.md`
- `ARCHITECTURE.md`
- `DATA-MODEL.md`
- `FLOWS.md`
- `INTEGRATIONS.md`
- `INFRA.md`
- `SECURITY.md`
- `RUNBOOK.md`

Também criar `README.md` na raiz com visão executiva e links para os docs.

### Prioridade 3: bônus que mostram senioridade sem extrapolar o escopo

Itens recomendados:

- `X-Request-Id` em middleware e logs
- propagação do request ID para chamadas aos gateways
- endpoint `/metrics` com métricas mínimas de compra, refund e erro por gateway
- smoke test operacional documentado
- compose opcional de observabilidade, apenas se a implementação for leve

Itens opcionais, somente se houver tempo:

- `docker-compose.monitoring.yaml`
- `docs/projects/OBSERVABILITY.md`

Itens descartados para este teste:

- mensageria
- outbox
- DLQ
- antifraude separado
- chaos engineering

## Matriz de senioridade aplicável

| Item | Valor para recrutador | Custo | Decisão atual |
|---|---|---|---|
| Request ID + logs correlacionados | Alto | Baixo | Recomendado |
| Métricas básicas (`/metrics`) | Alto | Médio | Recomendado |
| Observabilidade completa com Grafana/Loki | Médio | Médio/Alto | Opcional |
| Smoke test real com gateways mockados | Alto | Médio | Recomendado |
| README e docs públicos profissionais | Alto | Médio | Recomendado |
| Multi-compose split por responsabilidade | Médio | Baixo | Opcional |
| Kafka, outbox, DLQ | Baixo para este teste | Alto | Não adotar |

## Critério de pronto

O projeto pode ser considerado pronto para apresentação quando:

- o fluxo principal de compra estiver testado
- o fallback entre gateways estiver provado por teste
- o refund estiver testado
- a documentação pública existir e bater com o código
- o `AGENTS.md` refletir o estado real do repositório
- pelo menos um bônus de senioridade de alto retorno estiver entregue

## Última atualização

- permissões de `transactions` alinhadas para incluir `USER`
- reorder de prioridade de gateways passou a manter sequência única
- cobertura funcional de `transactions` e `gateways` foi iniciada
- resultado das fases F1 a F4 consolidado na documentação local
- cobertura funcional de `purchases` e `refunds` foi iniciada
- prova unitária do fallback do `GatewayService` foi adicionada
