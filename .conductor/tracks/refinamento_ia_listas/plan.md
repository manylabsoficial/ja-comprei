# Plano de Implementação: Refinamento de IA para Listas de Compras

## Contexto
O sistema atual usa Groq LLM para gerar receitas e Pollinations para imagens, mas os prompts são genéricos. Este plano implementa inteligência contextual brasileira e escala dinâmica.

---

## Proposed Changes

### Componente 1: Groq Service - Prompts Inteligentes

#### [MODIFY] [groq_service.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/services/groq_service.py)

**1.1 Prompt de Contextualização Brasileira (System Prompt)**

Adicionar seção de CONTEXTO CULTURAL no system prompt de `generate_recipes`:

```python
CHEF_SYSTEM_PROMPT = """
Você é um Chef Brasileiro Criativo especializado em culinária paulista.

## CONTEXTO CULTURAL BRASILEIRO
Quando interpretar os ingredientes, aplique conhecimento cultural implícito:
- "Pão" sem especificação = Pão Francês (padrão brasileiro)
- "Mortadela", "Presunto", "Peito de Peru" = fatiados (para sanduíches), não peça inteira
- "Queijo Mussarela" = fatiado ou ralado, conforme contexto da receita
- "Linguiça" = calabresa defumada (padrão paulista) se não especificado
- Quantidades de mercado: 1 unidade de cebola = 1 cebola média (~150g)
- "Arroz" = arroz branco tipo 1 (5kg típico, usa-se 1-2 xícaras por refeição)
- Temperos básicos assumidos: sal, óleo, alho podem ser usados mesmo se não listados

## SENSIBILIDADE CULINÁRIA
Aplique um equilíbrio inteligente entre praticidade e sofisticação:

### Regra da Receita Especial
- Para cada conjunto de receitas, inclua PELO MENOS 1 "Receita Destaque":
  - Mais elaborada, com técnicas ou apresentação diferenciadas
  - Pode ser um prato "de impressionar" ou uma combinação inusitada
  - A receita destaque deve surgir NATURALMENTE dos ingredientes fornecidos pelo usuário

### Regra da Praticidade
- As demais receitas devem ser práticas, do dia-a-dia:
  - Preparo rápido (15-40 minutos)
  - Ingredientes simples e acessíveis
  - Receitas clássicas com pequenas variações

### Detecção de Ingredientes Especiais
- Analise a lista e identifique se há ingredientes menos comuns ou premium
- Se houver, use-os preferencialmente na Receita Destaque
- Se todos os ingredientes forem básicos, crie a Receita Destaque com uma técnica ou combinação criativa

> **IMPORTANTE**: Os exemplos abaixo são meramente ILUSTRATIVOS para você entender o conceito.  
> NÃO use esses ingredientes específicos a menos que estejam na lista do usuário.
> 
> - Exemplo ilustrativo: se o usuário listar "salmão", você poderia sugerir um preparo como "salmão unilateral" como destaque, em vez de apenas "salmão grelhado"
> - Exemplo ilustrativo: se a lista tiver apenas arroz, feijão e ovo, a receita destaque poderia ser um "arroz de forno gratinado com ovo pochê"

## INSTRUÇÕES
{dynamic_instructions}

## FORMATO DE SAÍDA
Retorne um JSON com a chave 'receitas', onde cada receita contém:
- nome_do_prato: string
- tempo_preparo: string (ex: "30 minutos")
- porcoes: número de porções
- ingredientes_usados: lista de strings com quantidades
- modo_de_preparo: lista de strings (passos numerados)
- descricao_imagem: string (ver regras abaixo)
- tipo_receita: string ("destaque" ou "pratica")

## REGRAS PARA descricao_imagem
A descrição deve conter APENAS elementos visíveis no prato final:
1. Liste os ingredientes principais que APARECEM no prato pronto
2. Descreva a apresentação visual (cores, texturas, disposição)
3. NÃO inclua ingredientes que foram usados mas não são visíveis (ex: óleo, sal)
4. NÃO adicione decorações que não estão nos ingredientes (ex: coentro se não tem na receita)
5. Formato: "[Descrição visual do prato com ingredientes visíveis]. Fotografia profissional de comida, luz natural, estilo gourmet."
"""
```

