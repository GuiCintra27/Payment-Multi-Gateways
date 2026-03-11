# AGENTS.md - BeTalent Payment Gateway

README para agentes de IA trabalhando neste repositório.

## Visão geral do projeto

API RESTful multi-gateway de pagamentos construída com AdonisJS 6 (TypeScript).
Processamento de pagamentos com failover automático entre gateways, controle RBAC, e TDD.

- **Framework:** AdonisJS 6 (kit API)
- **Banco:** MySQL 8
- **ORM:** Lucid
- **Validação:** VineJS
- **Auth:** Access Tokens (opaque, stateless)
- **Testes:** Japa (runner nativo do AdonisJS)

## Comandos de setup

### Dev local (recomendado)

```bash
./scripts/start-dev.sh
```

Isso sobe: MySQL (Docker), Gateway Mocks (Docker), migrations, seeds, e AdonisJS dev server com hot-reload.

### Docker full stack

```bash
docker compose up --build
```

Sobe tudo via Docker: MySQL + Gateway Mocks + App (migrations + seeds automáticos).

### Apenas infra (MySQL + Mocks)

```bash
docker compose up -d mysql gateway-mock
```

## Endpoints e portas

- API: `http://localhost:3333`
- Gateway Mock 1: `http://localhost:3001`
- Gateway Mock 2: `http://localhost:3002`
- MySQL: `localhost:3306`

## Variáveis de ambiente

