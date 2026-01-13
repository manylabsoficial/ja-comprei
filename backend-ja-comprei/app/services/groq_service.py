import groq
from app.core.config import get_settings
import logging
import json

settings = get_settings()
logger = logging.getLogger(__name__)

from app.schemas import ReceitasResponse, VisionResponse
from pydantic import ValidationError

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
- Arredondamento seguro: se a quantidade for ambígua, assuma o padrão para 2 pessoas.

## SEGURANÇA ALIMENTAR (CRÍTICO)
Antes de gerar qualquer receita, revise rigorosamente a lista de ingredientes:
1. IDENTIFIQUE itens não comestíveis (ex: sabão, detergente, ração, shampoo, pilhas).
2. IGNORE-OS completamente. Não inclua em nenhuma receita, nem como decoração.
3. Se a lista contiver APENAS itens não comestíveis, retorne uma lista de receitas vazia ou uma mensagem educada no nome do prato.
4. JAMAIS sugerir o consumo de produtos de limpeza ou higiene.

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

class GroqService:
    def __init__(self):
        self.client = groq.Groq(api_key=settings.GROQ_API_KEY)

    def _get_completion(self, messages, model, json_mode=False, **kwargs):
        params = {
            "messages": messages,
            "model": model,
            **kwargs
        }
        if json_mode:
            params["response_format"] = {"type": "json_object"}
            
        return self.client.chat.completions.create(**params)

    def execute_safe(self, messages: list, primary_model: str, fallback_model: str = None, json_mode=False, **kwargs):
        """
        Executes a chat completion request with automatic fallback on Rate Limit Error (429).
        """
        try:
            return self._get_completion(messages, primary_model, json_mode, **kwargs)
        except groq.RateLimitError as e:
            if fallback_model:
                logger.warning(f"Rate limit hit for {primary_model}. Switching to {fallback_model}. Error: {e}")
                return self._get_completion(messages, fallback_model, json_mode, **kwargs)
            else:
                logger.error(f"Rate limit hit for {primary_model} and no fallback provided.")
                raise e
        except Exception as e:
            logger.error(f"Groq API Error: {e}")
            raise e

    def transcribe_audio(self, file_buffer, filename="audio.m4a"):
        try:
            return self.client.audio.transcriptions.create(
                file=(filename, file_buffer),
                model=settings.MODEL_AUDIO,
                response_format="json"
            )
        except Exception as e:
            logger.error(f"Transcription Error: {e}")
            raise e

    def parse_ingredients(self, text: str):
        """
        Extracts structured ingredient data from raw text using the FAST model.
        """
        messages = [
            {"role": "system", "content": "You are an expert parser. Extract ingredients from the input text into a JSON object with key 'ingredientes' containing a list of objects with 'item' and 'quantidade'. Output pure JSON."},
            {"role": "user", "content": text}
        ]
        
        response = self.execute_safe(
            messages, 
            primary_model=settings.MODEL_FAST, 
            fallback_model=None, # Fast model is the baseline, no fallback needed usually
            json_mode=True
        )
        return json.loads(response.choices[0].message.content)

    def extract_text_vision(self, image_base64: str):
        """
        Uses Groq Vision (Maverick) to extract ingredients directly from an image.
        Classifies items into categories for safety filtering.
        """
        messages = [
            {
                "role": "user", 
                "content": [
                    {
                        "type": "text", 
                        "text": (
                            "Analise esta imagem de nota fiscal ou lista de compras. "
                            "Extraia os itens, quantidades e CLASSIFIQUE cada item. "
                            "Categorias permitidas: 'alimento', 'limpeza', 'higiene', 'outros'. "
                            "RETORNE APENAS UM JSON PURO. NÃO use Markdown. "
                            "Formato: {'ingredientes': [{'item': 'nome', 'quantidade': 'qtd', 'categoria': 'cat'}]}"
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_base64
                        }
                    }
                ]
            }
        ]

        try:
            response = self.execute_safe(
                messages,
                primary_model=settings.MODEL_VISION,
                json_mode=True 
            )
            
            content = response.choices[0].message.content
            logger.info(f"Groq Vision Raw Output: {content}")

            # Sanitização inicial
            raw_data = self._sanitize_and_parse_json(content)
            
            # Validação Pydantic
            try:
                validated = VisionResponse.model_validate(raw_data)
                return validated.model_dump()
            except ValidationError as e:
                logger.warning(f"Vision validation failed, returning raw sanitized data: {e}")
                # Fallback: tentar adicionar categoria default se faltar
                if 'ingredientes' in raw_data:
                    for item in raw_data['ingredientes']:
                        if 'categoria' not in item:
                            item['categoria'] = 'outros' # Default safe
                return raw_data

        except Exception as e:
            logger.error(f"Groq Vision Error: {e}")
            raise e

    def _sanitize_and_parse_json(self, content: str):
        """
        Cleans the LLM output to extract just the JSON part, handling markdown fences and conversational text.
        """
        import re
        
        try:
            # 1. Try parsing directly
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # 2. Extract content between ```json ... ``` or just { ... }
        # Regex to find the first outer { ... } block
        json_match = re.search(r"(\{.*\})", content, re.DOTALL)
        
        if json_match:
            try:
                json_str = json_match.group(1)
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        logger.error(f"Failed to parse JSON from content: {content}")
        raise ValueError("Falha ao extrair JSON da resposta do modelo.")

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

    def generate_recipes(self, ingredients: list[str]) -> dict:
        """
        Generates creative recipes using the HEAVY model, falling back to FAST if needed.
        Uses dynamic scaling and Pydantic validation.
        """
        num_recipes, context = self._calculate_recipe_count(ingredients)
        ingredients_str = ", ".join(ingredients)
        
        dynamic_instructions = f"""
Crie exatamente {num_recipes} receitas para esta {context}.
Priorize:
- Diversidade de refeições (café/almoço/jantar/lanche)
- Aproveitamento máximo dos ingredientes listados
- Receitas que combinem múltiplos itens da lista
"""
        
        system_prompt = CHEF_SYSTEM_PROMPT.format(dynamic_instructions=dynamic_instructions)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Ingredientes: {ingredients_str}"}
        ]
        
        response = self.execute_safe(
            messages,
            primary_model=settings.MODEL_HEAVY,
            fallback_model=settings.MODEL_FAST,
            json_mode=True
        )
        
        content = response.choices[0].message.content
        
        # Tentar parse + validação Pydantic
        try:
            validated = ReceitasResponse.model_validate_json(content)
            return validated.model_dump()
        except ValidationError as e:
            logger.warning(f"Pydantic validation failed, attempting sanitization: {e}")
            # Fallback: sanitização existente
            try:
                raw_data = self._sanitize_and_parse_json(content)
                # Tentar validar o dict sanitizado
                validated = ReceitasResponse.model_validate(raw_data)
                return validated.model_dump()
            except (ValidationError, ValueError) as e2:
                logger.error(f"Validation failed after sanitization: {e2}")
                # Retornar raw como último recurso se possível, ou raise
                if 'raw_data' in locals():
                    return raw_data
                raise ValueError("Falha crítica na validação das receitas.")

groq_service = GroqService()
