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

| Fase | Situação atual         | Resultado resumido                                                                          |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------- |
| F1   | Concluída              | setup, Docker, CI e release automation entregues                                            |
| F2   | Concluída              | modelagem principal, seeders, auth e RBAC entregues                                         |
| F3   | Concluída              | core funcional foi refinado e validado com compra, fallback real, transações e refund       |
| F4   | Parcialmente concluída | suíte cobre os fluxos críticos principais; faltam cenários adicionais e endurecimento       |
| F5   | Concluída              | `README.md` e a camada pública em `docs/projects/` foram criados e alinhados ao código      |
| F6   | Concluída              | `X-Request-Id`, `/metrics` e smoke operacional automatizado foram implementados e validados |

## Estado por área

| Área                                 | Status                 | Evidência                                                                                                                |
| ------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Infra local e Docker                 | Concluído              | `docker-compose.yaml`, `Dockerfile`, `scripts/start-dev.sh`                                                              |
| CI e release automation              | Concluído              | `.github/workflows/ci.yml`, `.github/workflows/release-please.yml`                                                       |
| Banco de dados e modelagem principal | Concluído              | migrations de `users`, `gateways`, `clients`, `products`, `transactions`, `transaction_products`                         |
| Seeders iniciais                     | Concluído              | `database/seeders/01_admin_seeder.ts`, `02_gateway_seeder.ts`                                                            |
| Auth por access token                | Concluído              | `app/controllers/auth_controller.ts`, `config/auth.ts`                                                                   |
| RBAC                                 | Concluído              | `app/middleware/role_middleware.ts`, rotas protegidas em `start/routes.ts`                                               |
| CRUD de usuários                     | Concluído              | `app/controllers/users_controller.ts`                                                                                    |
| CRUD de produtos                     | Concluído              | `app/controllers/products_controller.ts`                                                                                 |
| Clientes e detalhe de compras        | Parcialmente concluído | `app/controllers/clients_controller.ts` existe, mas sem testes dedicados                                                 |
| Gestão de gateways                   | Parcialmente concluído | listagem, toggle e reorder de prioridade existem; cobertura principal passou, mas ainda cabe ampliar cenários            |
| Compra pública                       | Concluído              | `app/services/purchase_service.ts` e `POST /purchases` implementados e cobertos no fluxo principal                       |
| Multi-gateway com fallback           | Concluído              | adapters e factory implementados, alinhados ao contrato real do mock e validados com fallback real                       |
| Reembolso                            | Concluído              | `app/services/refund_service.ts` e rota implementados e cobertos nos cenários principais                                 |
| Transações                           | Concluído              | listagem e detalhe implementados, com autorização alinhada para incluir `USER` e cobertura funcional principal           |
| Documentação pública do projeto      | Concluído              | `README.md` e `docs/projects/` com hub, quick start, arquitetura, dados, fluxos, integrações, infra, segurança e runbook |
| Bônus de senioridade                 | Concluído              | `X-Request-Id`, `/metrics` e smoke operacional entregues; observabilidade ampliada permanece opcional                    |

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

- Funcionais: auth, RBAC, users, products, gateways, transactions, purchases e refunds.
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
- suíte verde com `52/52` testes passando

Continua pendente após este ciclo:

- cenários adicionais para fortalecer `purchases`, `refunds`, `gateways` e `transactions`
- observabilidade opcional ampliada, se houver tempo

## Lacunas relevantes

### Cobertura de testes

Ainda faltam testes para os fluxos que mais importam para o teste técnico:

- cenários mais completos de `POST /purchases`
- cenários mais completos de `POST /transactions/:id/refund`
- listagem/detalhe de transações em cenários mais amplos
- cenários mais completos de gestão de gateways

### Inconsistências entre requisito e código

- O handoff antigo dizia que a implementação estava parando antes das migrations, mas isso não corresponde mais ao estado real do repositório.
- `docs/documentation-patterns.md` e partes do `AGENTS.md` ainda descreviam itens como futuros, embora parte deles já exista.
- O documento de requisitos ainda mencionava Jest como preferência, mas o projeto está estruturado com Japa.

### Bônus de senioridade ainda ausentes

- compose opcional de observabilidade

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
- suíte verde com `52/52` testes passando
- smoke operacional executado com sucesso contra ambiente isolado da aplicação

## Próximos passos recomendados

1. Ampliar cenários de teste para `purchases`, `refunds`, `gateways` e `transactions`.
2. Opcionalmente adicionar observabilidade ampliada se sobrar tempo.
