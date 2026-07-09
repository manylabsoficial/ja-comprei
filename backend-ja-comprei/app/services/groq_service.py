import groq
from app.core.config import get_settings
import logging
import json

settings = get_settings()
logger = logging.getLogger(__name__)

from app.schemas import ReceitasResponse, VisionResponse
from app.prompts.ocr_vision_v1 import VISION_SYSTEM_PROMPT
from app.prompts.parse_ingredients_v1 import PARSE_SYSTEM_PROMPT
from pydantic import ValidationError

from app.prompts.chef_v1 import CHEF_SYSTEM_PROMPT

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
        from app.utils.sanitize import sanitize_user_text
        text = sanitize_user_text(text)

        messages = [
            {"role": "system", "content": PARSE_SYSTEM_PROMPT},
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
        Uses Groq Vision (Scout) to extract ingredients directly from an image.
        Classifies items into categories for safety filtering.
        """
        messages = [
            {
                "role": "user", 
                "content": [
                    {
                        "type": "text", 
                        "text": VISION_SYSTEM_PROMPT
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

    def generate_recipes(self, ingredients: list[str], user_preferences: str = None) -> dict:
        """
        Generates creative recipes using the HEAVY model, falling back to FAST if needed.
        Uses dynamic scaling and Pydantic validation.
        """
        num_recipes, context = self._calculate_recipe_count(ingredients)
        from app.utils.sanitize import sanitize_ingredient_list
        sanitized_ingredients = sanitize_ingredient_list(ingredients)
        ingredients_str = ", ".join(sanitized_ingredients)
        
        # Adaptive balancing logic (Exploitation vs Exploration)
        if num_recipes <= 2:
            num_exploration = 1
        elif num_recipes <= 4:
            num_exploration = 1
        elif num_recipes <= 8:
            num_exploration = 3
        else:
            num_exploration = 5
            
        num_preferences = num_recipes - num_exploration

        dynamic_instructions = f"""
Crie exatamente {num_recipes} receitas para esta {context}.

## REGRAS DE BALANCEAMENTO (Exploitation vs Exploration)
- **Receitas Alinhadas ({num_preferences}):** Devem refletir fortemente as preferências históricas do usuário.
- **Receitas Exploratórias ({num_exploration}):** Devem introduzir NOVIDADES (técnicas, proteínas ou estilos que o usuário NÃO costuma salvar).
- Identifique receitas exploratórias marcando-as internamente (o usuário verá a variedade através dos tipos de pratos).

Priorize:
- Diversidade de refeições (café/almoço/jantar/lanche)
- Aproveitamento máximo dos ingredientes listados
- Receitas que combinem múltiplos itens da lista
"""
        
        if user_preferences:
            dynamic_instructions += f"\n## PREFERÊNCIAS DO USUÁRIO (Memória Evolutiva)\n{user_preferences}\n"
            dynamic_instructions += "\nDIRETRIZ: Priorize receitas que combinem com o perfil acima.\n"
        
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
