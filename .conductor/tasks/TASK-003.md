# Task: Migrar MODEL_HEAVY e adicionar fallback multi-provider
**Task ID:** TASK-003
**Spec:** SPEC-002
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P0
**Esforço estimado:** 3h

---

## Descrição
Implementar um `ModelRouter` que seleciona o provedor correto para cada função (Heavy/Fast/Vision/Audio) e gerencia fallback automático. A função Heavy (geração de receitas) passa a usar DeepSeek V4 Flash como primário e Groq GPT-OSS 120B como fallback.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| NEW | `backend-ja-comprei/app/services/model_router.py` | Roteador de modelos com fallback |
| MODIFY | `backend-ja-comprei/app/core/config.py` | Atualizar MODEL_HEAVY, adicionar fallback |
| MODIFY | `backend-ja-comprei/app/services/groq_service.py` | Suportar GPT-OSS 120B |
| MODIFY | `backend-ja-comprei/app/services/ai_orchestrator.py` | Usar ModelRouter em vez de GroqService direto |

## Checklist
- [ ] Criar `ModelRouter` com método `generate_recipes(ingredients, preferences)`
- [ ] ModelRouter tenta DeepSeek V4 Flash primeiro
- [ ] Se DeepSeek falhar (timeout, rate limit, erro), tenta Groq GPT-OSS 120B
- [ ] Logs mostram qual modelo atendeu cada requisição
- [ ] Atualizar `config.py`: `MODEL_HEAVY_PRIMARY = "deepseek-v4-flash"`, `MODEL_HEAVY_FALLBACK = "openai/gpt-oss-120b"`
- [ ] Testar fallback: mockar falha do DeepSeek e confirmar que Groq assume
- [ ] Validar que output do GPT-OSS 120B tem formato compatível com Pydantic

## Verificação
- [ ] Comando: `curl -X POST http://localhost:8000/api/sugerir-receitas -H "Content-Type: application/json" -d '{"ingredientes": [{"item": "arroz"}, {"item": "feijão"}, {"item": "frango"}]}'`
- [ ] Resultado esperado: JSON com receitas; log mostra "deepseek-v4-flash" ou "gpt-oss-120b" se fallback
- [ ] Custo da chamada: ~$0.001-0.003 (vs $0.01-0.02 atual)

## Notas
- GPT-OSS 120B tem MMLU 90.0% — superior ao Llama 3.3 70B atual
- DeepSeek V4 Flash tem output máximo de 384K tokens — elimina truncamento de receitas
- Ambos suportam JSON mode — sem mudança no formato de resposta
