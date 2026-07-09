import json
import logging
from typing import Optional
from collections import Counter
from app.services.groq_service import groq_service
from app.schemas import RecipeMetadata
from app.core.config import get_settings
from app.prompts.metadata_v1 import METADATA_SYSTEM_PROMPT, METADATA_EXTRACTION_PROMPT

settings = get_settings()
logger = logging.getLogger(__name__)

class MetadataExtractor:
    def __init__(self):
        pass

    async def extract_from_recipe(self, recipe_data: dict) -> RecipeMetadata:
        """
        Calls Groq to analyze a recipe and extract structured metadata.
        Now uses versioned prompt with system-level instructions.
        """
        import json as json_module
        recipe_json = json_module.dumps(recipe_data, ensure_ascii=False)
        
        messages = [
            {"role": "system", "content": METADATA_SYSTEM_PROMPT},
            {"role": "user", "content": f"Analise esta receita e extraia os metadados:\n\n{recipe_json}"}
        ]
        
        try:
            response = groq_service.execute_safe(
                messages,
                primary_model=settings.MODEL_FAST,
                json_mode=True
            )
            
            content = response.choices[0].message.content
            
            # Normalize before Pydantic validation
            content_normalized = self._normalize_metadata_text(content)
            
            return RecipeMetadata.model_validate_json(content_normalized)
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {e}")
            raise e

    def _normalize_metadata_text(self, content: str) -> str:
        """
        Normalizes common LLM output variations before Pydantic validation.
        Handles: accented Portuguese, English translations, case differences.
        """
        import json as json_module
        import re
        
        # Try to parse first
        try:
            data = json_module.loads(content)
        except json_module.JSONDecodeError:
            # Try extracting from markdown/code blocks
            match = re.search(r'(\{.*\})', content, re.DOTALL)
            if match:
                data = json_module.loads(match.group(1))
            else:
                return content
        
        # Normalize nivel_dificuldade
        dificuldade_map = {
            "fácil": "facil", "fã¡cil": "facil",
            "easy": "facil", "simples": "facil",
            "médio": "medio", "mã©dio": "medio", "médio": "medio",
            "medium": "medio", "moderado": "medio", "intermediário": "medio",
            "difícil": "dificil", "dificil": "dificil", "dificil": "dificil",
            "hard": "dificil", "avançado": "dificil", "complexo": "dificil",
        }
        if "nivel_dificuldade" in data:
            raw = data["nivel_dificuldade"].lower().strip()
            data["nivel_dificuldade"] = dificuldade_map.get(raw, "medio")
        
        # Normalize proteina_principal
        proteina_map = {
            "chicken": "frango", "poultry": "frango",
            "beef": "carne_bovina", "bovine": "carne_bovina",
            "fish": "peixe", "seafood": "peixe",
            "pork": "porco", "pig": "porco",
            "eggs": "ovos", "egg": "ovos",
            "vegetarian": "vegetariano",
            "mixed": "misto", "mix": "misto",
        }
        if "proteina_principal" in data:
            raw = data["proteina_principal"].lower().strip()
            data["proteina_principal"] = proteina_map.get(raw, raw)
        
        # Normalize custo_estimado
        custo_map = {
            "low": "baixo", "cheap": "baixo",
            "medium": "medio", "average": "medio",
            "high": "alto", "expensive": "alto",
        }
        if "custo_estimado" in data:
            raw = data["custo_estimado"].lower().strip()
            data["custo_estimado"] = custo_map.get(raw, raw)
        
        # Normalize ocasiao
        ocasiao_map = {
            "daily": "dia_a_dia", "everyday": "dia_a_dia", "casual": "dia_a_dia",
            "special": "especial", "special occasion": "especial",
            "party": "festa", "celebration": "festa",
        }
        if "ocasiao" in data:
            raw = data["ocasiao"].lower().strip()
            data["ocasiao"] = ocasiao_map.get(raw, raw)
        
        # Normalize tipo_refeicao
        refeicao_map = {
            "breakfast": "cafe_manha", "café da manhã": "cafe_manha",
            "lunch": "almoco", "almoço": "almoco",
            "dinner": "jantar",
            "snack": "lanche",
            "dessert": "sobremesa",
        }
        if "tipo_refeicao" in data:
            raw = data["tipo_refeicao"].lower().strip()
            data["tipo_refeicao"] = refeicao_map.get(raw, raw)
        
        return json_module.dumps(data, ensure_ascii=False)

    def get_user_preferences_summary(self, metadata_list: list[dict]) -> Optional[str]:
        """
        Aggregates a list of metadata records into a descriptive summary for the meta-prompt.
        """
        if not metadata_list:
            return None
            
        total = len(metadata_list)
        
        # Aggregation with weighted recency
        def get_top(items_list):
            counts = Counter(items_list)
            return ", ".join([f"{k} ({v*100/total:.0f}%)" for k, v in counts.most_common(3)])

        proteinas = [m['proteina_principal'] for m in metadata_list]
        metodos = []
        for m in metadata_list:
            metodos.extend(m.get('metodo_cocao', []))
        
        sabores = []
        for m in metadata_list:
            sabores.extend(m.get('perfil_sabor', []))
            
        complexidade = Counter([m['nivel_dificuldade'] for m in metadata_list]).most_common(1)[0][0]
        custo = Counter([m['custo_estimado'] for m in metadata_list]).most_common(1)[0][0]
        
        restricoes = []
        for m in metadata_list:
            if m.get('restricoes_detectadas'):
                restricoes.extend(m['restricoes_detectadas'])
        
        summary = f"""Com base no histórico de {total} receitas salvas:
- **Proteínas Favoritas**: {get_top(proteinas)}
- **Métodos Preferidos**: {get_top(metodos)}
- **Perfil de Sabor Dominante**: {get_top(sabores)}
- **Nível de Complexidade**: {complexidade}
- **Faixa de Custo**: {custo}
- **Tipos de Refeição comuns**: {", ".join([f"{k} ({v})" for k, v in Counter([m['tipo_refeicao'] for m in metadata_list]).most_common(2)])}
"""
        if restricoes:
            summary += f"- **Sensibilidades/Restrições comuns**: {get_top(restricoes)}\n"
            
        return summary

metadata_extractor = MetadataExtractor()
