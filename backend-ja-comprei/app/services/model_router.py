import logging
from app.core.config import get_settings
from app.schemas import ReceitasResponse
from pydantic import ValidationError

settings = get_settings()
logger = logging.getLogger(__name__)


class ModelRouter:
    """
    Routes AI requests to the appropriate provider with automatic fallback.
    
    Strategy:
    - Recipe generation: DeepSeek V4 Flash (primary) → Groq GPT-OSS 120B (fallback)
    - Parsing: Groq GPT-OSS 20B (no fallback needed for simple tasks)
    - Vision/OCR: Groq Scout 17B
    - Audio: Groq Whisper Turbo
    
    This provides multi-provider resilience: if DeepSeek is down, Groq takes over automatically.
    """
    
    def generate_recipes(self, ingredients: list[str], user_preferences: str = None) -> dict:
        """
        Generate recipes using DeepSeek V4 Flash as primary provider.
        Falls back to Groq GPT-OSS 120B if DeepSeek fails.
        Returns dict validated against ReceitasResponse schema.
        """
        # Try DeepSeek first (better quality, cheaper, larger output)
        try:
            logger.info("Router: Using DeepSeek V4 Flash for recipe generation")
            from app.services.deepseek_service import deepseek_service
            result = deepseek_service.generate_recipes(ingredients, user_preferences)
            logger.info("Router: DeepSeek succeeded")
            return result
        except Exception as deepseek_error:
            logger.warning(f"Router: DeepSeek failed ({deepseek_error}). Falling back to Groq GPT-OSS 120B.")
            
            # Fallback to Groq GPT-OSS 120B
            try:
                from app.services.groq_service import groq_service, CHEF_SYSTEM_PROMPT
                
                num_recipes, context = groq_service._calculate_recipe_count(ingredients)
                
                from app.utils.sanitize import sanitize_ingredient_list
                sanitized_ingredients = sanitize_ingredient_list(ingredients)
                ingredients_str = ", ".join(sanitized_ingredients)
                
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
                
                response = groq_service.execute_safe(
                    messages,
                    primary_model=settings.MODEL_HEAVY_FALLBACK,
                    fallback_model=settings.MODEL_FAST,
                    json_mode=True
                )
                
                content = response.choices[0].message.content
                
                try:
                    validated = ReceitasResponse.model_validate_json(content)
                    return validated.model_dump()
                except ValidationError as e:
                    logger.warning(f"Router fallback validation failed, attempting sanitization: {e}")
                    raw_data = groq_service._sanitize_and_parse_json(content)
                    validated = ReceitasResponse.model_validate(raw_data)
                    return validated.model_dump()
                    
            except Exception as groq_error:
                logger.error(f"Router: Both DeepSeek and Groq failed. DeepSeek: {deepseek_error}, Groq: {groq_error}")
                raise RuntimeError("All AI providers failed for recipe generation") from groq_error


# Singleton instance
model_router = ModelRouter()
