# Padrões Arquiteturais — Referência do Projeto Payment Gateway

> Análise do projeto `~/Projects/Mine/payment-gateway` para identificar padrões que elevam a qualidade do teste técnico BeTalent.

---

## 📊 Resumo dos Padrões Identificados

| Categoria | Padrão | Viabilidade no Teste | Prioridade |
|---|---|---|---|
| **Versionamento** | Conventional Commits + release-please | ✅ Fácil | 🟢 Alta |
| **CI/CD** | GitHub Actions com jobs escopados | ✅ Fácil | 🟢 Alta |
| **Docker** | Compose split por responsabilidade | ✅ Fácil | 🟢 Alta |
| **Script de Dev** | Comando único `start-dev.sh` | ✅ Moderado | 🟢 Alta |
| **Logs Estruturados** | JSON structured logging | ✅ Fácil | 🟢 Alta |
| **Telemetry** | Request ID tracking (correlation) | ✅ Fácil | 🟡 Média |
| **Métricas** | prom-client + endpoint `/metrics` | ⚠️ Moderado | 🟡 Média |
| **Observabilidade** | Prometheus + Grafana dashboards | ⚠️ Bônus | 🟡 Média |
| **Retenção de Logs** | Loki + Promtail | ⚠️ Bônus | 🔵 Baixa |
| **Outbox Pattern** | Garantia de entrega de eventos | ❌ Overkill | 🔴 Descartado |
| **Kafka/Filas** | Mensageria assíncrona | ❌ Overkill | 🔴 Descartado |
| **DLQ** | Dead Letter Queue | ❌ Overkill | 🔴 Descartado |
| **Chaos Testing** | Scripts de resiliência | ❌ Overkill | 🔴 Descartado |

---

## 🟢 Padrões para Importar (Alta Prioridade)

### 1. Conventional Commits + Release Please

**O que é:** Versionamento semântico automático baseado em mensagens de commit padronizadas.

**O que copiar:**
- `release-please-config.json` + `.release-please-manifest.json`
- `.github/workflows/release-please.yml`
- Commitizen (opcional, para forçar padrão no dev local)

**Benefício:** CHANGELOG automático, tags semânticas, demonstra maturidade no versionamento.

```json
// release-please-config.json
{
  "packages": {
    ".": {
      "release-type": "node",
      "changelog-path": "CHANGELOG.md",
      "include-component-in-tag": false
    }
  }
}
```

---

### 2. GitHub Actions CI com Testes Integrados

**O que é:** Pipeline de CI com jobs escopados por tipo de teste.

**O que copiar:**
- `.github/workflows/ci.yml` com jobs: `lint`, `test`, `smoke`
- Script `scripts/ci.sh` com escopo parametrizável

**Adaptação para AdonisJS:**
```yaml
# .github/workflows/ci.yml
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm test

  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose up -d --build
      - run: ./scripts/ci.sh smoke
```

---

### 3. Docker Compose Split por Responsabilidade

**O que é:** Múltiplos docker-compose files separados por contexto.

**Arquivos no referência:**
- `docker-compose.yaml` — stack principal (app + banco + mocks)
- `docker-compose.monitoring.yaml` — Prometheus + Grafana
- `docker-compose.logging.yaml` — Loki + Promtail + Grafana logs

**Adaptação para o teste:**
```
docker-compose.yaml          → MySQL + App + Gateway Mocks (obrigatório)
docker-compose.monitoring.yaml → Prometheus + Grafana (bônus)
docker-compose.logging.yaml    → Loki + Promtail (bônus)
```

---

### 4. Script Único de Desenvolvimento (`start-dev.sh`)

**O que é:** Script bash robusto que sobe toda a stack com um único comando.

**Padrões do referência (740 linhas):**
- Verificação de pré-requisitos (`require_cmd`)
- Resolução automática de portas (`AUTO_PORTS=true`)
- Healthchecks e `wait_for_port`
- Cleanup com `trap EXIT`
- Log colorido (`[INFO]`, `[WARN]`, `[ERROR]`)
- Toggle de observabilidade (`ENABLE_OBSERVABILITY=true`)
- Suporte a `LOG_TO_FILE`

**Adaptação simplificada para o teste:**
- Subir Docker Compose
- Aguardar MySQL healthy
- Rodar migrations/seeds
- Subir app com hot-reload
- Banner final com URLs

---

### 5. Logs Estruturados (JSON Structured Logging)

**O que é:** Logs em formato JSON com campos padronizados.

**Padrão do referência (Go `slog`):**
```go
slog.Error("outbox publish failed", "error", err, "event_id", ev.ID)
```

