# Padrões de Documentação e Estado Atual

Documento de referência para organizar a documentação do projeto com base em dois eixos:

- o padrão observado no projeto `~/Projects/Mine/payment-gateway`
- o estado real do repositório atual

## Situação atual

Hoje o projeto possui documentação-base útil, mas ainda não possui a camada pública planejada.

### Já existe

- `AGENTS.md`
- `docs/requirements.md`
- `docs/architecture-patterns.md`
- `docs/documentation-patterns.md`
- `docs/local/handoff-status.md`
- `docs/local/implementation-roadmap.md`

### Ainda não existe

- `README.md` na raiz
- `docs/projects/INDEX.md`
- `docs/projects/QUICK-START.md`
- `docs/projects/ARCHITECTURE.md`
- `docs/projects/DATA-MODEL.md`
- `docs/projects/FLOWS.md`
- `docs/projects/INTEGRATIONS.md`
- `docs/projects/INFRA.md`
- `docs/projects/SECURITY.md`
- `docs/projects/RUNBOOK.md`

## Padrão recomendado

O projeto de referência usa uma hierarquia simples e profissional:

```
docs/
├── projects/   # documentação pública do sistema
├── local/      # notas e planos de trabalho ativos
└── archive/    # histórico, se necessário
```

Esse padrão continua sendo adequado aqui.

## Responsabilidade por camada

| Camada | Objetivo |
|---|---|
| `README.md` | visão executiva do projeto para recrutador e avaliador |
| `AGENTS.md` | contexto operacional para agentes de IA |
| `docs/projects/` | documentação pública, estável e navegável |
| `docs/local/` | status, roadmap e notas de trabalho em andamento |

## Estrutura pública proposta

| Documento | Pergunta que responde | Prioridade |
|---|---|---|
| `INDEX.md` | por onde começo a ler? | Alta |
| `QUICK-START.md` | como subo e valido o projeto? | Alta |
| `ARCHITECTURE.md` | como as partes se conectam? | Alta |
| `DATA-MODEL.md` | quais tabelas e relacionamentos existem? | Alta |
| `FLOWS.md` | como compra e refund funcionam? | Alta |
| `INTEGRATIONS.md` | como os gateways externos são consumidos? | Alta |
| `INFRA.md` | o que sobe no Docker e em quais portas? | Média |
| `SECURITY.md` | como auth, RBAC e dados sensíveis são tratados? | Média |
| `RUNBOOK.md` | como operar e resolver problemas comuns? | Média |
| `OBSERVABILITY.md` | como monitorar métricas e logs? | Baixa, opcional |

## Convenções recomendadas

### Para documentos públicos

- título direto em `#`
- abertura curta explicando o escopo do documento
- seções focadas por domínio
- tabelas para portas, variáveis, endpoints e troubleshooting
- exemplos JSON em integrações e fluxos
- links cruzados entre os docs

### Para documentos locais

- manter foco em status, decisões e próximos passos
- deixar explícito o que já foi feito, o que está parcial e o que falta
- registrar limitações de validação quando o ambiente impedir execução

## Adaptação do padrão de referência

Itens que valem ser trazidos do projeto de referência:

- `INDEX.md` como hub principal
- `TECHNICAL-REFERENCE` como referência rápida, se o material ficar grande
- `RUNBOOK.md` com troubleshooting objetivo
- `SECURITY.md` enxuto e pragmático
- `OBSERVABILITY.md` separado, somente se o bônus for implementado

Itens que não precisam ser copiados agora:

- espelho completo em inglês
- estrutura de `archive/` mais complexa
- documentação de múltiplos serviços

## Fluxo de atualização

Sempre que o código mudar:

1. revisar se a mudança afeta `README.md`, `AGENTS.md` ou `docs/projects/`
2. atualizar os documentos de status em `docs/local/` quando houver impacto no plano
3. só considerar a tarefa concluída depois que a documentação refletir o comportamento real

## Próximo passo documental

O próximo passo de maior valor é criar `docs/projects/INDEX.md` e `docs/projects/QUICK-START.md`, porque eles melhoram imediatamente a leitura do projeto por recrutadores e avaliadores.
