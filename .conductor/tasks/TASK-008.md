# Task: Refatorar Metadata Extraction
**Task ID:** TASK-008
**Spec:** SPEC-003
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P2
**Esforço estimado:** 2h

---

## Descrição
Mover as 12 instruções do Metadata Extraction do user message para o system prompt. Adicionar 2 exemplos de entrada→saída. Normalizar validação Pydantic para aceitar variantes (acentos, traduções).

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/services/metadata_extractor.py` | Refatorar `METADATA_EXTRACTION_PROMPT` e `extract_from_recipe()` |
| MODIFY | `backend-ja-comprei/app/schemas.py` | Relaxar validação de literals |

## Checklist
- [ ] Mover 12 regras do user message para o system prompt
- [ ] Adicionar 2 exemplos few-shot de entrada (receita) → saída (metadados)
- [ ] Normalizar `nivel_dificuldade`: aceitar "fácil"→"facil", "easy"→"facil"
- [ ] Fornecer referência de preços brasileiros para `custo_estimado`
- [ ] Adicionar validação com normalização antes do Pydantic

## Verificação
- [ ] Comando: extrair metadados de receita com "fácil" no texto → não falhar validação
- [ ] Comando: extrair metadados de receita com "easy" no texto → mapear para "facil"
- [ ] Comando: `custo_estimado` consistente com ingredientes brasileiros

## Notas
- GPT-OSS 20B lida melhor com instruções complexas no system prompt
- Normalização pode ser feita com dict de mapeamento antes da validação Pydantic