**1.2 Lógica de Escala Dinâmica**

Criar função para calcular número de receitas:

```python
def _calculate_recipe_count(self, ingredients: list[str]) -> tuple[int, str]:
    """
    Retorna (num_receitas, contexto) baseado no volume de ingredientes.
    """
    count = len(ingredients)
    
    if count <= 5:
        return (2, "compra rápida - foco em praticidade")
    elif count <= 15:
        return (4, "compra média - variedade moderada")
    elif count <= 30:
        return (8, "compra grande - explore combinações criativas")
    else:
        return (12, "compra do mês - cardápio semanal completo")
```

**1.3 Refatorar `generate_recipes` para usar escala**

```python
def generate_recipes(self, ingredients: list[str]):
    num_recipes, context = self._calculate_recipe_count(ingredients)
    
    dynamic_instructions = f"""
Crie exatamente {num_recipes} receitas para esta {context}.
Priorize:
- Diversidade de refeições (café/almoço/jantar/lanche)
- Aproveitamento máximo dos ingredientes listados
- Receitas que combinem múltiplos itens da lista
"""
    
    system_prompt = CHEF_SYSTEM_PROMPT.format(dynamic_instructions=dynamic_instructions)
    # ... resto da implementação
```

---

### Componente 2: AI Orchestrator - Otimização de Prompts de Imagem

#### [MODIFY] [ai_orchestrator.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/services/ai_orchestrator.py)

**2.1 Validação e Enriquecimento do Prompt de Imagem**

Atualizar o método `generate_recipes_with_images` para usar apenas a `descricao_imagem` gerada pelo Groq (já seguindo as regras do prompt):

```python
def generate_recipes_with_images(self, ingredients: list[str]) -> dict:
    # Step 1: Generate Recipes (Groq já retorna descricao_imagem otimizada)
    recipes_data = groq_service.generate_recipes(ingredients)
    
    if "receitas" in recipes_data:
        for recipe in recipes_data["receitas"]:
            # Usar diretamente a descrição do Groq (já validada pelo prompt)
            image_description = recipe.get("descricao_imagem", "")
            
            if image_description:
                # Já vem formatada com estilo fotográfico
                image_url = pollinations_service.get_image_url(image_description)
            else:
                # Fallback: construir descrição básica
                dish_name = recipe.get("nome_do_prato", "Prato brasileiro")
                ingredients_used = recipe.get("ingredientes_usados", [])[:5]
                fallback_desc = f"{dish_name} com {', '.join(ingredients_used)}. Fotografia profissional de comida brasileira."
                image_url = pollinations_service.get_image_url(fallback_desc)
            
            recipe["image_url"] = image_url
    
    return recipes_data
```

---

### Componente 3: Documentação de Prompts

#### [NEW] [prompts_IA.md](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/docs/engenharia_prompt/prompts_IA.md)

Documentar todos os prompts utilizados pelo sistema:

```markdown
# Prompts de IA - Já Comprei

## 1. Chef Brasileiro (Geração de Receitas)
**Arquivo:** `groq_service.py` → `CHEF_SYSTEM_PROMPT`
**Modelo:** Llama 3.3 70B (Heavy) / Fallback: 3.1 8B (Fast)

### Características
- Contexto cultural brasileiro/paulista
- Escala dinâmica baseada em volume de ingredientes
- Geração de descrição de imagem integrada

### Regras de Contextualização
[Documentar as presunções culturais]

## 2. OCR Vision (Extração de Ingredientes)
**Arquivo:** `groq_service.py` → `extract_text_vision`
**Modelo:** Llama 4 Maverick

[Referência: Otimizando OCR com Engenharia de Prompt.md]
```

---

### Componente 4: Validação Pydantic e Tratamento de Exceções

#### [NEW] [schemas.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/schemas.py)

Criar schemas Pydantic para validar a resposta do Groq:

```python
from pydantic import BaseModel, Field
from typing import Literal

class Receita(BaseModel):
    nome_do_prato: str
    tempo_preparo: str
    porcoes: int = Field(default=2, ge=1)
    ingredientes_usados: list[str]
    modo_de_preparo: list[str]
    descricao_imagem: str
    tipo_receita: Literal["destaque", "pratica"]

class ReceitasResponse(BaseModel):
    receitas: list[Receita]
```

