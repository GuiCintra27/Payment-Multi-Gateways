# Runbook

Comandos operacionais e troubleshooting rapido.

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

## Troubleshooting

### Porta 3306, 3001, 3002 ou 3333 em uso

- pare os containers existentes
- revise processos locais ocupando as portas
- rode novamente o compose ou o script de dev

### App nao sobe por falha de banco

Verifique:

- `mysql` em estado saudavel
- variaveis `DB_*`
- se as migrations rodaram

Comando util:

```bash
docker compose ps
```

### Compra falha em todos os gateways

Verifique:

- se `gateway-mock` esta ativo
- se `GATEWAY1_URL` e `GATEWAY2_URL` estao corretas
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

Voce deve ver contadores no formato Prometheus, incluindo metricas de compra, refund e gateway.

## Smoke manual sugerido

1. autenticar um admin
2. criar um produto
3. executar `POST /purchases`
4. consultar `GET /transactions`
5. executar `POST /transactions/:id/refund`

## Logs

O projeto usa logs estruturados com Pino e agora carrega `requestId` nos logs principais de compra, fallback e refund.
