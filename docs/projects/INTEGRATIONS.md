# Integrations

Contratos principais da API e dos gateways externos.

## API da aplicacao

Header transversal:

- `X-Request-Id`: opcional na entrada, sempre retornado na resposta

### Publicos

| Metodo | Rota         | Descricao           |
| ------ | ------------ | ------------------- |
| `GET`  | `/`          | health check        |
| `GET`  | `/metrics`   | metricas Prometheus |
| `POST` | `/login`     | autentica usuario   |
| `POST` | `/purchases` | cria compra publica |

### Autenticados

| Metodo   | Rota                       | Roles                                 |
| -------- | -------------------------- | ------------------------------------- |
| `POST`   | `/logout`                  | qualquer autenticado                  |
| `GET`    | `/users`                   | `ADMIN`, `MANAGER`                    |
| `POST`   | `/users`                   | `ADMIN`, `MANAGER`                    |
| `GET`    | `/users/:id`               | `ADMIN`, `MANAGER`                    |
| `PUT`    | `/users/:id`               | `ADMIN`, `MANAGER`                    |
| `DELETE` | `/users/:id`               | `ADMIN`, `MANAGER`                    |
| `GET`    | `/products`                | `ADMIN`, `MANAGER`, `FINANCE`         |
| `POST`   | `/products`                | `ADMIN`, `MANAGER`, `FINANCE`         |
| `GET`    | `/products/:id`            | `ADMIN`, `MANAGER`, `FINANCE`         |
| `PUT`    | `/products/:id`            | `ADMIN`, `MANAGER`, `FINANCE`         |
| `DELETE` | `/products/:id`            | `ADMIN`, `MANAGER`, `FINANCE`         |
| `GET`    | `/clients`                 | qualquer autenticado                  |
| `GET`    | `/clients/:id`             | qualquer autenticado                  |
| `GET`    | `/gateways`                | `ADMIN`                               |
| `PATCH`  | `/gateways/:id/toggle`     | `ADMIN`                               |
| `PATCH`  | `/gateways/:id/priority`   | `ADMIN`                               |
| `GET`    | `/transactions`            | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `GET`    | `/transactions/:id`        | `ADMIN`, `MANAGER`, `FINANCE`, `USER` |
| `POST`   | `/transactions/:id/refund` | `ADMIN`, `FINANCE`                    |

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

### Criacao

```json
{
  "name": "Product One",
  "amount": 1500
}
```

## Gateway 1

Base URL via `GATEWAY1_URL`.

### Autenticacao

`POST /login`

```json
{
  "email": "dev@betalent.tech",
  "token": "FEC9BB078BF338F464F96B48089EB498"
}
```

Retorna bearer token usado nas demais chamadas.

### Cobranca

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
- erro de negocio: `400`
- a aplicacao propaga `X-Request-Id` quando disponivel

### Refund

`POST /transactions/:id/charge_back`

## Gateway 2

Base URL via `GATEWAY2_URL`.

Autenticacao por header fixo:

- `Gateway-Auth-Token`
- `Gateway-Auth-Secret`

### Cobranca

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
- erro de negocio pode vir embutido no body mesmo com resposta HTTP bem-sucedida
- a aplicacao propaga `X-Request-Id` quando disponivel

### Refund

`POST /transacoes/reembolso`

```json
{
  "id": "external-transaction-id"
}
```

## Observacoes de integracao

- os dois gateways possuem schemas e autenticacoes diferentes
- a aplicacao normaliza o resultado para `approved` ou `rejected`
- a lista de transacoes dos mocks vem encapsulada em `data`
- `GET /metrics` expõe contadores de compra, refund, tentativas e falhas por gateway
