# Spec: Migração de Modelos de IA
**Spec ID:** SPEC-002
**Criado:** 2026-06-26
**Status:** APPROVED
**Prioridade:** P0
**Autor:** Auditoria de IA

---

## Objetivo
Migrar os modelos de IA atuais (Llama 3.3 70B e Llama 3.1 8B) para modelos mais modernos e custo-eficientes, adicionando DeepSeek como provedor alternativo para resiliência multi-provider.

## Motivação
Os modelos atuais são antigos e caros comparados às alternativas disponíveis em 2026:
- **Heavy (receitas):** Llama 3.3 70B custa $0.59/$0.79 — o mais caro entre as opções. Limitado a 32K tokens de output, truncando receitas longas.
- **Fast (parsing):** Llama 3.1 8B é fraco para parsing semântico de ingredientes e classificação de metadados (12 campos).
- **Pollinations:** Config (`turbo`) diverge do código (`flux`).
- **Sem fallback:** Se Groq cair, app inteiro para.

## Requisitos
### Funcionais
- [ ] REQ-01: MODEL_HEAVY → `deepseek-v4-flash` (DeepSeek API) como primário
- [ ] REQ-02: MODEL_HEAVY com fallback → `openai/gpt-oss-120b` (Groq)
- [ ] REQ-03: MODEL_FAST → `openai/gpt-oss-20b` (Groq)
- [ ] REQ-04: POLLINATIONS_MODEL unificado para `flux`
- [ ] REQ-05: Criar `DeepSeekService` com interface compatível
- [ ] REQ-06: Fallback automático: DeepSeek falha → Groq GPT-OSS 120B

### Não-Funcionais
- [ ] NFR-01: Redução de custo ≥ 60% na geração de receitas
- [ ] NFR-02: Output máximo ≥ 65K tokens (sem truncamento de receitas)
- [ ] NFR-03: Resiliência multi-provider (sem single point of failure)

## Escopo
### Dentro do escopo
- Criar `DeepSeekService` com OpenAI-compatible client
- Adicionar `DEEPSEEK_API_KEY` nas env vars
- Criar `ModelRouter` que seleciona primário/fallback por função
- Migrar constantes em `config.py`
- Unificar Pollinations para `flux`

### Fora do escopo (v1)
- Streaming de respostas
- Cache de receitas
- A/B testing entre modelos

## Critérios de Aceite
- [ ] AC-01: Receitas geradas via DeepSeek V4 Flash com qualidade ≥ atual
- [ ] AC-02: Fallback Groq GPT-OSS 120B funciona quando DeepSeek indisponível
- [ ] AC-03: Parsing com GPT-OSS 20B extrai ingredientes corretamente
- [ ] AC-04: Custo médio por receita ≤ $0.008
- [ ] AC-05: Nenhum truncamento de receitas com 8+ passos

## Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| DeepSeek API fora do ar | Alto | Fallback automático para Groq GPT-OSS 120B |
| GPT-OSS 20B mais caro no parsing | Baixo | Custo sobe $0.025/$0.22 por 1M — insignificante para parsing curto |
| Formato de resposta diferente entre provedores | Médio | Abstrair via `ModelRouter` com normalização |

## Tasks Relacionadas
- TASK-002: Criar DeepSeekService e configurar API
- TASK-003: Migrar MODEL_HEAVY e adicionar fallback
- TASK-004: Migrar MODEL_FAST
- TASK-005: Corrigir Pollinations e unificar config
