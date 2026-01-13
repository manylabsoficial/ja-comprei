# Spec: Refinamento de IA para Listas de Compras
**Track ID:** refinamento_ia_listas  
**Status:** DRAFT

## Objetivo
Tornar a IA de processamento de listas de compras mais inteligente e contextual, melhorando:
1. **Escala de Receitas** - Quantidade de receitas proporcional ao volume da compra
2. **Contextualização Brasileira** - Presunções culturais via prompt engineering (não hardcode)
3. **Geração de Imagens** - Descrições precisas para Pollinations baseadas nos ingredientes reais

## Requisitos

### 1. Escala Dinâmica de Receitas
| Volume da Compra | Nº de Receitas |
|------------------|----------------|
| 1-5 itens | 1-2 receitas |
| 6-15 itens | 3-5 receitas |
| 16-30 itens | 6-10 receitas |
| 31+ itens (compra do mês) | 10-15 receitas |

### 2. Contextualização Brasileira (Prompt Engineering)
A IA deve inferir contexto sem regras hardcoded. Exemplos:
- "Pão" sozinho → assumir pão francês
- "Mortadela", "Presunto" → fatiado (não em peça)
- Quantidades típicas de supermercado brasileiro
- Combinações regionais paulistas

### 3. Descrição de Imagem Otimizada
- Gerar prompt de imagem estritamente com ingredientes da receita
- Evitar elementos decorativos genéricos que não estão nos ingredientes
- Formato: descrição visual + estilo fotográfico

### 4. Sensibilidade Culinária
- **Receita Destaque**: pelo menos 1 receita elaborada/"de impressionar" por conjunto
- **Receitas Práticas**: demais receitas focadas em dia-a-dia
- Ingredientes premium (salmão, camarão, filé) → priorizar na receita destaque
- Novo campo `tipo_receita: "destaque" | "pratica"` no JSON

## Abordagem Técnica
- **NÃO hardcode**: Toda lógica será via engenharia de prompt
- Referência: `docs/engenharia_prompt/Otimizando OCR com Engenharia de Prompt.md`
- Modificações concentradas em `groq_service.py` (prompts) e `ai_orchestrator.py` (orquestração)

## Critérios de Aceite
- [ ] Receitas geradas variam conforme volume da lista
- [ ] Presunções culturais aplicadas corretamente
- [ ] Imagens coerentes com ingredientes da receita específica
