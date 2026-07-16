# Task: Criar DeepSeekService e configurar API
**Task ID:** TASK-002
**Spec:** SPEC-002
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P0
**Esforço estimado:** 4h

---

## Descrição
Criar um cliente para a API do DeepSeek usando o SDK OpenAI-compatible. O DeepSeek oferece endpoint compatível com `/v1/chat/completions`. Configurar API key e criar serviço com interface similar ao `GroqService` para facilitar o fallback.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/core/config.py` | Adicionar `DEEPSEEK_API_KEY` e constantes de modelo |
| NEW | `backend-ja-comprei/app/services/deepseek_service.py` | Cliente DeepSeek |
| MODIFY | `backend-ja-comprei/.env` (ou env vars) | Adicionar `DEEPSEEK_API_KEY` |

## Checklist
- [ ] Adicionar `DEEPSEEK_API_KEY` nas env vars
- [ ] Adicionar constantes em `config.py`: `DEEPSEEK_MODEL_FLASH`, `DEEPSEEK_BASE_URL`
- [ ] Criar `deepseek_service.py` com classe `DeepSeekService`
- [ ] Implementar `generate_recipes()` compatível com assinatura do GroqService
- [ ] Implementar `execute_safe()` com fallback básico
- [ ] Testar chamada simples à API (`curl` ou Python)
- [ ] Testar geração de receitas com ingredientes mock

## Verificação
- [ ] Comando: `python -c "from app.services.deepseek_service import deepseek_service; print(deepseek_service.generate_recipes(['arroz', 'feijão', 'ovo']))"`
- [ ] Resultado esperado: JSON com receitas no formato `ReceitasResponse`
- [ ] Logs mostram modelo `deepseek-v4-flash` sendo usado

## Notas
- DeepSeek usa OpenAI-compatible API: base_url = `https://api.deepseek.com`
- Preço: $0.14 input / $0.28 output por 1M tokens
- Contexto: 1M tokens, output máximo: 384K tokens
- Suporta `response_format: { type: "json_object" }` — compatível com código atual
- Cache hit: $0.0028 input (95% de desconto) — prompts repetidos beneficiam
