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

| Fase | Objetivo                                                 | Status                 |
| ---- | -------------------------------------------------------- | ---------------------- |
| F1   | Setup, Docker, CI e automação de release                 | Concluída              |
| F2   | Modelagem, migrations, models, seeders, auth e RBAC      | Concluída              |
| F3   | Core funcional de compras, gateways, transações e refund | Concluída              |
| F4   | Testes dos fluxos críticos                               | Parcialmente concluída |
| F5   | Documentação pública do projeto                          | Concluída              |
| F6   | Bônus de senioridade de alto retorno                     | Concluída              |

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

Status: concluída

Concluído:

- fluxo principal de compra implementado
- adapters dos dois gateways implementados
- adapters alinhados ao contrato real do mock
- fallback por prioridade implementado
- listagem e detalhe de transações implementados
- refund implementado
- permissão de `transactions` alinhada para incluir `USER`
- reorder de prioridade dos gateways ajustado para manter sequência única
- resposta explícita para compra quando não há gateways ativos

Validação registrada:

- revisão estática do código
- criação de cobertura funcional inicial para `transactions` e `gateways`
- inspeção manual do contrato real dos gateway mocks via `curl` em portas alternativas
- validação em ambiente dockerizado com `node:24`, MySQL e gateway mocks reais
- fallback real validado automaticamente contra os mocks
- `52/52` testes passando

### F4 - Testes dos fluxos críticos

Status: parcialmente concluída

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
- testes reais dos gateways adicionados de forma condicionada por `RUN_REAL_GATEWAY_TESTS`
- execução validada dos testes reais com gateway mocks
- suíte verde com `52/52` testes passando em ambiente dockerizado com `node:24`

Pendente:

- cenários mais completos de purchase e refund
- cenários mais completos de gateways e transactions

Validação registrada:

- `node ace migration:fresh --force`
- `npm run lint`
- `npm run typecheck`
- `node ace test`
- fallback real exercitado contra os mocks

### F5 - Documentação pública do projeto

Status: concluída

Concluído:

- `README.md` na raiz com visão executiva
- `docs/projects/INDEX.md`
- `docs/projects/QUICK-START.md`
- `docs/projects/ARCHITECTURE.md`
- `docs/projects/DATA-MODEL.md`
- `docs/projects/FLOWS.md`
- `docs/projects/INTEGRATIONS.md`
- `docs/projects/INFRA.md`
- `docs/projects/SECURITY.md`
- `docs/projects/RUNBOOK.md`

Validação registrada:

- revisão manual dos documentos criados contra o código atual
- links cruzados e estrutura pública mínima estabelecidos
- documentação alinhada ao estado real já validado da aplicação

### F6 - Bônus de senioridade de alto retorno

Status: parcialmente concluída

Concluído:

- middleware global de `X-Request-Id`
- eco do header na resposta HTTP
- propagação do `X-Request-Id` para cobrança e refund nos gateways
- logs principais de compra, fallback e refund enriquecidos com `requestId`
- testes funcionais de `X-Request-Id`
- endpoint `/metrics` em formato Prometheus
- métricas de compra, refund, tentativas e falhas por gateway
- testes funcionais de métricas
- smoke operacional automatizado em `scripts/smoke-e2e.sh`
- workflow de smoke da CI passou a executar o fluxo fim a fim

Validação registrada:

- `npm run lint`
- `npm run typecheck`
- `node ace test`
- suíte verde com `52/52` testes passando
- smoke operacional executado com sucesso em ambiente isolado com app, MySQL e gateway mocks

## Backlog por prioridade

### Prioridade 1: reforçar senioridade com baixo custo

- ampliar cenários funcionais de `POST /purchases` e `POST /transactions/:id/refund`
- ampliar testes dos endpoints de gateways e transações já iniciados
- manter o smoke operacional alinhado a qualquer mudança de fluxo principal

### Prioridade 2: documentação operacional e evidências

- manter `docs/projects/` sincronizado com qualquer mudança relevante
- adicionar documentação de observabilidade somente se o bônus for implementado

### Prioridade 3: bônus que mostram senioridade sem extrapolar o escopo

Itens recomendados:

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

| Item                                      | Valor para recrutador | Custo      | Decisão atual |
| ----------------------------------------- | --------------------- | ---------- | ------------- |
| Request ID + logs correlacionados         | Alto                  | Baixo      | Recomendado   |
| Métricas básicas (`/metrics`)             | Alto                  | Médio      | Recomendado   |
| Observabilidade completa com Grafana/Loki | Médio                 | Médio/Alto | Opcional      |
| Smoke test real com gateways mockados     | Alto                  | Médio      | Recomendado   |
| README e docs públicos profissionais      | Alto                  | Médio      | Recomendado   |
| Multi-compose split por responsabilidade  | Médio                 | Baixo      | Opcional      |
| Kafka, outbox, DLQ                        | Baixo para este teste | Alto       | Não adotar    |

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
- adapters e CI foram alinhados para o contrato real dos gateway mocks
- validação dockerizada com Node 24 passou com `52/52` testes
- Fase 5 concluída com `README.md` e documentação pública em `docs/projects/`
- `X-Request-Id`, `/metrics` e smoke operacional implementados e validados
