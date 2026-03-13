# Arquivado - Padroes Arquiteturais e Sinais de Senioridade

> Documento historico de planejamento. Nao e a fonte de verdade do estado atual.
> Links e status internos podem estar desatualizados.

Síntese do que foi extraído do projeto de referência `~/Projects/Mine/payment-gateway` e do que faz sentido aplicar neste teste técnico.

## Objetivo

Trazer apenas os padrões que aumentam a percepção de maturidade técnica sem empurrar o projeto para overengineering.

## Matriz de adoção

| Padrão | Valor | Custo | Estado atual no projeto | Decisão |
|---|---|---|---|---|
| Conventional Commits + Release Please | Alto | Baixo | Já adotado | Manter |
| CI com lint, typecheck, test e smoke | Alto | Baixo | Já adotado em boa parte | Manter e endurecer |
| Script único de desenvolvimento | Alto | Baixo | Já adotado | Manter |
| Logs estruturados | Alto | Baixo | Parcialmente adotado | Melhorar |
| Request ID / correlação | Alto | Baixo | Não adotado | Adotar |
| Métricas básicas em `/metrics` | Alto | Médio | Não adotado | Adotar se o tempo permitir |
| Documentação pública por domínio | Alto | Médio | Não adotado | Adotar |
| Monitoring completo com Prometheus/Grafana | Médio | Médio | Não adotado | Opcional |
| Logging stack com Loki/Promtail | Médio | Médio/Alto | Não adotado | Opcional |
| Multi-compose por responsabilidade | Médio | Baixo | Parcial | Opcional |
| Kafka, outbox, DLQ | Baixo para este escopo | Alto | Não adotado | Não adotar |

## O que já foi bem aproveitado

### 1. Automação de release

O repositório já tem:

- `release-please-config.json`
- `.release-please-manifest.json`
- workflow de release

Isso já é um bom sinal de organização e disciplina de versionamento.

### 2. CI básica

O pipeline atual já cobre:

- lint
- typecheck
- migrations em CI
- testes
- smoke com Docker

Para este teste, isso já passa boa maturidade estrutural.

### 3. Script de desenvolvimento

O `scripts/start-dev.sh` do projeto atual já segue um padrão saudável:

- valida pré-requisitos
- sobe só a infra necessária
- espera serviços
- roda migrations e seeds
- sobe o servidor em modo dev

## O que falta para elevar o projeto

### Request ID

No projeto de referência, a correlação entre logs e chamadas é um marcador claro de senioridade. Para este projeto, o recorte ideal é:

- gerar `X-Request-Id` por request
- incluir o valor nos logs
- repassar o header para chamadas aos gateways

Isso tem alto retorno com custo baixo.

### Métricas mínimas

Não precisa replicar uma stack inteira para demonstrar maturidade. Um endpoint `/metrics` já seria suficiente para mostrar intenção operacional.

Métricas sugeridas:

- `purchases_total`
- `purchase_failures_total`
- `refunds_total`
- `gateway_errors_total{gateway=...}`
- `gateway_charge_attempts_total{gateway=...}`

### Smoke funcional

Além do smoke atual de subida da aplicação, vale mais para o recrutador um smoke pequeno que prove:

- app sobe
- compra pública responde
- fallback pode ser exercitado

## Itens opcionais e controlados

### Observabilidade

Trazer Prometheus/Grafana pode ser positivo, mas só vale a pena se:

- a implementação for enxuta
- o custo de manutenção da doc for baixo
- o core já estiver testado

### Multi-compose

Separar `docker-compose.monitoring.yaml` pode ser elegante, mas não é prioridade absoluta para este teste.

## Itens a evitar

Os seguintes padrões funcionam no projeto de referência, mas seriam desproporcionais aqui:

- outbox
- mensageria
- DLQ
- antifraude assíncrono
- replay operacional complexo

## Leituras práticas para guiar a evolução

No projeto de referência, os documentos mais úteis para inspirar a evolução deste repositório são:

- `docs/projects/INDEX.md`
- `docs/projects/QUICK-START.md`
- `docs/projects/RUNBOOK.md`
- `docs/projects/SECURITY.md`
- `docs/projects/OBSERVABILITY.md`
- `AGENTS.md`

## Decisão arquitetural recomendada

A melhor estratégia para este teste é:

1. fechar o core e a cobertura dos fluxos críticos
2. criar documentação pública clara
3. adicionar um ou dois bônus de alto retorno

Os bônus prioritários continuam sendo:

- request ID
- métricas básicas
- documentação pública profissional
