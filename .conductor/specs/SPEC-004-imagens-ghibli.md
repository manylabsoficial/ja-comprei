# Spec: Variação e Qualidade de Imagens Ghibli
**Spec ID:** SPEC-004
**Criado:** 2026-06-26
**Status:** APPROVED
**Prioridade:** P1
**Autor:** Auditoria de IA

---

## Objetivo
Adicionar variação criativa às imagens Ghibli do Pollinations, eliminando o efeito "cookie cutter" onde todas as imagens têm exatamente o mesmo estilo visual.

## Motivação
Atualmente, `pollinations_service.py` aplica o mesmo sufixo de estilo Ghibli para TODAS as receitas. O resultado é uma grade de receitas visualmente monótona, onde um café da manhã e um jantar têm exatamente o mesmo tratamento visual. Além disso:
- Seed é fixo (42), fazendo imagens com mesmo visual_tag serem idênticas
- Negative prompt é genérico, sem proteção específica contra artefatos Ghibli
- `enhance=false` — Pollinations tem auto-enhance desligado
- Aspect ratio fixo 1024×1024 para todos os contextos

## Requisitos
### Funcionais
- [ ] REQ-01: Criar 3-4 variações de estilo Ghibli por tipo de refeição (café, almoço, lanche, jantar)
- [ ] REQ-02: Seed aleatório por imagem (não fixo)
- [ ] REQ-03: Negative prompt melhorado com termos específicos anti-artefatos
- [ ] REQ-04: Ativar `enhance=true` no Pollinations
- [ ] REQ-05: Suportar aspect ratios diferentes (hero 16:9, card 1:1)

### Não-Funcionais
- [ ] NFR-01: Imagens visualmente distintas entre tipos de refeição
- [ ] NFR-02: Estilo Ghibli consistente (não derivar para fotorrealismo ou 3D)

## Escopo
### Dentro do escopo
- Refatorar `PollinationsService` com variações de estilo
- Passar `tipo_refeicao` do Chef para o Pollinations
- Melhorar negative prompt
- Corrigir seed e enhance

### Fora do escopo (v1)
- Múltiplos provedores de imagem
- Geração condicional (ex: não gerar imagem se visual_tag muito genérico)
- Cache de imagens

## Critérios de Aceite
- [ ] AC-01: Receita de café da manhã e receita de jantar têm estilos visuais diferentes
- [ ] AC-02: Duas receitas com mesmo visual_tag geram imagens diferentes (seed aleatório)
- [ ] AC-03: Nenhuma imagem com artefatos "modern anime", "3D render" ou "CGI"
- [ ] AC-04: Imagens de hero usam 16:9; cards usam 1:1

## Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| Variação de estilo descaracterizar Ghibli | Médio | Manter "Studio Ghibli style" como âncora comum em todas as variações |
| Enhance=true aumentar latência | Baixo | Medir; se impacto >2s, manter false |

## Tasks Relacionadas
- TASK-011: Refatorar PollinationsService com variações de estilo