Arquivo `.env` (copiar de `.env.example`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` — conexão MySQL
- `GATEWAY1_URL`, `GATEWAY2_URL` — URLs dos mocks de gateway
- `GATEWAY1_EMAIL`, `GATEWAY1_TOKEN` — credenciais Gateway 1 (Bearer token)
- `GATEWAY2_AUTH_TOKEN`, `GATEWAY2_AUTH_SECRET` — credenciais Gateway 2 (headers)
- `APP_KEY` — chave de criptografia do AdonisJS
- `LOG_LEVEL` — nível do Pino logger

## Estilo de código

### TypeScript (AdonisJS)

- Controllers focados em HTTP concerns (parse request, valida, delega, retorna response).
- Lógica de negócio vive em **Services** (`app/services/`).
- Validação centralizada em **Validators** (`app/validators/`) com VineJS.
- Gateway adapters seguem **Strategy Pattern** (`app/services/gateway/`).
- Usar `ctx.logger` para logs estruturados (Pino JSON).
- Request ID propagado via middleware em `X-Request-Id`.

### Convenções de naming

- Controllers: `PascalCase` + `_controller.ts` (ex: `users_controller.ts`)
- Models: `PascalCase` singular (ex: `User`, `Transaction`)
- Migrations: timestamp prefix + snake_case (automático pelo `node ace make:migration`)
- Services: `PascalCase` + `_service.ts` (ex: `purchase_service.ts`)

### Commits

Conventional Commits obrigatório:

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `test:` testes
- `chore:` manutenção
- `refactor:` refatoração sem mudar comportamento

## Notas de arquitetura

### Fluxo de compra

1. `POST /purchases` recebe dados do cliente + produtos + cartão.
2. `PurchaseService` calcula o total (server-side).
3. `GatewayService` tenta cobrar no Gateway de maior prioridade.
4. Se falhar, tenta os próximos gateways ativos (fallback).
5. Salva Transaction + TransactionProducts em transação DB.

### Fluxo de reembolso

1. `POST /transactions/:id/refund` (roles: ADMIN, FINANCE).
2. Identifica o gateway usado na transação original.
3. Chama refund no adapter correto.
4. Atualiza status da transação.

### Strategy Pattern (Gateways)

```
GatewayStrategy (interface)
├── Gateway1Adapter (Bearer token, schema próprio)
├── Gateway2Adapter (header auth, schema diferente)
└── GatewayFactory  (seleciona por prioridade, cria adapter)
```

### RBAC

Roles: `ADMIN`, `MANAGER`, `FINANCE`, `USER`

| Recurso | ADMIN | MANAGER | FINANCE | Público |
|---|---|---|---|---|
| CRUD Usuários | ✅ | ✅ | ❌ | ❌ |
| CRUD Produtos | ✅ | ✅ | ✅ | ❌ |
| Listar Clientes | ✅ | ✅ | ✅ | ❌ |
| Compra | - | - | - | ✅ |
| Reembolso | ✅ | ❌ | ✅ | ❌ |
| Transações | ✅ | ✅ | ✅ | ❌ |
| Gestão Gateways | ✅ | ❌ | ❌ | ❌ |

## Gotchas críticos

- O modelo `User` usa `UserSchema` gerada automaticamente pelo Lucid — não editar `database/schema.ts` manualmente.
- Valores monetários são armazenados em **centavos** (integer) para evitar floating point.
- `price_at_time` no pivot `transaction_products` registra o preço do momento da compra.
- O campo `card_last_numbers` armazena apenas os 4 últimos dígitos — nunca persistir cartão completo ou CVV.
- Gateway mocks rodam via imagem Docker `matheusprotzen/gateways-mock`.
- Auth usa Access Tokens (opaque) — cada request requer header `Authorization: Bearer <token>`.

## Estrutura do projeto

```
betalent-payment-gateway/
├── app/
│   ├── controllers/        # HTTP handlers
│   ├── models/             # Lucid models
│   ├── services/           # Lógica de negócio
│   │   └── gateway/        # Strategy Pattern
│   ├── middleware/          # Auth, RBAC, Request ID
│   ├── validators/         # VineJS schemas
│   ├── exceptions/         # Error handlers
│   └── transformers/       # Response serializers
├── config/                 # Configs (database, auth, logger, etc.)
├── database/
│   ├── migrations/         # Schema migrations
│   └── seeders/            # Data seeds
├── start/
│   ├── routes.ts           # Definição de rotas
│   ├── kernel.ts           # Middleware stack
│   └── env.ts              # Validação de env vars
├── tests/
│   ├── unit/               # Testes unitários
│   └── functional/         # Testes de integração
├── scripts/
│   ├── start-dev.sh        # Dev setup single command
│   └── ci.sh               # CI runner modular
├── docs/                   # Documentação do projeto
├── .github/workflows/      # CI + Release Please
├── docker-compose.yaml     # Stack completa
├── Dockerfile              # Multi-stage build
└── AGENTS.md               # Este arquivo
```

## Tarefas comuns

### Criar migration

```bash
node ace make:migration create_users
```

### Criar controller

```bash
node ace make:controller users
```

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
npm test                    # Todos
node ace test --suite unit  # Só unitários
node ace test --suite functional  # Só integração
```

### Lint

```bash
npm run lint
```

### Health check

```bash
curl http://localhost:3333
```

## Fluxo de branches

1. Trabalhar na branch `main` (ou feature branch se necessário).
2. Commits usando Conventional Commits.
3. Push para `main` dispara CI (lint + test + smoke) e Release Please.
4. Release Please cria PR de release com CHANGELOG automático.

## Disciplina de planos

Para toda implementação vinculada a um documento de planejamento:

1. Marcar items do checklist imediatamente após implementação.
2. Adicionar nota curta de validação descrevendo o que foi testado e o resultado.
3. Manter o status do plano sincronizado antes de commitar mudanças de código.

## Documentação do projeto

A documentação pública fica em `docs/projects/` seguindo o padrão:

- `INDEX.md` — ponto de entrada com links para todos os docs
- Um documento por domínio (ARCHITECTURE, DATA-MODEL, FLOWS, etc.)
- Cada doc responde a uma pergunta específica

### Estrutura de docs

```
docs/
├── requirements.md               # Requisitos do teste (já existe)
├── architecture-patterns.md      # Padrões importados (já existe)
├── documentation-patterns.md     # Padrões de documentação (já existe)
└── projects/                     # Documentação pública do projeto
    ├── INDEX.md                  # Hub central — links p/ todos os docs
    ├── QUICK-START.md            # Como subir e rodar o projeto
    ├── ARCHITECTURE.md           # Diagrama e visão geral da arquitetura
    ├── DATA-MODEL.md             # Tabelas, campos, indexes, relacionamentos
    ├── FLOWS.md                  # Fluxos de negócio (compra, reembolso)
    ├── INTEGRATIONS.md           # Contratos de API dos gateways externos
    ├── INFRA.md                  # Docker Compose, portas, volumes
    ├── SECURITY.md               # Auth, RBAC, dados sensíveis
    └── RUNBOOK.md                # Operação, troubleshooting, comandos
```

### Fluxo de documentação durante implementação

As funcionalidades devem ser documentadas **durante** a implementação, **não depois**.

1. **Antes de implementar:** verificar se o doc relevante já existe.
2. **Durante a implementação:**
   - Ao criar migrations → atualizar `DATA-MODEL.md` com tabelas e campos.
   - Ao criar rotas/controllers → atualizar `INTEGRATIONS.md` com endpoints e payloads.
   - Ao implementar fluxo de negócio → atualizar `FLOWS.md` com passo a passo.
   - Ao alterar Docker/infra → atualizar `INFRA.md` e `QUICK-START.md`.
   - Ao adicionar auth/RBAC → atualizar `SECURITY.md`.
3. **Após implementar:** revisar docs e garantir que `INDEX.md` tem links atualizados.

### Regra de ouro

> Se o código mudou e a documentação não acompanhou, o trabalho não está completo.
