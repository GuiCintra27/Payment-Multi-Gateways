# Arquitetura

Visão geral da arquitetura atual do sistema.

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
| `app/services/`         | regra de negócio                              |
| `app/services/gateway/` | adapters, factory e orquestração dos gateways |
| `app/models/`           | models e relacionamentos Lucid                |
| `app/validators/`       | validação de entrada                          |
| `app/middleware/`       | auth e RBAC                                   |
| `database/`             | migrations, seeders e schema gerado           |
| `tests/`                | unitários e funcionais                        |

## Fluxo principal

```text
HTTP Request
  -> Controller
  -> Validator
  -> Service
  -> GatewayService
  -> GatewayFactory
  -> Gateway Adapter
  -> Persistência no MySQL
  -> HTTP Response
```

## Multi-gateway

O projeto usa Strategy + Factory para isolar diferenças entre gateways.

```text
GatewayService
  -> consulta gateways ativos por prioridade
  -> GatewayFactory.create(gateway)
  -> Gateway1Adapter ou Gateway2Adapter
  -> tentativa de cobrança
  -> fallback em caso de falha
```

## Decisões principais

- total da compra calculado no servidor
- valores monetários armazenados em centavos
- apenas os 4 últimos dígitos do cartão são persistidos
- refund sempre usa o gateway da transação original
- controllers finos e regra de negócio em services
- `X-Request-Id` gerado ou reaproveitado no middleware global
- `X-Request-Id` propagado para cobrança e refund nos gateways
- métricas em memória expostas em `/metrics` no formato Prometheus
- spans manuais com OpenTelemetry em compra, orquestração/fallback e refund
- contexto de logs padronizado com `requestId` e `trace_id`

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
- registra falhas e tenta o próximo gateway
- interrompe com erro quando todos falham

### `RefundService`

- carrega a transação com gateway e cliente
- valida se a transação pode ser reembolsada
- executa refund no gateway original
- atualiza o status para `refunded`

## Limites atuais

Itens ainda não implementados:

- alertas operacionais
- pipeline enterprise de logs/tracing
