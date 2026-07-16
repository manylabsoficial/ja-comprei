# Spec: Refatoração de Prompts de IA
**Spec ID:** SPEC-003
**Criado:** 2026-06-26
**Status:** APPROVED
**Prioridade:** P1
**Autor:** Auditoria de IA

---

## Objetivo
Elevar a qualidade dos prompts de IA do estágio "MVP artesanal" para nível profissional, com few-shot examples, sanitização, templates seguros e versionamento.

## Motivação
A auditoria identificou que todos os 6 prompts do sistema estão abaixo do padrão profissional:
- Zero few-shot examples em qualquer prompt
- Injeção dinâmica frágil com `.format()` (risco de crash com `{}` no texto)
- Sem proteção contra prompt injection nos ingredientes
- CHEF_SYSTEM_PROMPT com contradições e tom hostil (CAPS NEGATIVOS)
- OCR Vision subdimensionado para recibos brasileiros (4 linhas)
- Parse Ingredients praticamente inexistente (1 frase)
- Sem versionamento — impossível A/B testing ou rollback

## Requisitos
### Funcionais
- [ ] REQ-01: Adicionar 2-3 few-shot examples em CHEF_SYSTEM_PROMPT
- [ ] REQ-02: Reescrever OCR Vision em inglês com chain-of-thought e exemplos de recibos BR
- [ ] REQ-03: Reescrever Parse Ingredients com exemplos de parsing em português
- [ ] REQ-04: Mover instruções do Metadata Extraction para o system prompt
- [ ] REQ-05: Substituir CAPS NEGATIVOS por guidelines condicionais no Chef
- [ ] REQ-06: Migrar `.format()` para Jinja2 com escape seguro
- [ ] REQ-07: Sanitizar lista de ingredientes contra prompt injection
- [ ] REQ-08: Criar estrutura `prompts/` com versionamento (v1, v2...)

### Não-Funcionais
- [ ] NFR-01: Templates não quebram com caracteres especiais no input
- [ ] NFR-02: Rollback de prompt possível sem deploy de código

## Escopo
### Dentro do escopo
- Refatorar 6 prompts do sistema
- Criar sistema de versionamento de prompts
- Adicionar sanitização de input

### Fora do escopo (v1)
- A/B testing automatizado
- Métricas de qualidade por prompt
- Migração para structured output / tool calling

## Critérios de Aceite
- [ ] AC-01: CHEF_SYSTEM_PROMPT com 2-3 exemplos few-shot
- [ ] AC-02: OCR Vision com prompt em inglês + chain-of-thought
- [ ] AC-03: Nenhum crash com input contendo `{}` ou caracteres especiais
- [ ] AC-04: Ingrediente malicioso (ex: `Ignore all previous instructions`) não afeta output
- [ ] AC-05: Prompts versionados em arquivos separados (não strings inline)

## Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| Few-shot examples vazarem para output | Médio | Posicionar exemplos no system prompt com delimitação clara |
| Jinja2 adicionar dependência | Baixo | Usar `string.Template` da stdlib como alternativa mais simples |
| Mudança de prompt alterar qualidade | Médio | Versionar; testar com conjunto fixo de ingredientes antes/depois |

## Tasks Relacionadas
- TASK-006: Refatorar CHEF_SYSTEM_PROMPT
- TASK-007: Refatorar OCR Vision e Parse Ingredients
- TASK-008: Refatorar Metadata Extraction
- TASK-009: Criar sistema de versionamento de prompts
- TASK-010: Sanitização contra prompt injection
