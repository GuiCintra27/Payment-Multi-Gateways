# Análise de Requisitos — Teste Prático Back-end BeTalent

## 📋 Visão Geral

Sistema gerenciador de **pagamentos multi-gateway**: uma API RESTful com banco de dados MySQL que se integra a duas APIs de terceiros (gateways de pagamento). A lógica central é: ao realizar uma compra, tenta-se cobrar nos gateways seguindo a **ordem de prioridade**. Se o primeiro falhar, tenta o segundo. Se algum retornar sucesso, não exibe erro.

> [!IMPORTANT]
> O nível escolhido é **Nível 3 (Pleno/Sênior)**, o mais completo.

---

## 🎯 Nível 3 — Requisitos Completos

| Aspecto | Detalhe |
|---|---|
| **Cálculo de valor** | Múltiplos produtos × quantidades, calculado no back-end |
| **Autenticação nos Gateways** | Sim, cada gateway tem sua forma própria de auth |
| **Roles de Usuário** | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| **TDD** | Obrigatório |
| **Docker Compose** | MySQL + Aplicação + Mock dos Gateways |

---

## 🔧 Stack Definida

| Requisito | Escolha |
|---|---|
| **Framework** | **AdonisJS 6** (TypeScript nativo, Node.js) |
| **Banco** | MySQL |
| **ORM** | **Lucid** (integração nativa com AdonisJS) |
| **Validação** | **VineJS** (integrado ao AdonisJS 6) |
| **Autenticação** | **Auth Tokens (opaque)** — padrão do AdonisJS |
| **Testes** | **Jest** (preferência) · fallback: **Japa** (recomendado pelo Adonis) |
| **Padrão Gateway** | **Strategy + Factory Pattern** |
| **Estrutura** | **MVC + Service Layer** |
| **Respostas** | JSON |
| **Docker Compose** | MySQL, App, e Mock dos Gateways |
| **README** | Requisitos, instalação, rotas, informações relevantes |

---

## 🗄 Estrutura de Banco de Dados (mínima)

```
users
├── id
├── email
├── password
├── role (ADMIN | MANAGER | FINANCE | USER)
├── created_at
└── updated_at

gateways
├── id
├── name
├── is_active
├── priority
├── created_at
└── updated_at

clients
├── id
├── name
├── email
├── created_at
└── updated_at

products
├── id
├── name
├── amount (em centavos)
├── created_at
└── updated_at

transactions
├── id
├── client_id (FK → clients)
├── gateway_id (FK → gateways)
├── external_id
├── status
├── amount (em centavos)
├── card_last_numbers
├── created_at
└── updated_at

transaction_products (Nível 3 — múltiplos produtos por transação)
├── id
├── transaction_id (FK → transactions)
├── product_id (FK → products)
├── quantity
├── created_at
└── updated_at
```

> [!NOTE]
> A tabela `transaction_products` permite **múltiplos produtos** por transação. O `amount` total da transação é calculado no back-end como `Σ (product.amount × quantity)`.

---

## 🛣 Rotas do Sistema

### Rotas Públicas (sem autenticação do usuário)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/login` | Realizar login |
| `POST` | `/purchases` | Realizar uma compra informando produto(s) |

