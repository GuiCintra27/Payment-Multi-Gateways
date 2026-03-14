# Modelo de dados

Resumo do modelo de dados persistido em MySQL.

## Tabelas principais

```text
users
auth_access_tokens
gateways
clients
products
transactions
transaction_products
```

## `users`

| Campo        | Tipo      | Regras                                |
| ------------ | --------- | ------------------------------------- |
| `id`         | integer   | PK                                    |
| `full_name`  | string    | nullable                              |
| `email`      | string    | unique, obrigatório                   |
| `password`   | string    | obrigatório                           |
| `role`       | enum      | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `created_at` | timestamp | obrigatório                           |
| `updated_at` | timestamp | nullable                              |

## `auth_access_tokens`

Tabela de tokens opaque do AdonisJS.

| Campo          | Tipo               |
| -------------- | ------------------ |
| `id`           | integer            |
| `tokenable_id` | FK -> `users.id`   |
| `type`         | string             |
| `name`         | string nullable    |
| `hash`         | string             |
| `abilities`    | text               |
| `created_at`   | timestamp          |
| `updated_at`   | timestamp          |
| `last_used_at` | timestamp nullable |
| `expires_at`   | timestamp nullable |

## `gateways`

| Campo         | Tipo      | Regras                          |
| ------------- | --------- | ------------------------------- |
| `id`          | integer   | PK                              |
| `name`        | string    | unique                          |
| `is_active`   | boolean   | default `true`                  |
| `priority`    | integer   | menor numero = maior prioridade |
| `credentials` | text      | JSON serializado                |
| `created_at`  | timestamp | obrigatório                     |
| `updated_at`  | timestamp | nullable                        |

## `clients`

| Campo        | Tipo      | Regras      |
| ------------ | --------- | ----------- |
| `id`         | integer   | PK          |
| `name`       | string    | obrigatório |
| `email`      | string    | unique      |
| `created_at` | timestamp | obrigatório |
| `updated_at` | timestamp | nullable    |

## `products`

| Campo        | Tipo      | Regras             |
| ------------ | --------- | ------------------ |
| `id`         | integer   | PK                 |
| `name`       | string    | obrigatório        |
| `amount`     | integer   | centavos, unsigned |
| `created_at` | timestamp | obrigatório        |
| `updated_at` | timestamp | nullable           |

## `transactions`

| Campo               | Tipo      | Regras                                                 |
| ------------------- | --------- | ------------------------------------------------------ |
| `id`                | integer   | PK                                                     |
| `client_id`         | integer   | FK -> `clients.id`                                     |
| `gateway_id`        | integer   | FK -> `gateways.id`                                    |
| `external_id`       | string    | nullable                                               |
| `status`            | enum      | `pending`, `approved`, `rejected`, `refunded`, `error` |
| `amount`            | integer   | centavos, unsigned                                     |
| `card_last_numbers` | string(4) | somente os últimos 4 dígitos                           |
| `created_at`        | timestamp | obrigatório                                            |
| `updated_at`        | timestamp | nullable                                               |

Índices:

- `idx_transactions_client_id`
- `idx_transactions_gateway_id`
- `idx_transactions_status`

## `transaction_products`

Pivot entre transação e produtos comprados.

| Campo            | Tipo      | Regras                  |
| ---------------- | --------- | ----------------------- |
| `id`             | integer   | PK                      |
| `transaction_id` | integer   | FK -> `transactions.id` |
| `product_id`     | integer   | FK -> `products.id`     |
| `quantity`       | integer   | unsigned                |
| `price_at_time`  | integer   | centavos, unsigned      |
| `created_at`     | timestamp | obrigatório             |
| `updated_at`     | timestamp | nullable                |

Índices:

- `idx_tp_transaction_id`
- `idx_tp_product_id`

## Relacionamentos de negócio

```text
Client 1 --- N Transaction
Gateway 1 --- N Transaction
Transaction N --- N Product (via transaction_products)
User 1 --- N AuthAccessToken
```

## Regras importantes

- `amount` e `price_at_time` são sempre armazenados em centavos
- `price_at_time` preserva o preço histórico da compra
- nunca persistir número completo do cartão ou CVV
