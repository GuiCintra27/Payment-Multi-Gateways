# Padrões de Documentação — Referência Payment Gateway

> Análise da estrutura de documentação do projeto `payment-gateway` para replicar no teste BeTalent.

---

## Estrutura Geral

O projeto usa uma hierarquia de 3 camadas:

```
docs/
├── projects/           # Documentação pública (11 docs + INDEX)
│   ├── INDEX.md        # Ponto de entrada — links para todos os docs
│   ├── QUICK-START.md  # Como rodar o projeto
│   ├── ARCHITECTURE.md # Diagrama mermaid + visão geral dos serviços
│   ├── DATA-MODEL.md   # Tabelas, campos, indexes
│   ├── FLOWS.md        # Fluxos de negócio passo a passo
│   ├── INTEGRATIONS.md # Contratos de API + payloads JSON
│   ├── INFRA.md        # Docker Compose, volumes, redes, portas
│   ├── SECURITY.md     # Auth, rate limit, dados sensíveis
│   ├── OBSERVABILITY.md# Métricas, logs, Loki, SLOs
│   ├── RUNBOOK.md      # Comandos operacionais + troubleshooting
│   ├── TECHNICAL-REFERENCE.md  # Referência rápida: endpoints, portas, env vars
│   └── en/             # Espelho em inglês (todos os docs traduzidos)
├── archive/            # Docs históricos (não são fonte de verdade)
│   └── local/          # Planos antigos, QA, iterações
├── local/              # Notas de trabalho ativas (WIP)
│   ├── README.md       # Regras: só implementação ativa, mover p/ archive ao finalizar
│   └── private/        # Planos internos
AGENTS.md               # Na raiz — README para AI coding agents
README.md               # Na raiz — Visão geral do projeto para humanos
```

## Padrões Observados

### 1. INDEX.md como Hub Central
- Links organizados por categoria (Começando, Arquitetura, Plataforma)
- Links cruzados entre docs de serviços individuais
- Seção de arquivo para docs históricos

### 2. Template Consistente por Documento
Cada doc público segue padrão:
- **Linha 1:** Título em `#`
- **Linha 3:** Toggle de idioma `[**PT-BR**](./FILE.md) | [EN](./en/FILE.md)`
- **Corpo:** Seções com `##` e conteúdo focado no domínio
- **Mermaid** em ARCHITECTURE e FLOWS
- **Tabelas** em RUNBOOK (troubleshooting matrix)
- **Exemplos JSON** em INTEGRATIONS

### 3. Separação Clara de Responsabilidades
| Documento | Responde à pergunta |
|---|---|
| QUICK-START | "Como rodo isso?" |
| ARCHITECTURE | "Como os pedaços se conectam?" |
| DATA-MODEL | "Quais tabelas existem e o que cada campo faz?" |
| FLOWS | "O que acontece quando o usuário faz X?" |
| INTEGRATIONS | "Como os serviços se comunicam?" |
| INFRA | "O que roda no Docker e em quais portas?" |
| SECURITY | "Como auth, dados sensíveis e proteções funcionam?" |
| OBSERVABILITY | "Como monitoro métricas e logs?" |
| RUNBOOK | "Como opero, debugo e faço troubleshooting?" |
| TECHNICAL-REFERENCE | "Referência rápida de endpoints, portas e env vars" |

### 4. Ciclo de Vida da Documentação
```
docs/local/     →  Trabalho ativo (WIP)
docs/projects/  →  Documentação pública atualizada
docs/archive/   →  Docs finalizados/obsoletos
```

### 5. AGENTS.md — Para Agentes AI
Arquivo na raiz com seções:
- **Project overview** — o que é o projeto
- **Setup commands** — como subir (local, docker, infra only)
- **Endpoints and ports** — referência rápida
- **Environment files** — onde ficam os .env
- **Code style** — convenções por linguagem/serviço
- **Architecture notes** — fluxo macro de dados
- **Critical gotchas** — armadilhas que o agente precisa saber
- **Project structure** — árvore simplificada
- **Common tasks** — comandos frequentes
- **Branch workflow** — como trabalhar com branches
- **Plan tracking discipline** — como manter planos sincronizados

---

## Adaptação para o BeTalent

### Docs que faremos (por ordem de prioridade)

| Doc | Já temos? | Status |
|---|---|---|
| `docs/requirements.md` | ✅ Sim | Criado |
| `docs/architecture-patterns.md` | ✅ Sim | Criado |
| `docs/projects/INDEX.md` | ❌ | A criar |
| `docs/projects/QUICK-START.md` | ❌ | A criar |
| `docs/projects/ARCHITECTURE.md` | ❌ | A criar após implementação |
| `docs/projects/DATA-MODEL.md` | ❌ | A criar após migrations |
| `docs/projects/FLOWS.md` | ❌ | A criar após lógica de negócio |
| `docs/projects/INTEGRATIONS.md` | ❌ | A criar (contratos dos gateways) |
| `docs/projects/INFRA.md` | ❌ | A criar (Docker, portas) |
| `docs/projects/SECURITY.md` | ❌ | A criar (auth, RBAC, dados sensíveis) |
| `docs/projects/RUNBOOK.md` | ❌ | A criar (troubleshooting) |
| `AGENTS.md` | ❌ | A criar agora |
| `README.md` | ⚠️ Scaffold | A reescrever no final |

### Docs que NÃO faremos (simplificação para teste)
- `OBSERVABILITY.md` — só se implementarmos o bônus de métricas
- `TECHNICAL-REFERENCE.md` — integramos no QUICK-START
- `docs/archive/` — sem necessidade para projeto novo
- `docs/local/` — nossos planos ficam no diretório de artifacts do agente
- Tradução EN — não necessário para teste técnico
