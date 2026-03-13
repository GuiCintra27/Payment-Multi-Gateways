# Análise de Requisitos e Aderência Atual

Leitura consolidada do teste técnico BeTalent e comparação com o estado real da aplicação.

## Visão geral

O projeto implementa uma API REST multi-gateway de pagamentos com banco MySQL e integração com dois gateways externos mockados. O fluxo central é:

1. receber uma compra pública
2. calcular o valor no back-end
3. tentar cobrança nos gateways ativos por prioridade
4. aplicar fallback em caso de falha
5. persistir a transação e seus produtos

O nível-alvo continua sendo o mais completo do teste: múltiplos produtos, autenticação nos gateways, RBAC, Docker Compose e TDD.

## Requisitos principais do teste

| Requisito        | Expectativa                                         |
| ---------------- | --------------------------------------------------- |
| Compra pública   | `POST /purchases`                                   |
| Cálculo do total | servidor calcula `sum(price * quantity)`            |
| Gateways         | dois gateways com autenticação e schemas diferentes |
| Fallback         | ordem por prioridade com troca automática em falha  |
| Reembolso        | operação no gateway da transação original           |
| Roles            | `ADMIN`, `MANAGER`, `FINANCE`, `USER`               |
| Persistência     | valores em centavos e pivot com produtos comprados  |
| Testes           | cobertura real dos fluxos críticos                  |
| Infra            | Docker Compose com app, banco e mocks               |

## Stack definida no projeto

| Aspecto           | Escolha atual        |
| ----------------- | -------------------- |
| Framework         | AdonisJS 6           |
| Linguagem         | TypeScript           |
| Banco             | MySQL 8              |
| ORM               | Lucid                |
| Validação         | VineJS               |
| Auth              | Access Tokens opaque |
| Testes            | Japa                 |
| Padrão de gateway | Strategy + Factory   |
| Estrutura         | MVC + Service Layer  |

## Modelo de dados esperado

```
users
gateways
clients
products
transactions
transaction_products
```

Observações de domínio:

- valores monetários em centavos
- `transaction_products` registra quantidade e preço no momento da compra
- `card_last_numbers` guarda apenas os 4 últimos dígitos

## Rotas esperadas

### Públicas

- `POST /login`
- `POST /purchases`

### Autenticadas

- `/users` para `ADMIN`, `MANAGER`
- `/products` para `ADMIN`, `MANAGER`, `FINANCE`
- `/clients` para `ADMIN`, `MANAGER`, `FINANCE`
- `/transactions` para `ADMIN`, `MANAGER`, `FINANCE`
- `/transactions/:id/refund` para `ADMIN`, `FINANCE`
- `/gateways/:id/toggle` e `/gateways/:id/priority` para `ADMIN`

## Estado atual de aderência

| Item                                | Status              | Observação                                                                                     |
| ----------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| Setup do projeto AdonisJS 6         | Concluído           | projeto configurado e versionado                                                               |
| Docker Compose                      | Concluído           | app + MySQL + gateway mocks                                                                    |
| Migrations do banco                 | Concluído           | tabelas principais presentes                                                                   |
| Seeds iniciais                      | Concluído           | admin e gateways                                                                               |
| Auth com API tokens                 | Concluído           | login/logout implementados                                                                     |
| Middleware RBAC                     | Concluído           | role middleware aplicado nas rotas                                                             |
| CRUD de usuários                    | Concluído           | controllers + validators + testes                                                              |
| CRUD de produtos                    | Concluído           | controllers + validators + testes                                                              |
| Clientes e detalhe                  | Parcial             | rotas existem, faltam testes dedicados                                                         |
| Integração gateway 1                | Concluído no código | falta validação integrada com mock                                                             |
| Integração gateway 2                | Concluído no código | falta validação integrada com mock                                                             |
| Factory + prioridade                | Concluído no código | falta prova integrada do fallback                                                              |
| Fallback automático                 | Concluído no código | falta teste real do cenário                                                                    |
| Compra pública                      | Parcial             | fluxo existe, faltam testes funcionais/integrados                                              |
| Transações                          | Parcial             | rotas existem; faltam mais testes do fluxo                                                     |
| Reembolso                           | Parcial             | fluxo existe, faltam testes dedicados                                                          |
| Gestão de gateways                  | Parcial             | endpoints existem, incluindo reorder de prioridade; faltam mais testes e validações de cenário |
| TDD / cobertura dos fluxos críticos | Parcial             | base montada, cobertura ainda insuficiente                                                     |
| README detalhado                    | Pendente            | arquivo não existe na raiz                                                                     |
| Documentação pública do projeto     | Pendente            | `docs/projects/` ainda não existe                                                              |

## Diferenças entre docs e implementação atual

### Permissões de backoffice

As rotas de `clients` e `transactions` devem seguir menor privilégio:

- `ADMIN`
- `MANAGER`
- `FINANCE`

O perfil `USER` nao deve acessar dados operacionais de clientes ou transacoes.

### Test runner

A referência inicial mencionava Jest como preferência e Japa como fallback. O projeto real está configurado com Japa e deve ser documentado assim.

### Status do projeto

O projeto já não está mais apenas na fase de setup. Há uma implementação parcial relevante do core e a documentação precisa tratar isso com precisão.

## Critérios de avaliação mais sensíveis no estado atual

Os pontos que mais impactam a percepção do teste hoje são:

1. coerência entre documentação, requisito e código
2. cobertura dos fluxos críticos de compra e refund
3. demonstração real do fallback entre gateways
4. clareza de operação local
5. tratamento de dados sensíveis

## Próxima leitura recomendada

- `docs/local/handoff-status.md`
- `docs/local/implementation-roadmap.md`
- `docs/architecture-patterns.md`
- `docs/documentation-patterns.md`
