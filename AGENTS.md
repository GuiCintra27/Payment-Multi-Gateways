# AGENTS.md - BeTalent Payment Gateway

Guia operacional para agentes de IA trabalhando neste repositório.

## Visão geral do projeto

API RESTful multi-gateway de pagamentos construída com AdonisJS 6 e TypeScript para atender ao teste técnico BeTalent.

O projeto implementa:

- compra pública com múltiplos produtos
- cálculo do total no servidor
- fallback automático entre gateways por prioridade
- autenticação com access tokens
- RBAC por roles
- persistência de transações e produtos comprados

## Estado atual do repositório

### Já implementado

- Docker Compose com app, MySQL e gateway mocks
- `scripts/start-dev.sh`
- CI com lint, typecheck, test e smoke
- release automation com Release Please
- migrations e seeders principais
- auth (`/login`, `/logout`)
- RBAC
- CRUD de usuários
- CRUD de produtos
- listagem de clientes
- listagem e detalhe de transações
- compra pública
- integração com dois gateways
- fallback por prioridade
- refund pelo gateway original

### Implementado, mas ainda incompleto

- testes dos fluxos críticos de compra, fallback e refund
- testes dos endpoints de transações e gateways
- alinhamento final de permissões de `transactions`
- documentação pública em `docs/projects/`

### Ainda não implementado

- `X-Request-Id` e correlação de logs
- métricas em `/metrics`
- stack opcional de observabilidade
- `README.md` profissional na raiz

## Stack

- Framework: AdonisJS 6
- Linguagem: TypeScript
- Banco: MySQL 8
- ORM: Lucid
- Validação: VineJS
- Auth: Access Tokens opaque
- Testes: Japa

## Comandos de setup

### Dev local recomendado

```bash
./scripts/start-dev.sh
```

Isso sobe:

- MySQL via Docker
- gateway mocks via Docker
- migrations
- seeders
- servidor AdonisJS com hot reload

### Docker full stack

```bash
docker compose up --build
```

### Infra apenas

```bash
docker compose up -d mysql gateway-mock
```

## Endpoints e portas

- API: `http://localhost:3333`
- Gateway Mock 1: `http://localhost:3001`
- Gateway Mock 2: `http://localhost:3002`
- MySQL: `localhost:3306`

## Variáveis de ambiente

Arquivo base: `.env.example`

Variáveis principais:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `GATEWAY1_URL`, `GATEWAY2_URL`
- `GATEWAY1_EMAIL`, `GATEWAY1_TOKEN`
- `GATEWAY2_AUTH_TOKEN`, `GATEWAY2_AUTH_SECRET`
- `APP_KEY`
- `LOG_LEVEL`

## Notas de arquitetura

### Fluxo de compra

1. `POST /purchases` recebe cliente, produtos e cartão.
2. `PurchaseService` busca os produtos e calcula o total.
3. `GatewayService` consulta gateways ativos por prioridade.
4. O adapter do gateway tenta a cobrança.
5. Em erro, o próximo gateway ativo é tentado.
6. Ao final, a aplicação salva `transactions` e `transaction_products`.

### Fluxo de reembolso

1. `POST /transactions/:id/refund` recebe o ID da transação.
2. `RefundService` carrega a transação com o gateway original.
3. O refund é executado no adapter correspondente.
4. O status local é atualizado para `refunded`.

### Strategy Pattern

```
GatewayStrategy
├── Gateway1Adapter
├── Gateway2Adapter
└── GatewayFactory
```

## Regras de negócio e gotchas

- valores monetários são persistidos em centavos
- `price_at_time` no pivot `transaction_products` registra o preço do momento da compra
- nunca persistir número completo do cartão ou CVV
- `card_last_numbers` deve conter somente os últimos 4 dígitos
- os gateways possuem contratos e autenticação diferentes
- o modelo `User` depende de `UserSchema` gerada pelo Lucid; não editar `database/schema.ts` manualmente

## Situações que exigem atenção

- a permissão de `transactions` precisa ser confirmada, porque a doc inicial e o código atual divergem
- o projeto já tem implementação parcial do core; não tratar migrations/models/seeders como trabalho futuro
- `docs/projects/` ainda não existe, então qualquer mudança relevante precisa também considerar a futura documentação pública
- request ID é citado em documentos antigos, mas ainda não está implementado

## Convenções de código

### TypeScript / AdonisJS

- controllers devem lidar com HTTP concerns
- regra de negócio deve ficar em `app/services/`
- validação deve ficar em `app/validators/`
- adapters de gateway devem ficar em `app/services/gateway/`
- usar logs estruturados; quando `ctx.logger` estiver disponível, preferi-lo ao logger global

### Naming

- controllers: `*_controller.ts`
- services: `*_service.ts`
- models: singular em PascalCase
- migrations: timestamp + snake_case

### Commits

Usar Conventional Commits:

- `feat:`
- `fix:`
- `docs:`
- `test:`
- `chore:`
- `refactor:`

## Estrutura do projeto

```
betalent-payment-gateway/
├── app/
│   ├── controllers/
│   ├── exceptions/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   │   └── gateway/
│   ├── transformers/
│   └── validators/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   ├── schema.ts
│   └── schema_rules.ts
├── docs/
│   ├── local/
│   └── *.md
├── scripts/
├── start/
├── tests/
│   ├── functional/
│   └── unit/
└── .github/workflows/
```

## Tarefas comuns

### Rodar migrations

```bash
node ace migration:run
```

### Rodar seeds

```bash
node ace db:seed
```

### Rodar testes

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Typecheck

```bash
npm run typecheck
```

### Health check

```bash
curl http://localhost:3333
```

## Disciplina de documentação

Se o código mudou e a documentação não mudou, o trabalho ainda não está completo.

Hoje a documentação está dividida em:

- `docs/local/` para status e roadmap
- `docs/projects/` para documentação pública futura

Antes de encerrar uma tarefa:

1. atualizar o status em `docs/local/` se o plano mudou
2. atualizar `AGENTS.md` se o comportamento operacional mudou
3. criar ou atualizar docs públicos quando `docs/projects/` começar a existir

## Prioridades atuais

1. alinhar código, docs e requisito
2. cobrir compra, fallback e refund com testes
3. criar documentação pública mínima
4. adicionar bônus de alto retorno:
   - `X-Request-Id`
   - `/metrics`
   - smoke funcional com gateways mockados
