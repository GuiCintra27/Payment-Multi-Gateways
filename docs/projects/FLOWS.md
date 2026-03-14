# Fluxos

Fluxos de negócio principais da aplicação.

## Compra pública

Endpoint: `POST /purchases`

### Entrada

```json
{
  "client": {
    "name": "Buyer",
    "email": "buyer@example.com"
  },
  "products": [
    { "id": 1, "quantity": 2 },
    { "id": 2, "quantity": 1 }
  ],
  "card": {
    "number": "4111111111111111",
    "cvv": "123",
    "holderName": "BUYER TEST",
    "expirationDate": "12/2030"
  }
}
```

### Passo a passo

1. O controller valida o payload com `purchaseValidator`.
2. `PurchaseService` busca os produtos por ID.
3. O total é calculado no servidor usando quantidade e preço atual.
4. O cliente é criado ou reaproveitado por email.
5. `GatewayService` tenta cobrar no gateway ativo de maior prioridade.
6. Em erro, o próximo gateway ativo é tentado.
7. A aplicação persiste `transactions` e `transaction_products`.
8. A resposta retorna resumo da compra, cliente, gateway e itens.

### Saída de sucesso

```json
{
  "transaction": {
    "id": 10,
    "status": "approved",
    "amount": 6000,
    "cardLastNumbers": "1111",
    "createdAt": "2026-03-13T12:00:00.000Z"
  },
  "client": {
    "id": 3,
    "name": "Buyer",
    "email": "buyer@example.com"
  },
  "gateway": "gateway2",
  "products": [
    {
      "id": 1,
      "name": "Product One",
      "quantity": 2,
      "unitPrice": 1500,
      "subtotal": 3000
    }
  ],
  "totalAmount": 6000
}
```

### Erros relevantes

| Situação                   | HTTP  | Resposta                                             |
| -------------------------- | ----- | ---------------------------------------------------- |
| produto inexistente        | `422` | `Products not found: ...`                            |
| todos os gateways falharam | `503` | `Payment processing failed. Please try again later.` |
| nenhum gateway ativo       | `503` | `Payment processing is temporarily unavailable.`     |

## Reembolso

Endpoint: `POST /transactions/:id/refund`

Roles: `ADMIN`, `FINANCE`

### Passo a passo

1. O controller recebe o ID da transação.
2. `RefundService` carrega transação, gateway e cliente.
3. O status é validado.
4. O refund é disparado no gateway original da transação.
5. O status local é atualizado para `refunded`.

### Saída de sucesso

```json
{
  "transaction": {
    "id": 10,
    "status": "refunded",
    "amount": 6000,
    "refundedAt": "2026-03-13T12:05:00.000Z"
  },
  "client": {
    "id": 3,
    "name": "Buyer",
    "email": "buyer@example.com"
  },
  "gateway": "gateway2"
}
```

### Erros relevantes

| Situação                 | HTTP  | Resposta                                     |
| ------------------------ | ----- | -------------------------------------------- |
| transação inexistente    | `404` | `Transaction not found`                      |
| transação já reembolsada | `422` | `Transaction already refunded`               |
| transação não aprovada   | `422` | `Cannot refund transaction with status: ...` |

## Fallback entre gateways

O fallback acontece dentro de `GatewayService`.

### Regra

- buscar gateways com `is_active = true`
- ordenar por `priority asc`
- tentar um a um
- no primeiro sucesso, encerrar
- se todos falharem, retornar erro consolidado

### Exemplo

```text
gateway1 (priority 1) falha
-> gateway2 (priority 2) aprova
-> transação fica vinculada ao gateway2
```
