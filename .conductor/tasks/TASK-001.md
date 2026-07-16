# Task: Corrigir MODEL_VISION e testar OCR
**Task ID:** TASK-001
**Spec:** SPEC-001
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P0
**Esforço estimado:** 30 min

---

## Descrição
Substituir o modelo `meta-llama/llama-4-maverick-17b-128e-instruct` (ausente da Groq) por `meta-llama/llama-4-scout-17b-16e-instruct` (Preview, ativo). Testar com imagem de nota fiscal real para confirmar que o OCR continua funcionando.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/core/config.py` | Alterar `MODEL_VISION` |
| MODIFY | `backend-ja-comprei/docs/engenharia_prompt/prompts_IA.md` | Atualizar referência ao modelo |

## Checklist
- [ ] Alterar `MODEL_VISION` de `meta-llama/llama-4-maverick-17b-128e-instruct` para `meta-llama/llama-4-scout-17b-16e-instruct`
- [ ] Verificar se `groq_service.extract_text_vision()` funciona com o novo modelo
- [ ] Testar POST `/api/analisar-nota` com nota fiscal real
- [ ] Confirmar que classificação de categorias (alimento/limpeza/higiene/outros) funciona
- [ ] Atualizar documentação em `prompts_IA.md`

## Verificação
- [ ] Comando: `curl -X POST http://localhost:8000/api/analisar-nota -F "file=@nota_teste.jpg"`
- [ ] Resultado esperado: JSON com `{ ingredientes: [{ item, quantidade, categoria }] }`
- [ ] Logs sem "model not found"

## Notas
- Scout está como Preview na Groq — monitorar se for movido para Production ou Deprecated
- Scout suporta até 5 imagens por chamada e 20MB por arquivo
