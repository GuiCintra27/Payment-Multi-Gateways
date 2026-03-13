# Status Atual do Projeto

Snapshot consolidado do estado real do repositório em 2026-03-13, após revisão de código, rotas, migrations, seeders, serviços, testes e documentação.

## Resumo executivo

O projeto já passou da fase de setup. A base de infraestrutura está pronta, o core principal da aplicação foi iniciado e existe código funcional para autenticação, RBAC, CRUDs, compra, fallback entre gateways e reembolso.

O ponto central agora não é mais "começar a implementação", e sim fechar o que já foi iniciado:

- alinhar documentação com o estado real do código
- aumentar a cobertura de testes nos fluxos críticos
- corrigir inconsistências entre enunciado, docs e implementação atual
- decidir quais bônus de senioridade valem o custo para o teste

## Status por fase

| Fase | Situação atual | Resultado resumido                                                                       |
| ---- | -------------- | ---------------------------------------------------------------------------------------- |
| F1   | Concluída      | setup, Docker, CI e release automation entregues                                         |
| F2   | Concluída      | modelagem principal, seeders, auth e RBAC entregues                                      |
| F3   | Concluída      | core funcional foi refinado e validado com compra, fallback real, transações e refund    |
| F4   | Concluída      | suíte cobre os fluxos críticos principais e os cenários adicionais mais relevantes       |
| F5   | Concluída      | `README.md` e a camada pública em `docs/projects/` foram criados e alinhados ao código   |
| F6   | Concluída      | `X-Request-Id`, `/metrics`, smoke operacional e observabilidade opcional foram entregues |

## Estado por área

| Área                                 | Status    | Evidência                                                                                                                |
| ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| Infra local e Docker                 | Concluído | `docker-compose.yaml`, `Dockerfile`, `scripts/start-dev.sh`                                                              |
| CI e release automation              | Concluído | `.github/workflows/ci.yml`, `.github/workflows/release-please.yml`                                                       |
| Banco de dados e modelagem principal | Concluído | migrations de `users`, `gateways`, `clients`, `products`, `transactions`, `transaction_products`                         |
| Seeders iniciais                     | Concluído | `database/seeders/01_admin_seeder.ts`, `02_gateway_seeder.ts`                                                            |
| Auth por access token                | Concluído | `app/controllers/auth_controller.ts`, `config/auth.ts`                                                                   |
| RBAC                                 | Concluído | `app/middleware/role_middleware.ts`, rotas protegidas em `start/routes.ts`                                               |
| CRUD de usuários                     | Concluído | `app/controllers/users_controller.ts`                                                                                    |
| CRUD de produtos                     | Concluído | `app/controllers/products_controller.ts`                                                                                 |
| Clientes e detalhe de compras        | Concluído | `app/controllers/clients_controller.ts` implementado e coberto com cenários dedicados de detalhe e ordenação             |
| Gestão de gateways                   | Concluído | listagem, toggle e reorder de prioridade implementados e cobertos com cenários de erro e reorder extremo                 |
| Compra pública                       | Concluído | `app/services/purchase_service.ts` e `POST /purchases` implementados e cobertos no fluxo principal                       |
| Multi-gateway com fallback           | Concluído | adapters e factory implementados, alinhados ao contrato real do mock e validados com fallback real                       |
| Reembolso                            | Concluído | `app/services/refund_service.ts` e rota implementados e cobertos nos cenários principais                                 |
| Transações                           | Concluído | listagem e detalhe implementados, com autorização alinhada para incluir `USER` e cobertura funcional principal           |
| Documentação pública do projeto      | Concluído | `README.md` e `docs/projects/` com hub, quick start, arquitetura, dados, fluxos, integrações, infra, segurança e runbook |
| Bônus de senioridade                 | Concluído | `X-Request-Id`, `/metrics`, smoke operacional e stack opcional de observabilidade entregues                              |

## O que já está implementado

### Infra e setup

- Stack Docker com MySQL, mocks dos gateways e app.
- Script local de desenvolvimento com subida de infra, migrations, seeds e servidor HMR.
- CI com lint, typecheck, migrations e testes.
- Release Please configurado.

### Domínio principal

- Migrations e models para usuários, gateways, clientes, produtos, transações e pivot de produtos por transação.
- Seed de admin padrão e dos dois gateways.
- Login e logout com opaque access tokens.
- Middleware de autorização por role.
- CRUDs principais de usuários e produtos.
- Listagem de clientes e transações.
- Compra pública com:
  - cálculo do total no servidor
  - criação automática do cliente por email
  - fallback entre gateways ativos por prioridade
  - persistência da transação e pivot `transaction_products`
