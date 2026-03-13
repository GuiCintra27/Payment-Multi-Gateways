# Quick Start

Como subir e validar o projeto rapidamente.

## Requisitos

- Node.js 24+
- npm
- Docker com `docker compose`

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessario.

Variaveis principais:

- `APP_KEY`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `GATEWAY1_URL`, `GATEWAY2_URL`
- `GATEWAY1_EMAIL`, `GATEWAY1_TOKEN`
- `GATEWAY2_AUTH_TOKEN`, `GATEWAY2_AUTH_SECRET`

## Opcao 1: desenvolvimento local

```bash
./scripts/start-dev.sh
```

Esse fluxo:

- sobe MySQL e gateway mocks
- instala dependencias, se necessario
- roda migrations
- roda seeders
- inicia o servidor AdonisJS com HMR

## Opcao 2: stack completa via Docker

```bash
docker compose up --build
```

Nesse modo, o container da aplicacao executa:

- `node ace migration:run --force`
- `node ace db:seed`
- `node bin/server.js`

## Validacao rapida

### Health check

```bash
curl http://localhost:3333
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-03-13T00:00:00.000Z"
}
```

### Rodar testes

```bash
npm test
```

### Lint e typecheck

```bash
npm run lint
npm run typecheck
```

## Credenciais e portas padrao

| Recurso        | URL/porta               |
| -------------- | ----------------------- |
| API            | `http://localhost:3333` |
| Gateway Mock 1 | `http://localhost:3001` |
| Gateway Mock 2 | `http://localhost:3002` |
| MySQL          | `localhost:3306`        |

## Usuario seed

O projeto sobe com um usuario admin via seeder. Se precisar revisar ou alterar, verifique `database/seeders/01_admin_seeder.ts`.