### Rotas Privadas (autenticadas, com validação de roles)
| Método | Rota | Descrição | Roles Permitidas |
|---|---|---|---|
| `PATCH` | `/gateways/:id/toggle` | Ativar/desativar gateway | `ADMIN` |
| `PATCH` | `/gateways/:id/priority` | Alterar prioridade do gateway | `ADMIN` |
| CRUD | `/users` | CRUD de usuários | `ADMIN`, `MANAGER` |
| CRUD | `/products` | CRUD de produtos | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET` | `/clients` | Listar todos os clientes | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `GET` | `/clients/:id` | Detalhe do cliente + compras | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `GET` | `/transactions` | Listar todas as compras | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `GET` | `/transactions/:id` | Detalhes de uma compra | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `POST` | `/transactions/:id/refund` | Reembolso junto ao gateway | `ADMIN`, `FINANCE` |

---

## 👤 Sistema de Roles (RBAC)

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso total: CRUD users, CRUD products, gateways, transactions, refund |
| `MANAGER` | CRUD users, CRUD products |
| `FINANCE` | CRUD products, realizar reembolso |
| `USER` | Listar clientes, ver detalhes, listar/ver transações |

> [!NOTE]
> Roles inferidas do enunciado: `ADMIN` faz tudo, `MANAGER` gerencia produtos e usuários, `FINANCE` gerencia produtos e faz reembolso, `USER` faz o restante não citado.

---

## 🔌 Multi-Gateways (Mocks)

### Execução
```bash
# Com autenticação (Nível 3)
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock
```

### Gateway 1 — `http://localhost:3001`

| Aspecto | Detalhe |
|---|---|
| **Auth** | `POST /login` com `email` + `token` → Bearer token |
| **Listar** | `GET /transactions` |
| **Criar** | `POST /transactions` — `amount`, `name`, `email`, `cardNumber`, `cvv` |
| **Reembolso** | `POST /transactions/:id/charge_back` |
| **Erro CVV** | `100` ou `200` → erro de cartão inválido |

### Gateway 2 — `http://localhost:3002`

| Aspecto | Detalhe |
|---|---|
| **Auth** | Headers fixos: `Gateway-Auth-Token` + `Gateway-Auth-Secret` |
| **Listar** | `GET /transacoes` |
| **Criar** | `POST /transacoes` — `valor`, `nome`, `email`, `numeroCartao`, `cvv` |
| **Reembolso** | `POST /transacoes/reembolso` com `{ "id": "..." }` |
| **Erro CVV** | `200` ou `300` → erro de cartão inválido |

> [!IMPORTANT]
> Os gateways têm **schemas diferentes** (inglês vs português) e **auth diferentes** (Bearer vs headers). A aplicação abstrai isso com **Strategy/Adapter Pattern**.

---

## 📝 Critérios de Avaliação

1. Lógica de programação
2. Organização do projeto
3. Legibilidade do código
4. Validação necessária dos dados
5. Forma adequada de utilização dos recursos
6. Seguimento dos padrões especificados
7. Tratamento dos dados sensíveis corretamente
8. Clareza na documentação

---

## 📦 Checklist Macro de Implementação

- [ ] Setup do projeto AdonisJS 6 com Docker Compose
- [ ] Modelagem e migrations do banco de dados (MySQL)
- [ ] Seeds para dados iniciais (gateways, admin user)
- [ ] Sistema de autenticação (login/logout com API tokens)
- [ ] Middleware de autorização (RBAC por roles)
- [ ] CRUD de Usuários (`ADMIN`, `MANAGER`)
- [ ] CRUD de Produtos (`ADMIN`, `MANAGER`, `FINANCE`)
- [ ] Listagem de Clientes e Detalhes
- [ ] Integração multi-gateway (Strategy Pattern)
  - [ ] Gateway 1 adapter (auth via Bearer token)
  - [ ] Gateway 2 adapter (auth via headers fixos)
  - [ ] Factory para seleção por prioridade
  - [ ] Fallback automático em caso de erro
- [ ] Rota de Compra (pública)
  - [ ] Cálculo do valor: múltiplos produtos × quantidades
  - [ ] Criação de client se não existir
  - [ ] Tentativa de cobrança com fallback
  - [ ] Salvamento da transação + transaction_products
- [ ] Listagem e Detalhes de Transações
- [ ] Reembolso de transação (`ADMIN`, `FINANCE`)
- [ ] Gestão de Gateways (ativar/desativar, alterar prioridade)
- [ ] Testes (TDD)
  - [ ] Unit tests (services, validators)
  - [ ] Integration tests (rotas, database)
  - [ ] Gateway mock tests
- [ ] Docker Compose (MySQL + App + Gateway Mocks)
- [ ] README detalhado