- Reembolso baseado no gateway da transação original.

### Testes já presentes

- Funcionais: auth, RBAC, users, products, clients, gateways, transactions, purchases, refunds, request id e metrics.
- Unitários: validators de usuário, validator de purchase, `GatewayFactory`, fallback isolado do `GatewayService` e integração real dos gateways condicionada por ambiente.

## Resultado do último incremento

Concluído neste ciclo:

- acesso de `USER` às rotas de transações alinhado com o requisito
- prioridade de gateways passou a ser reordenada de forma sequencial e consistente
- resposta de compra sem gateways ativos foi tratada de forma explícita
- testes funcionais iniciais para `gateways` e `transactions`
- testes funcionais iniciais para `purchases` e `refunds`
- teste unitário inicial provando fallback do `GatewayService`
- adapters alinhados ao contrato real do mock
- teste de integração real dos gateways adicionado e CI configurado para subir os mocks
- validação completa em ambiente dockerizado com Node 24, MySQL e gateway mocks reais
- `lint`, `typecheck` e `test` executados com sucesso nesse ambiente
- `README.md` criado na raiz
- camada pública criada em `docs/projects/`
- documentação pública alinhada ao comportamento real da aplicação
- middleware global de `X-Request-Id` implementado
- propagação de `X-Request-Id` para cobrança e refund nos gateways
- testes funcionais de `X-Request-Id` adicionados
- endpoint público `/metrics` implementado em formato Prometheus
- métricas de compra, refund, tentativas e falhas por gateway instrumentadas
- testes funcionais de métricas adicionados
- `scripts/smoke-e2e.sh` implementado para login, produto, compra, transação, refund e métricas
- job `smoke` da CI passou a executar o smoke operacional
- cenários adicionais para `purchases`, `refunds`, `gateways`, `transactions` e `clients`
- `docker-compose.monitoring.yaml` com Prometheus e Grafana
- `docs/projects/OBSERVABILITY.md` criada e integrada ao hub público
- dashboards Grafana provisionados para visão executiva e confiabilidade por gateway
- métricas financeiras e de fallback refinadas para leitura operacional mais realista
- espera ativa dos gateway mocks nos testes reais de integração para reduzir flakiness fora da CI
- validação completa do compose de observabilidade
- validação real do Grafana via API confirmando datasource `prometheus` e dashboards provisionados
- suíte verde com `61/61` testes passando

Permanece fora do escopo deste ciclo:

- alertas operacionais
- stack de logs centralizados e tracing distribuído

## Lacunas relevantes

### Cobertura de testes

Os fluxos críticos do teste técnico estão cobertos.

Expansões futuras possíveis, mas não necessárias para a entrega atual:

- cenários adicionais de carga e volume
- smoke dedicado da stack opcional de observabilidade
- dashboards prontos para demonstração no Grafana

### Inconsistências entre requisito e código

- O handoff antigo dizia que a implementação estava parando antes das migrations, mas isso não corresponde mais ao estado real do repositório.
- `docs/documentation-patterns.md` e partes do `AGENTS.md` ainda descreviam itens como futuros, embora parte deles já exista.
- O documento de requisitos ainda mencionava Jest como preferência, mas o projeto está estruturado com Japa.

### Bônus de senioridade ainda ausentes

- alertas operacionais
- stack de logs/tracing além de métricas

## Validação executada nesta sessão

Foi executado um ambiente dockerizado de validação com:

- `node:24`
- MySQL 8
- gateway mocks reais `matheusprotzen/gateways-mock`

Resultados registrados:

- `node ace migration:fresh --force` executado com sucesso
- `npm run typecheck` executado com sucesso
- `npm run lint` executado com sucesso
- `node ace test` executado com sucesso
- suíte verde com `61/61` testes passando
- smoke operacional executado com sucesso contra ambiente isolado da aplicação
- `docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml config` executado com sucesso
- Grafana validado com datasource `prometheus` e dashboards `payment-overview` e `gateway-reliability`

## Próximos passos recomendados

1. Se houver tempo, adicionar alertas básicos para sinais como `all_failed_total` e `no_active_total`.
2. Se houver interesse em extrapolar o teste, avaliar logs centralizados ou tracing como camada separada.

## Extensão ativa

Incremento opcional aprovado para esta etapa:

- ampliar a cobertura funcional dos fluxos mais sensíveis ainda parcialmente cobertos
- adicionar uma stack opcional de observabilidade com documentação pública própria

Objetivo deste incremento:

- reduzir lacunas remanescentes da F4
- transformar a observabilidade ampliada de opcional futura em artefato concreto de apresentação

Status do incremento:

- concluído e validado
