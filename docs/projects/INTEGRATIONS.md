# Integrações

Contratos principais da API e dos gateways externos.

## API da aplicação

Header transversal:

- `X-Request-Id`: opcional na entrada, sempre retornado na resposta

### Públicos

| Método | Rota         | Descrição           |
| ------ | ------------ | ------------------- |
| `GET`  | `/`          | health check        |
| `GET`  | `/metrics`   | métricas Prometheus |
| `POST` | `/login`     | autentica usuário   |
| `POST` | `/purchases` | cria compra pública |

### Autenticados

| Método   | Rota                       | Roles                         |
| -------- | -------------------------- | ----------------------------- |
| `POST`   | `/logout`                  | qualquer autenticado          |
| `GET`    | `/users`                   | `ADMIN`, `MANAGER`            |
| `POST`   | `/users`                   | `ADMIN`, `MANAGER`            |
| `GET`    | `/users/:id`               | `ADMIN`, `MANAGER`            |
| `PUT`    | `/users/:id`               | `ADMIN`, `MANAGER`            |
| `DELETE` | `/users/:id`               | `ADMIN`, `MANAGER`            |
| `GET`    | `/products`                | `ADMIN`, `MANAGER`, `FINANCE` |
| `POST`   | `/products`                | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET`    | `/products/:id`            | `ADMIN`, `MANAGER`, `FINANCE` |
| `PUT`    | `/products/:id`            | `ADMIN`, `MANAGER`, `FINANCE` |
| `DELETE` | `/products/:id`            | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET`    | `/clients`                 | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET`    | `/clients/:id`             | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET`    | `/gateways`                | `ADMIN`                       |
| `PATCH`  | `/gateways/:id/toggle`     | `ADMIN`                       |
| `PATCH`  | `/gateways/:id/priority`   | `ADMIN`                       |
| `GET`    | `/transactions`            | `ADMIN`, `MANAGER`, `FINANCE` |
| `GET`    | `/transactions/:id`        | `ADMIN`, `MANAGER`, `FINANCE` |
| `POST`   | `/transactions/:id/refund` | `ADMIN`, `FINANCE`            |

## Login

### Request

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "user": {
    "id": 1,
    "fullName": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "opaque-access-token"
}
```

## Produto

### Criação

```json
{
  "name": "Product One",
  "amount": 1500
}
```

## Gateway 1

Base URL via `GATEWAY1_URL`.

### Autenticação

`POST /login`

```json
{
  "email": "dev@example.com",
  "token": "FEC9BB078BF338F464F96B48089EB498"
}
```

Retorna bearer token usado nas demais chamadas.

### Cobrança

`POST /transactions`

```json
{
  "amount": 5000,
  "name": "Buyer",
  "email": "buyer@example.com",
  "cardNumber": "4111111111111111",
  "cvv": "123"
}
```

Comportamento relevante observado no mock:

- sucesso: `201` com corpo contendo `id`
- erro de negócio: `400`
- a aplicação propaga `X-Request-Id` quando disponível

### Refund

`POST /transactions/:id/charge_back`

## Gateway 2

Base URL via `GATEWAY2_URL`.

Autenticação por header fixo:

- `Gateway-Auth-Token`
- `Gateway-Auth-Secret`

### Cobrança

`POST /transacoes`

```json
{
  "valor": 5000,
  "nome": "Buyer",
  "email": "buyer@example.com",
  "numeroCartao": "4111111111111111",
  "cvv": "123"
}
```

Comportamento relevante observado no mock:

- sucesso: `201` com corpo contendo `id`
- erro de negócio pode vir embutido no body mesmo com resposta HTTP bem-sucedida
- a aplicação propaga `X-Request-Id` quando disponível

### Refund

`POST /transacoes/reembolso`

```json
{
  "id": "external-transaction-id"
}
```

## Observações de integração

- os dois gateways possuem schemas e autenticações diferentes
- a aplicação normaliza o resultado para `approved` ou `rejected`
- a lista de transações dos mocks vem encapsulada em `data`
- `GET /metrics` expõe contadores de compra, refund, tentativas e falhas por gateway
- respostas operacionais de transação e gateway omitem credenciais sensíveis do gateway
