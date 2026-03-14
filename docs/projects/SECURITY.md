# Segurança

Resumo das decisões de segurança presentes no projeto.

## Autenticação

- auth baseada em access tokens opaque do AdonisJS
- login em `POST /login`
- logout em `POST /logout`
- header esperado: `Authorization: Bearer <token>`

## Autorização

Roles suportadas:

- `ADMIN`
- `MANAGER`
- `FINANCE`
- `USER`

## Matriz de acesso

| Recurso    | ADMIN | MANAGER | FINANCE | USER | Público |
| ---------- | ----- | ------- | ------- | ---- | ------- |
| Login      | -     | -       | -       | -    | sim     |
| Compra     | -     | -       | -       | -    | sim     |
| Usuários   | sim   | sim     | não     | não  | não     |
| Produtos   | sim   | sim     | sim     | não  | não     |
| Clientes   | sim   | sim     | sim     | não  | não     |
| Transações | sim   | sim     | sim     | não  | não     |
| Refund     | sim   | não     | sim     | não  | não     |
| Gateways   | sim   | não     | não     | não  | não     |

## Dados sensíveis

Regras atuais:

- não persistir número completo do cartão
- não persistir CVV
- persistir somente `card_last_numbers`
- valores monetários em centavos para evitar erro de ponto flutuante
- não expor `credentials` dos gateways nas respostas da API

## Gateways externos

Cada gateway usa um mecanismo diferente:

- gateway 1: login e bearer token
- gateway 2: headers fixos de autenticação

## Correlação básica

- `X-Request-Id` é aceito na entrada ou gerado automaticamente
- o header é devolvido na resposta HTTP
- o valor é propagado para cobrança e refund nos gateways
- logs de compra, fallback e refund carregam `requestId` quando disponível

## Limites atuais

Ainda não implementado:

- rate limiting
