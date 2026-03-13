# Architecture

Visao geral da arquitetura atual do sistema.

## Stack

- AdonisJS 6
- TypeScript
- MySQL 8
- Lucid ORM
- VineJS
- Japa

## Estrutura por camada

| Camada                  | Responsabilidade                              |
| ----------------------- | --------------------------------------------- |
| `app/controllers/`      | HTTP concerns: validar, delegar, responder    |
| `app/services/`         | regra de negocio                              |
| `app/services/gateway/` | adapters, factory e orquestracao dos gateways |
| `app/models/`           | models e relacionamentos Lucid                |
| `app/validators/`       | validacao de entrada                          |
| `app/middleware/`       | auth e RBAC                                   |
| `database/`             | migrations, seeders e schema gerado           |
| `tests/`                | unitarios e funcionais                        |

## Fluxo principal

```text
HTTP Request
  -> Controller
  -> Validator
  -> Service
  -> GatewayService
  -> GatewayFactory
  -> Gateway Adapter
  -> Persistencia no MySQL
  -> HTTP Response
```

## Multi-gateway

O projeto usa Strategy + Factory para isolar diferencas entre gateways.

```text
GatewayService
  -> consulta gateways ativos por prioridade
  -> GatewayFactory.create(gateway)
  -> Gateway1Adapter ou Gateway2Adapter
  -> tentativa de cobranca
  -> fallback em caso de falha
```

## Decisoes principais

- total da compra calculado no servidor
- valores monetarios armazenados em centavos
- apenas os 4 ultimos digitos do cartao sao persistidos
- refund sempre usa o gateway da transacao original
- controllers finos e regra de negocio em services
- `X-Request-Id` gerado ou reaproveitado no middleware global
- `X-Request-Id` propagado para cobranca e refund nos gateways

## Componentes centrais

### `PurchaseService`

- valida produtos informados
- calcula `sum(amount * quantity)`
- cria ou reaproveita `Client` por email
- aciona `GatewayService`
- salva `Transaction` e `transaction_products`

### `GatewayService`

- consulta gateways ativos por prioridade
- tenta cobrar em ordem crescente de prioridade
- registra falhas e tenta o proximo gateway
- interrompe com erro quando todos falham

### `RefundService`

- carrega a transacao com gateway e cliente
- valida se a transacao pode ser reembolsada
- executa refund no gateway original
- atualiza o status para `refunded`

## Limites atuais

Itens ainda nao implementados:

- metricas em `/metrics`
- observabilidade dedicada
