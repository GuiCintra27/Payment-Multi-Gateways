# Infra

Resumo da infraestrutura local e de CI.

## Docker Compose

Servicos definidos em `docker-compose.yaml`:

| Servico        | Funcao                  | Porta          |
| -------------- | ----------------------- | -------------- |
| `mysql`        | persistencia principal  | `3306`         |
| `gateway-mock` | mocks dos dois gateways | `3001`, `3002` |
| `app`          | API AdonisJS            | `3333`         |

## Comportamento do container da app

Ao subir a stack completa, o servico `app` executa:

```sh
node ace migration:run --force
node ace db:seed
node bin/server.js
```

## Persistencia

- volume `mysql_data` para dados do MySQL

## CI

O workflow principal:

- usa `node:24`
- sobe MySQL 8 como service
- sobe `matheusprotzen/gateways-mock`
- espera os mocks responderem
- roda `npm run lint`
- roda `npm run typecheck`
- roda `node ace migration:fresh --force`
- roda `npm test`

Depois disso, um job de smoke sobe a stack via Docker Compose.

## Variaveis principais

| Variavel                 | Uso                             |
| ------------------------ | ------------------------------- |
| `APP_KEY`                | chave da app                    |
| `LOG_LEVEL`              | nivel de log                    |
| `DB_*`                   | conexao com MySQL               |
| `GATEWAY1_*`             | integracao com gateway 1        |
| `GATEWAY2_*`             | integracao com gateway 2        |
| `RUN_REAL_GATEWAY_TESTS` | habilita testes reais com mocks |

## Ambientes praticos

### Dev local

- app no host
- banco e mocks via Docker

### Full Docker

- tudo em containers

### Validacao de CI local

O projeto foi validado em ambiente dockerizado com `node:24`, MySQL e gateway mocks reais.
