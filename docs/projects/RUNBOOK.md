# Runbook

Comandos operacionais e troubleshooting rápido.

## Comandos principais

### Subir local

```bash
./scripts/start-dev.sh
```

### Subir stack completa

```bash
docker compose up --build
```

### Rodar migrations

```bash
node ace migration:run
```

### Rodar seeders

```bash
node ace db:seed
```

### Rodar testes

```bash
npm test
```

### Rodar lint e typecheck

```bash
npm run lint
npm run typecheck
```

### Subir observabilidade opcional

```bash
docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build
```

## Troubleshooting

### Porta 3306, 3001, 3002 ou 3333 em uso

- pare os containers existentes
- revise processos locais ocupando as portas
- rode novamente o compose ou o script de dev

### App não sobe por falha de banco

Verifique:

- `mysql` em estado saudável
- variáveis `DB_*`
- se as migrations rodaram

Comando útil:

```bash
docker compose ps
```

### Compra falha em todos os gateways

Verifique:

- se `gateway-mock` está ativo
- se `GATEWAY1_URL` e `GATEWAY2_URL` estão corretas
- se as credenciais dos gateways conferem com `.env.example`
- se existe ao menos um gateway ativo na tabela `gateways`

### Testes reais dos gateways

Para habilitar os testes que batem nos mocks reais:

```bash
RUN_REAL_GATEWAY_TESTS=true npm test
```

### Validar `X-Request-Id`

```bash
curl -i http://localhost:3333 -H 'X-Request-Id: req-manual-1'
```

O header deve voltar na resposta com o mesmo valor.

### Validar `/metrics`

```bash
curl http://localhost:3333/metrics
```

Você deve ver contadores no formato Prometheus, incluindo métricas de compra, refund e gateway.

### Validar Loki

```bash
curl -sS http://localhost:3100/ready
```

### Validar Tempo

```bash
curl -sS http://localhost:3200/ready
```

### Validar dashboards do Grafana

1. suba a stack com `docker compose -f docker-compose.yaml -f docker-compose.monitoring.yaml up -d --build`
2. abra `http://localhost:3005`
3. entre com `admin` / `admin`, salvo override por variável
4. abra a pasta `Payment Gateway`
5. valide os dashboards `Payment Gateway Overview`, `Gateway Reliability` e `Payment Incident Triage`

### Rodar smoke automatizado

Com a aplicação de pé:

```bash
./scripts/smoke-e2e.sh
```

### Rodar smoke de observabilidade

Valida logs + traces correlacionados em cenários de compra, fallback, refund e falha controlada:

```bash
./scripts/smoke-observability.sh
```

## Smoke manual sugerido

1. autenticar um admin
2. criar um produto
3. executar `POST /purchases`
4. consultar `GET /transactions`
5. executar `POST /transactions/:id/refund`

## Logs

O projeto usa logs estruturados com Pino e carrega os campos operacionais principais:

- `requestId`
- `route`
- `gateway`
- `transactionId`
- `status`
- `trace_id` (quando tracing ativo)
