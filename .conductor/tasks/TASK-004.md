# Task: Migrar MODEL_FAST para GPT-OSS 20B
**Task ID:** TASK-004
**Spec:** SPEC-002
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P0
**Esforço estimado:** 1h

---

## Descrição
Substituir `llama-3.1-8b-instant` por `openai/gpt-oss-20b` nas funções de parsing de ingredientes e extração de metadados. O GPT-OSS 20B é significativamente mais capaz (MMLU 85.3%) com custo apenas marginalmente maior.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/core/config.py` | Alterar `MODEL_FAST` |
| MODIFY | `backend-ja-comprei/docs/engenharia_prompt/prompts_IA.md` | Atualizar referência |

## Checklist
- [ ] Alterar `MODEL_FAST` de `llama-3.1-8b-instant` para `openai/gpt-oss-20b`
- [ ] Testar `parse_ingredients()` com texto em português
- [ ] Testar `metadata_extractor.extract_from_recipe()` com receita real
- [ ] Confirmar que JSON mode funciona com GPT-OSS 20B
- [ ] Verificar se há diferença de comportamento (output format)

## Verificação
- [ ] Comando: testar parsing de "2 kg de arroz, 1 pct de feijão, 500g de frango"
- [ ] Resultado esperado: `{ ingredientes: [{ item: "arroz", quantidade: "2 kg" }, ...] }`
- [ ] Comando: testar extração de metadados de receita salva
- [ ] Resultado esperado: JSON compatível com `RecipeMetadata` schema

## Notas
- GPT-OSS 20B: 1000 tps (vs 560 tps do Llama 3.1 8B) — mais rápido
- Custo input sobe $0.025/1M tokens — insignificante para parsing curto
- Suporta reasoning mode — pode melhorar precisão em classificação de metadados
