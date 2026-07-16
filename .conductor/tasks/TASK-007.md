# Task: Refatorar OCR Vision e Parse Ingredients
**Task ID:** TASK-007
**Spec:** SPEC-003
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P1
**Esforço estimado:** 3h

---

## Descrição
Reescrever o prompt de OCR Vision (atualmente 4 linhas em português) para inglês com chain-of-thought e exemplos de recibos fiscais brasileiros. Reescrever Parse Ingredients (1 frase) com exemplos de parsing de texto em português.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/services/groq_service.py` | Reescrever `extract_text_vision()` e `parse_ingredients()` |
| NEW | `backend-ja-comprei/app/prompts/ocr_vision_v1.py` | Prompt versionado |

## Checklist
### OCR Vision
- [ ] Reescrever prompt em inglês (melhor performance em modelos Llama)
- [ ] Adicionar chain-of-thought: "First, identify the document type. Then extract items..."
- [ ] Incluir exemplos de recibos brasileiros (NFC-e, Cupom Fiscal)
- [ ] Instruir sobre qualidade de foto: glare, thermal paper fading, rotation
- [ ] Definir cada categoria com exemplos (alimento, limpeza, higiene, outros)
- [ ] Extrair prompt para arquivo versionado (`prompts/ocr_vision_v1.py`)

### Parse Ingredients
- [ ] Reescrever prompt com exemplos de parsing em português
- [ ] Adicionar regras para quantidades: "1 cx", "2 pcts", "1 kg", "500g", "2 unid"
- [ ] Criar schema Pydantic `ParsedIngredients` para validação
- [ ] Unificar idioma (system prompt em português para input em português)

## Verificação
- [ ] Comando OCR: enviar foto de nota fiscal real → itens extraídos com categorias
- [ ] Comando Parse: "2 kg de arroz, 1 pct de feijão, 500g de frango" → JSON estruturado
- [ ] Categorias: "detergente" → "limpeza", "sabonete" → "higiene", "ração" → "outros"

## Notas
- Modelos Llama/GPT-OSS performam melhor com prompts em inglês para tarefas estruturadas
- Chain-of-thought melhora precisão em recibos complexos com múltiplos produtos
