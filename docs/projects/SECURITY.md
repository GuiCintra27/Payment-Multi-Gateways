# Security

Resumo das decisoes de seguranca presentes no projeto.

## Autenticacao

- auth baseada em access tokens opaque do AdonisJS
- login em `POST /login`
- logout em `POST /logout`
- header esperado: `Authorization: Bearer <token>`

## Autorizacao

Roles suportadas:

- `ADMIN`
- `MANAGER`
- `FINANCE`
- `USER`

## Matriz de acesso

| Recurso    | ADMIN | MANAGER | FINANCE | USER | Publico |
| ---------- | ----- | ------- | ------- | ---- | ------- |
| Login      | -     | -       | -       | -    | sim     |
| Compra     | -     | -       | -       | -    | sim     |
| Usuarios   | sim   | sim     | nao     | nao  | nao     |
| Produtos   | sim   | sim     | sim     | nao  | nao     |
| Clientes   | sim   | sim     | sim     | nao  | nao     |
| Transacoes | sim   | sim     | sim     | nao  | nao     |
| Refund     | sim   | nao     | sim     | nao  | nao     |
| Gateways   | sim   | nao     | nao     | nao  | nao     |

## Dados sensiveis

Regras atuais:

- nao persistir numero completo do cartao
- nao persistir CVV
- persistir somente `card_last_numbers`
- valores monetarios em centavos para evitar erro de ponto flutuante
- nao expor `credentials` dos gateways nas respostas da API

## Gateways externos

Cada gateway usa um mecanismo diferente:

- gateway 1: login e bearer token
- gateway 2: headers fixos de autenticacao

## Correlacao basica

- `X-Request-Id` e aceito na entrada ou gerado automaticamente
- o header e devolvido na resposta HTTP
- o valor e propagado para cobranca e refund nos gateways
- logs de compra, fallback e refund carregam `requestId` quando disponivel

## Limites atuais

Ainda nao implementado:

- rate limiting
