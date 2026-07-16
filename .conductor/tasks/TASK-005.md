# Task: Corrigir Pollinations e unificar config
**Task ID:** TASK-005
**Spec:** SPEC-002
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P1
**Esforço estimado:** 15 min

---

## Descrição
Corrigir inconsistência entre `config.py` (que define `POLLINATIONS_MODEL = "turbo"`) e `pollinations_service.py` (que hardcoded `model = "flux"`). Unificar para `flux` que é superior para consistência de imagem.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/core/config.py` | `POLLINATIONS_MODEL` de `turbo` para `flux` |
| MODIFY | `backend-ja-comprei/app/services/pollinations_service.py` | Usar `settings.POLLINATIONS_MODEL` em vez de hardcoded |

## Checklist
- [ ] Alterar `POLLINATIONS_MODEL: str = "turbo"` para `"flux"` em `config.py`
- [ ] Alterar `model = "flux"` hardcoded para `model = settings.POLLINATIONS_MODEL` em `pollinations_service.py`
- [ ] Confirmar que imagens continuam sendo geradas

## Verificação
- [ ] Comando: gerar receita e verificar URL da imagem contém `model=flux`
- [ ] Resultado esperado: URL com `&model=flux`

## Notas
- `flux` é o modelo recomendado para consistência e qualidade
- `turbo` é mais rápido mas menos consistente
