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

| Fase | Situação atual | Resultado resumido |
|---|---|---|
| F1 | Concluída | setup, Docker, CI e release automation entregues |
| F2 | Concluída | modelagem principal, seeders, auth e RBAC entregues |
| F3 | Parcialmente concluída | core funcional existe e foi refinado com alinhamento de `transactions` e reorder de gateways |
| F4 | Parcialmente iniciada | suíte de testes cresceu; o principal gap agora é fallback real com gateway mocks |
| F5 | Pendente | documentação pública `docs/projects/` ainda não criada |
| F6 | Pendente | bônus de senioridade ainda não implementados |

## Estado por área

| Área | Status | Evidência |
|---|---|---|
| Infra local e Docker | Concluído | `docker-compose.yaml`, `Dockerfile`, `scripts/start-dev.sh` |
| CI e release automation | Concluído | `.github/workflows/ci.yml`, `.github/workflows/release-please.yml` |
| Banco de dados e modelagem principal | Concluído | migrations de `users`, `gateways`, `clients`, `products`, `transactions`, `transaction_products` |
| Seeders iniciais | Concluído | `database/seeders/01_admin_seeder.ts`, `02_gateway_seeder.ts` |
| Auth por access token | Concluído | `app/controllers/auth_controller.ts`, `config/auth.ts` |
| RBAC | Concluído | `app/middleware/role_middleware.ts`, rotas protegidas em `start/routes.ts` |
| CRUD de usuários | Concluído | `app/controllers/users_controller.ts` |
| CRUD de produtos | Concluído | `app/controllers/products_controller.ts` |
| Clientes e detalhe de compras | Parcialmente concluído | `app/controllers/clients_controller.ts` existe, mas sem testes dedicados |
| Gestão de gateways | Parcialmente concluído | listagem, toggle e reorder de prioridade existem; cobertura ainda parcial |
| Compra pública | Parcialmente concluído | `app/services/purchase_service.ts` e `POST /purchases` existem; faltam testes E2E do fluxo |
| Multi-gateway com fallback | Parcialmente concluído | adapters e factory existem; faltam testes integrados com mocks |
| Reembolso | Parcialmente concluído | `app/services/refund_service.ts` e rota existem; faltam testes dedicados |
| Transações | Parcialmente concluído | listagem e detalhe existem; autorização foi alinhada para incluir `USER`, mas a cobertura ainda está evoluindo |
| Documentação pública do projeto | Pendente | `docs/projects/` ainda não existe |
| Bônus de senioridade | Pendente | request ID, métricas e observabilidade ainda não foram trazidos |

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
- Unitários: validators de usuário, validator de purchase, `GatewayFactory` e fallback do `GatewayService`.

## Resultado do último incremento

Concluído neste ciclo:

- acesso de `USER` às rotas de transações alinhado com o requisito
- prioridade de gateways passou a ser reordenada de forma sequencial e consistente
- resposta de compra sem gateways ativos foi tratada de forma explícita
- testes funcionais iniciais para `gateways` e `transactions`
- testes funcionais iniciais para `purchases` e `refunds`
- teste unitário inicial provando fallback do `GatewayService`

Continua pendente após este ciclo:

- prova integrada do fallback com gateway mocks
- documentação pública em `docs/projects/`

## Lacunas relevantes

### Cobertura de testes

Ainda faltam testes para os fluxos que mais importam para o teste técnico:

- fallback real entre gateways
- cenários mais completos de `POST /purchases`
- cenários mais completos de `POST /transactions/:id/refund`
- listagem/detalhe de transações em cenários mais amplos
- cenários mais completos de gestão de gateways
- integração com os gateway mocks

### Inconsistências entre requisito e código

- O handoff antigo dizia que a implementação estava parando antes das migrations, mas isso não corresponde mais ao estado real do repositório.
- `docs/documentation-patterns.md` e partes do `AGENTS.md` ainda descreviam itens como futuros, embora parte deles já exista.
- O documento de requisitos ainda mencionava Jest como preferência, mas o projeto está estruturado com Japa.

### Bônus de senioridade ainda ausentes

- `X-Request-Id` e correlação de logs
- endpoint `/metrics`
- compose opcional de observabilidade
- documentação pública em `docs/projects/`
- README profissional na raiz
- smoke test de compra/refund com mocks reais

## Restrições desta análise

Esta revisão foi feita por inspeção estática do repositório.

Não foi possível executar `npm`, `npm test`, `npm run lint` ou `npm run typecheck` no ambiente desta sessão porque `npm` não está disponível no shell atual.

## Próximos passos recomendados

1. Cobrir com testes os fluxos de compra, fallback, refund e gateways.
2. Provar o fallback com integração real contra os gateway mocks.
3. Criar a documentação pública mínima em `docs/projects/`.
4. Implementar os bônus de maior retorno para recrutadores:
   - `X-Request-Id`
   - métricas básicas
   - smoke operacional documentado