**Adaptação para AdonisJS:**
- Usar logger nativo do AdonisJS (Pino-based — já faz JSON por padrão)
- Adicionar `request_id` em cada log via middleware
- Configurar formato de log: JSON em produção, pretty em dev

---

## 🟡 Padrões para Importar (Média Prioridade — Bônus)

### 6. Request ID / Correlation ID

**O que é:** UUID gerado por request e propagado em todos os logs e chamadas.

**Padrão do referência:**
- Go: `telemetry/request_id.go` — context-based tracking
- Kafka: `x-request-id` header propagado nos eventos

**Adaptação:**
- Middleware AdonisJS que gera `X-Request-Id`
- Injetado no logger context de cada request
- Enviado como header nas chamadas aos gateways

---

### 7. Métricas com prom-client

**O que é:** Expor métricas da aplicação em formato Prometheus.

**Padrão do referência:**
```typescript
// MetricsService com prom-client
private readonly processedCounter = new Counter({
  name: 'transactions_processed_total',
  help: 'Total processed transactions.',
});
```

**Métricas úteis para o teste:**
- `purchases_total` (counter)
- `purchases_by_gateway` (counter com label `gateway`)
- `gateway_errors_total` (counter com label `gateway`)
- `refunds_total` (counter)
- `http_request_duration_seconds` (histogram)
- Endpoint `GET /metrics`

---

### 8. Stack de Observabilidade (Prometheus + Grafana)

**O que é:** Dashboard visual para monitorar métricas da aplicação.

**O que copiar:**
- `docker-compose.monitoring.yaml` (Prometheus + Grafana)
- `monitoring/prometheus.yml` (scrape config)
- `monitoring/grafana/` (dashboards e provisioning)

---

## 🔵 Padrões Bônus (Baixa Prioridade — Se Sobrar Tempo)

### 9. Stack de Logs (Loki + Promtail)

**O que é:** Persistência e busca centralizada de logs.

**O que copiar:**
- `docker-compose.logging.yaml`
- `monitoring/loki-config.yml`
- `monitoring/promtail-config.yml`

---

## 🔴 Padrões Descartados (Overkill para Teste Técnico)

| Padrão | Motivo |
|---|---|
| **Outbox Pattern** | Projeto não tem processamento assíncrono; chamadas aos gateways são síncronas |
| **Kafka/Filas** | Sem necessidade de mensageria — os gateways são REST síncronos |
| **DLQ** | Decorrente da não-necessidade de Kafka |
| **Deduplicação** | Idempotência é útil, mas DLQ+dedup é overkill |
| **Chaos Testing** | Excelente padrão, mas fora do escopo do teste |

---

## 🏗 Proposta Final de Arquitetura

Combinando os padrões viáveis com os requisitos do teste:

```
Payment Multi Gateways/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + Test + Smoke
│       └── release-please.yml        # Versionamento automático
├── docker-compose.yaml               # MySQL + App + Gateway Mocks
├── docker-compose.monitoring.yaml    # (Bônus) Prometheus + Grafana
├── docker-compose.logging.yaml       # (Bônus) Loki + Promtail
├── monitoring/                       # (Bônus) Configs Prometheus/Grafana/Loki
├── scripts/
│   ├── start-dev.sh                  # Comando único para subir tudo
│   └── ci.sh                         # Script de CI modular
├── docs/
│   ├── requirements.md               # ✅ Já criado
│   └── architecture-patterns.md      # ✅ Este documento
├── release-please-config.json
├── .release-please-manifest.json
├── CHANGELOG.md
├── Dockerfile
└── src/                              # AdonisJS 6
    ├── app/
    │   ├── controllers/
    │   ├── models/
    │   ├── services/
    │   │   └── gateway/              # Strategy Pattern
    │   │       ├── gateway_strategy.ts
    │   │       ├── gateway1_adapter.ts
    │   │       ├── gateway2_adapter.ts
    │   │       └── gateway_factory.ts
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   ├── role.ts
    │   │   └── request_id.ts         # Correlation ID
    │   └── validators/
    ├── config/
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    ├── start/
    │   └── routes.ts
    └── tests/
```

---

## 📋 Ordem de Implementação Sugerida

1. **Setup base**: AdonisJS 6 + Docker Compose + MySQL + Gateway Mocks
2. **Versionamento**: Conventional Commits + release-please + CI workflow
3. **Core funcional**: Migrations, Models, Auth, RBAC, CRUDs
4. **Gateway Integration**: Strategy Pattern + Factory + Fallback
5. **Compra e Reembolso**: Lógica de negócio principal
6. **Testes TDD**: Cobertura completa (unit + integration)
7. **Script de dev**: `start-dev.sh` com healthchecks
8. **Bônus**: Request ID, Structured Logging, Métricas, Observabilidade
9. **Documentação**: README completo + comentários de código