#### [MODIFY] [groq_service.py](file:///c:/Users/emanu/Documents/Projetos/Já%20comprei/backend-ja-comprei/app/services/groq_service.py)

Integrar validação Pydantic com fallback:

```python
from app.schemas import ReceitasResponse
from pydantic import ValidationError

def generate_recipes(self, ingredients: list[str]) -> dict:
    # ... gerar resposta do Groq ...
    
    content = response.choices[0].message.content
    
    # Tentar parse + validação Pydantic
    try:
        validated = ReceitasResponse.model_validate_json(content)
        return validated.model_dump()
    except ValidationError as e:
        logger.warning(f"Pydantic validation failed, attempting sanitization: {e}")
        # Fallback: sanitização existente
        raw_data = self._sanitize_and_parse_json(content)
        # Tentar validar o dict sanitizado
        try:
            validated = ReceitasResponse.model_validate(raw_data)
            return validated.model_dump()
        except ValidationError as e2:
            logger.error(f"Validation failed after sanitization: {e2}")
            # Retornar raw como último recurso
            return raw_data
```

**Benefícios:**
- Garante que `tipo_receita` seja exatamente `"destaque"` ou `"pratica"`
- Campos obrigatórios validados antes de chegar ao Pollinations
- Valores default (ex: `porcoes: 2`) se o Groq omitir
- Logs detalhados para debug

---

## Verificação Plan

### Testes Automatizados
Não existem testes unitários configurados no backend atualmente. Recomendação:

1.  **Teste manual via API** - Chamar o endpoint de receitas com diferentes volumes:
    -   3 ingredientes → esperar 2 receitas
    -   10 ingredientes → esperar 4 receitas
    -   25 ingredientes → esperar 8 receitas

### Verificação Manual

**1. Escala de Receitas:**
```bash
# Iniciar backend
cd backend-ja-comprei
uvicorn main:app --reload

# Testar via curl ou Postman
POST /v1/recipes/generate
Body: { "ingredients": ["arroz", "feijão", "linguiça"] }
# Esperado: 2 receitas

POST /v1/recipes/generate  
Body: { "ingredients": ["arroz", "feijão", "carne", "batata", "cenoura", "cebola", "alho", "tomate", "pimentão", "ovo"] }
# Esperado: 4 receitas
```

**2. Contextualização Brasileira:**
- Enviar "pão" → verificar se receita menciona "pão francês"
- Enviar "mortadela" → verificar se usa como fatiada, não peça

**3. Sensibilidade Culinária:**
- Verificar que há pelo menos 1 receita com `tipo_receita: "destaque"`
- Enviar lista com "salmão" → receita destaque deve usar salmão de forma elaborada
- Enviar lista só com básicos → receita destaque deve ter técnica diferenciada

**4. Descrição de Imagem:**
- Verificar que `descricao_imagem` contém apenas ingredientes visíveis
- Confirmar ausência de decorações genéricas (ex: "coentro" se não está na receita)

---

## Checklist de Implementação

- [x] 1.1 Criar constante `CHEF_SYSTEM_PROMPT` com:
  - [x] Contexto cultural brasileiro
  - [x] Sensibilidade culinária (receita destaque + práticas)
  - [x] Campo `tipo_receita` no schema de saída
- [x] 1.2 Implementar `_calculate_recipe_count()` 
- [x] 1.3 Refatorar `generate_recipes()` para usar escala dinâmica
- [x] 2.1 Atualizar `generate_recipes_with_images()` para usar descrição do Groq
- [x] 3.1 Documentar prompts em `prompts_IA.md`
- [x] 4.1 Criar `app/schemas.py` com `Receita` e `ReceitasResponse`
- [x] 4.2 Integrar validação Pydantic em `generate_recipes()`
- [x] 5.0 Testar manualmente:
  - [x] Escala de receitas por volume
  - [x] Presunções culturais brasileiras
  - [x] Mix de receitas (destaque + práticas)
  - [x] Coerência das imagens geradas
  - [x] Validação Pydantic funcionando (campo inválido → fallback)
