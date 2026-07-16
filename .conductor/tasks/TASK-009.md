# Task: Criar sistema de versionamento de prompts
**Task ID:** TASK-009
**Spec:** SPEC-003
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P1
**Esforço estimado:** 2h

---

## Descrição
Migrar prompts de strings inline no código para arquivos versionados em `backend-ja-comprei/app/prompts/`. Cada prompt ganha um arquivo com versão (v1, v2...) e metadata (data, modelo alvo, autor). O código importa do arquivo versionado, permitindo rollback sem deploy.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| NEW | `backend-ja-comprei/app/prompts/__init__.py` | Package init |
| NEW | `backend-ja-comprei/app/prompts/chef_v1.py` | CHEF_SYSTEM_PROMPT v1 |
| NEW | `backend-ja-comprei/app/prompts/ocr_vision_v1.py` | OCR Vision prompt v1 |
| NEW | `backend-ja-comprei/app/prompts/parse_ingredients_v1.py` | Parse prompt v1 |
| NEW | `backend-ja-comprei/app/prompts/metadata_v1.py` | Metadata extraction prompt v1 |
| MODIFY | `backend-ja-comprei/app/services/groq_service.py` | Importar prompts de `app.prompts` |
| MODIFY | `backend-ja-comprei/app/services/metadata_extractor.py` | Importar prompt de `app.prompts` |

## Checklist
- [ ] Criar estrutura `app/prompts/` com `__init__.py`
- [ ] Migrar `CHEF_SYSTEM_PROMPT` → `prompts/chef_v1.py`
- [ ] Migrar OCR Vision prompt → `prompts/ocr_vision_v1.py`
- [ ] Migrar Parse Ingredients prompt → `prompts/parse_ingredients_v1.py`
- [ ] Migrar Metadata Extraction prompt → `prompts/metadata_v1.py`
- [ ] Cada arquivo contém: versão, data, modelo alvo, changelog
- [ ] Atualizar imports nos serviços

## Verificação
- [ ] Comando: `python -c "from app.prompts.chef_v1 import CHEF_SYSTEM_PROMPT; print(CHEF_SYSTEM_PROMPT[:100])"`
- [ ] Resultado esperado: prompt carregado do arquivo versionado
- [ ] Rollback: alterar import de `chef_v2` para `chef_v1` — sem deploy de lógica

## Notas
- Formato do arquivo: constante Python (mantém compatibilidade)
- Versionamento: v1, v2... por prompt (não por release)
- Metadata no topo do arquivo como docstring/comment
