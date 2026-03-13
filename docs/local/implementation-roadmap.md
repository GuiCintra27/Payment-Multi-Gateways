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

| Fase | Objetivo                                                 | Status    |
| ---- | -------------------------------------------------------- | --------- |
| F1   | Setup, Docker, CI e automação de release                 | Concluída |
| F2   | Modelagem, migrations, models, seeders, auth e RBAC      | Concluída |
| F3   | Core funcional de compras, gateways, transações e refund | Concluída |
| F4   | Testes dos fluxos críticos                               | Concluída |
| F5   | Documentação pública do projeto                          | Concluída |
| F6   | Bônus de senioridade de alto retorno                     | Concluída |

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
- base posteriormente ampliada e consolidada na suíte atual com `61/61` testes passando

### F4 - Testes dos fluxos críticos

Status: concluída

Concluído:

- testes funcionais de auth
- testes funcionais de RBAC
- testes funcionais de users
- testes funcionais de products
- testes funcionais de clients
- testes funcionais de transactions
- testes funcionais de gateways
- testes funcionais de purchases
- testes funcionais de refunds
- testes funcionais de request id
- testes funcionais de metrics
- testes unitários de validators, `GatewayFactory` e `GatewayService`
- testes reais dos gateways adicionados de forma condicionada por `RUN_REAL_GATEWAY_TESTS`
- espera ativa dos gateway mocks adicionada aos testes reais para reduzir flakiness fora da CI
- execução validada dos testes reais com gateway mocks
- suíte verde com `61/61` testes passando em ambiente dockerizado com `node:24`

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

Status: concluída

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
- `docker-compose.monitoring.yaml` com Prometheus e Grafana
- `docs/projects/OBSERVABILITY.md` com setup, limites e consultas úteis
- dashboards Grafana provisionados para visão executiva e confiabilidade por gateway
- métricas financeiras e de fallback adicionadas para leitura mais útil do domínio de pagamentos
- workflows de CI e Release Please alinhados para a branch `master`

Validação registrada:

- `npm run lint`
- `npm run typecheck`
- `node ace test`
- suíte verde com `61/61` testes passando
- smoke operacional executado com sucesso em ambiente isolado com app, MySQL e gateway mocks
- `docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml config`
- Grafana validado via API com datasource `prometheus` e dashboards provisionados

## Backlog por prioridade

### Prioridade 1: reforçar senioridade com baixo custo

- manter o smoke operacional alinhado a qualquer mudança de fluxo principal
- adicionar alertas básicos, se houver tempo

### Prioridade 2: documentação operacional e evidências

- manter `docs/projects/` sincronizado com qualquer mudança relevante
- manter `docs/projects/OBSERVABILITY.md` sincronizado se a stack opcional evoluir

### Prioridade 3: bônus que mostram senioridade sem extrapolar o escopo

Itens recomendados:

- alertas simples de demonstração, apenas se a implementação continuar leve

Itens opcionais, somente se houver tempo:

- provisionamento de alertas
- logs centralizados leves

## Extensão opcional aprovada

Escopo adicional desta etapa:

1. ampliar a cobertura funcional dos fluxos ainda marcados como parciais
2. implementar a opção de observabilidade ampliada com compose dedicado e documentação pública

Critério de saída deste incremento:

- novos cenários de teste cobrindo lacunas reais de compra, refund, gateways ou transactions
- `docker-compose.monitoring.yaml` funcional
- `docs/projects/OBSERVABILITY.md` criado e linkado a partir do hub documental

Resultado:

- concluído e validado

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
| Grafana com dashboards provisionados      | Médio                 | Baixo      | Entregue      |
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
- cobertura funcional de `purchases` e `refunds` foi ampliada
- cobertura funcional de `clients`, `gateways` e `transactions` foi ampliada
- prova unitária do fallback do `GatewayService` foi adicionada
- adapters e CI foram alinhados para o contrato real dos gateway mocks
- espera ativa dos gateway mocks foi incorporada aos testes reais de integração
- validação dockerizada com Node 24 passou com `61/61` testes
- Fase 5 concluída com `README.md` e documentação pública em `docs/projects/`
- `X-Request-Id`, `/metrics`, smoke operacional e observabilidade opcional implementados e validados
- dashboards provisionados e métricas refinadas para leituras de approval, GMV, refunds e fallback
