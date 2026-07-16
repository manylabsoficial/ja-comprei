# Changelog

> Registro temporal de alterações do projeto "Já Comprei".
> Cada entrada referencia specs e tasks relacionados.
> Independente de commits git — este é o source of truth do histórico.

---

## 2026-07-07 (Implementação)

### 🔧 Implementado — SPEC-005 (P1)

**SPEC-005 — Orquestração de Receitas Resiliente com LangGraph** ✅
- `requirements.txt`: Inclusão de `langgraph`, `langchain`, `langchain-openai`, `langchain-groq`.
- `config.py`: Adicionadas configurações de API e constantes do OpenRouter.
- `app/prompts/chef_v2.py`: Novo prompt de receitas gourmet criativas e visual_tag avançada.
- `app/services/image_service.py`: Novo roteador de imagem tríplice (OpenRouter ➔ Gemini ➔ Pollinations AI).
- `app/services/recipe_graph.py`: Máquina de estados baseada em LangGraph com nós de contexto, geração, validação Pydantic, auto-correção por reflexão e paralelização de imagens.
- `app/services/ai_orchestrator.py`: Refatorado para chamar o grafo de forma assíncrona.
- `docs/langgraph_operations.md`: Guia de documentação operacional do LangGraph.
- `scripts/test_recipe_graph.py`: Suite de testes unitários mockados para simulação de falhas (JSON quebrado, fallback e retries). Todos os testes passando com sucesso.

---

## 2026-06-26 (Implementação — Onda 1, 2, 3)

### 🔧 Implementado — Onda 1 (P0)

**TASK-001 — Correção MODEL_VISION** ✅
- `config.py`: `MODEL_VISION` alterado de `llama-4-maverick` (deprecado) para `llama-4-scout-17b` (Preview, ativo)
- Todos os arquivos: removidas referências a "Maverick" no código app

**TASK-002 — DeepSeekService** ✅
- `app/services/deepseek_service.py`: novo serviço com OpenAI client apontado para API DeepSeek
- Reutiliza CHEF_SYSTEM_PROMPT, _calculate_recipe_count(), _sanitize_and_parse_json() do GroqService
- Suporta deepseek-v4-flash com 384K output tokens (vs 32K do Llama 3.3)
- `requirements.txt`: adicionado `openai==2.14.0`

**TASK-004 — Migração MODEL_FAST** ✅
- `config.py`: `MODEL_FAST` alterado de `llama-3.1-8b-instant` para `openai/gpt-oss-20b`
- GPT-OSS 20B: MMLU 85.3%, 1000 tps, reasoning mode

**TASK-005 — Correção Pollinations** ✅
- `config.py`: `POLLINATIONS_MODEL` alterado de `turbo` para `flux`
- `pollinations_service.py`: hardcoded `model = "flux"` → `settings.POLLINATIONS_MODEL`

**TASK-010 — Sanitização prompt injection** ✅
- `app/utils/sanitize.py`: sanitize_ingredient(), sanitize_ingredient_list(), sanitize_user_text()
- 9 regex patterns para detectar tentativas de injection
- Escape de `{}` para evitar quebra do `.format()`
- `groq_service.py`: sanitização aplicada em `generate_recipes()` e `parse_ingredients()`

### 🔧 Implementado — Onda 2 (P0)

**TASK-003 — ModelRouter multi-provider** ✅
- `app/services/model_router.py`: ModelRouter com fallback automático
- Cadeia: DeepSeek V4 Flash → Groq GPT-OSS 120B → Groq GPT-OSS 20B
- `ai_orchestrator.py`: atualizado para usar model_router.generate_recipes()
- Logger messages atualizados (Maverick → Scout)

### 🔧 Implementado — Onda 3 (P1)

**TASK-006 — Refatoração CHEF_SYSTEM_PROMPT** ✅
- `app/prompts/chef_v1.py`: prompt versionado com metadata header
- 2 few-shot examples (compra rápida 3 itens, compra média 6 itens)
- Guidelines condicionais (não mais CAPS NEGATIVOS absolutos)
- Despensa Virtual: 11 → 5 itens universais
- visual_tag: exemplos bons vs ruins
- Regra de fallback para ingredientes incompatíveis
- `groq_service.py`: prompt inline removido, importa do arquivo versionado

**TASK-007 — Refatoração OCR Vision + Parse** ✅
- `app/prompts/ocr_vision_v1.py`: prompt OCR em inglês, chain-of-thought, tipos de documentos BR (NFC-e, SAT, Cupom Fiscal), definições de categoria
- `app/prompts/parse_ingredients_v1.py`: prompt em português com regras de quantidade e 2 exemplos
- `groq_service.py`: ambos prompts agora importados dos arquivos versionados

**TASK-008 — Refatoração Metadata Extraction** ✅
- `metadata_extractor.py`: system prompt com instruções no role system (não user)
- `_normalize_metadata_text()`: normalização de acentos (fácil→facil), traduções (chicken→frango, easy→facil), extração JSON de markdown
- Porcentagens: `//total` → `/total` (float division)
- Summary enriquecido com tipos de refeição comuns

**TASK-009 — Versionamento de prompts** ✅
- `app/prompts/__init__.py`: package com AVAILABLE_PROMPTS, guia de versionamento
- `app/prompts/metadata_v1.py`: prompt versionado com 12 regras + 2 few-shot examples
- Rollback: trocar import de v2 para v1 sem deploy de código

**TASK-011 — Variações Ghibli** ✅
- `pollinations_service.py`: 5 variações de estilo por meal type + seed aleatório
- Negative prompt: termos específicos Ghibli (modern anime, CGI, sketch, chibi...)
- `enhance=true` ativado
- `ai_orchestrator.py`: ciclo de estilos por posição na grade de receitas

### 📋 Verificação Final
- ✅ ZERO referências a "Maverick" no código app
- ✅ ZERO `model = "flux"` hardcoded (usa settings)
- ✅ Todos os prompts migrados para arquivos versionados
- ✅ `requirements.txt` atualizado com `openai`
- ✅ Cadeia de fallback: DeepSeek V4 Flash → Groq GPT-OSS 120B → Groq GPT-OSS 20B
- ⚠️ `DEEPSEEK_API_KEY` precisa ser configurado no .env para produção

---

## Histórico Anterior (via Git)

Para histórico anterior a 2026-06-26, consultar `git log --oneline`. Commits notáveis:

| Commit | Data | Descrição |
|---|---|---|
| `ada2bde` | recente | Atualização dos requirements |
| `ac486c9` | — | Receitas aprimoradas e imagens Ghibli |
| `c5ee974` | — | Site funcional com bugs na geração de imagens |
| `9fe4a2f` | — | Commit inicial limpo |
