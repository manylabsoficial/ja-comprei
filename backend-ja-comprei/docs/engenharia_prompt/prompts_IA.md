# Prompts de IA - Já Comprei

## 1. Contexto Geral
Este documento centraliza os prompts utilizados pelos serviços de IA no backend, garantindo rastreabilidade e facilitando ajustes finos.

---

## 2. Chef Brasileiro (Geração de Receitas)
**Arquivo:** `groq_service.py` → `CHEF_SYSTEM_PROMPT`
**Modelo:** Llama 3.3 70B (Heavy) / Fallback: 3.1 8B (Fast)

### Objetivo
Sugerir receitas inteligentes baseadas em lista de compras, aplicando escala dinâmica e sensibilidade culinária.

### Principais Características
1. **Contexto Cultural Brasileiro**:
   - Interpreta "pão" como Pão Francês.
   - Presume frios (mortadela/presunto) fatiados.
   - Usa medidas caseiras típicas do Brasil (xícaras de arroz).

2. **Sensibilidade Culinária (Mix de Receitas)**:
   - **Receita Destaque**: Pelo menos 1 receita elaborada por conjunto. Prioriza ingredientes premium da lista ou aplica técnica diferenciada em básicos.
   - **Receitas Práticas**: Foco em preparo rápido (15-40min) para o dia-a-dia.

3. **Escala Dinâmica**:
   A quantidade de receitas varia conforme o volume da lista:
   - 1-5 itens → 2 receitas (Foco: praticidade)
   - 6-15 itens → 4 receitas (Foco: variedade)
   - 16-30 itens → 8 receitas (Foco: criatividade)
   - 31+ itens → 12 receitas (Foco: cardápio semanal)

4. **Geração de Imagem Otimizada**:
   - O próprio LLM gera o `descricao_imagem`.
   - Regra estrita: Apenas ingredientes visíveis no prato final.
   - Formato "Fotografia profissional" já embutido.

---

## 3. OCR Vision (Extração de Ingredientes)
**Arquivo:** `groq_service.py` → `extract_text_vision`
**Modelo:** Llama 3.2 11B / 90B Vision (Maverick)

### Prompt
> "Analise esta imagem de nota fiscal ou lista de compras. Extraia os itens e quantidades. RETORNE APENAS UM JSON PURO..."

### Estratégia
- Input: Imagem em Base64
- Output estrito: JSON `{ ingredientes: [{ item, quantidade }] }`
- Sem markdown, sem validação matemática complexa (por enquanto, foco em extração rápida).

[Para detalhes profundos de OCR, ver: `docs/engenharia_prompt/Otimizando OCR com Engenharia de Prompt.md`]