# Task: Refatorar PollinationsService com variações de estilo
**Task ID:** TASK-011
**Spec:** SPEC-004
**Criado:** 2026-06-26
**Status:** DONE
**Prioridade:** P1
**Esforço estimado:** 2h

---

## Descrição
Adicionar variação criativa às imagens Ghibli: diferentes "humores" visuais por tipo de refeição, seed aleatório, negative prompt melhorado, e suporte a aspect ratios.

## Arquivos Afetados
| Ação | Arquivo | Descrição |
|---|---|---|
| MODIFY | `backend-ja-comprei/app/services/pollinations_service.py` | Refatorar com variações |
| MODIFY | `backend-ja-comprei/app/services/ai_orchestrator.py` | Passar `tipo_refeicao` ao Pollinations |

## Checklist
- [ ] Criar dicionário `STYLE_VARIATIONS` com 4 humores:
  - `cafe_manha`: "morning light, steam rising, warm golden tones"
  - `almoco`: "midday table, vibrant colors, natural daylight"
  - `jantar`: "evening ambiance, candlelit, rich shadows, cozy"
  - `lanche/sobremesa`: "afternoon light, delicate, soft pastels"
- [ ] Adicionar `get_ghibli_url(visual_tag, meal_type)` com seleção de estilo
- [ ] Seed aleatório: `seed = random.randint(1, 999999)` (documentado, não fixo)
- [ ] Negative prompt: adicionar "modern anime, CGI 3D, sketch lines, chibi, deformed, text, watermark"
- [ ] Ativar `enhance=true`
- [ ] Suportar `aspect_ratio` param: `get_ghibli_url(visual_tag, meal_type, aspect="1:1")`
- [ ] Atualizar `ai_orchestrator.py` para passar `tipo_refeicao` do Chef ao Pollinations

## Verificação
- [ ] Comando: gerar receita de café da manhã → URL contém "morning light, steam rising"
- [ ] Comando: gerar receita de jantar → URL contém "evening ambiance, candlelit"
- [ ] Comando: duas chamadas com mesmo visual_tag → seeds diferentes = imagens diferentes
- [ ] Comando: imagem hero → aspect ratio 16:9; card → 1:1

## Notas
- Estilos são sufixos adicionados ao visual_tag + "Anime food illustration, Studio Ghibli style"
- Manter "Studio Ghibli style" como âncora comum em TODAS as variações
- Pollinations suporta aspect ratios via parâmetro `&aspect=16:9` na URL
