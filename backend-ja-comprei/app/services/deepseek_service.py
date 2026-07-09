from openai import OpenAI
from app.core.config import get_settings
import logging
import json

settings = get_settings()
logger = logging.getLogger(__name__)


class DeepSeekService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL
        )

    def generate_recipes(self, ingredients: list[str], user_preferences: str = None) -> dict:
        from app.services.groq_service import CHEF_SYSTEM_PROMPT, groq_service
        from app.schemas import ReceitasResponse
        from pydantic import ValidationError

        num_recipes, context = groq_service._calculate_recipe_count(ingredients)
        ingredients_str = ", ".join(ingredients)

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

        try:
            response = self.client.chat.completions.create(
                model=settings.DEEPSEEK_MODEL_FLASH,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Ingredientes: {ingredients_str}"}
                ],
                response_format={"type": "json_object"},
                max_tokens=32000,
                temperature=0.7
            )

            content = response.choices[0].message.content

            try:
                validated = ReceitasResponse.model_validate_json(content)
                return validated.model_dump()
            except ValidationError as e:
                logger.warning(f"DeepSeek validation failed, attempting sanitization: {e}")
                raw_data = groq_service._sanitize_and_parse_json(content)
                validated = ReceitasResponse.model_validate(raw_data)
                return validated.model_dump()

        except Exception as e:
            logger.error(f"DeepSeek API Error: {e}")
            raise e


deepseek_service = DeepSeekService()
