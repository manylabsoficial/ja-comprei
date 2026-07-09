import sys
import os
import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure app is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# 1. Define dummy settings for tests
from app.core.config import get_settings
settings = get_settings()
settings.DEEPSEEK_API_KEY = "dummy_deepseek"
settings.GROQ_API_KEY = "dummy_groq"
settings.GEMINI_API_KEY = "dummy_gemini"
settings.OPENROUTER_API_KEY = "dummy_openrouter"

from app.services.recipe_graph import recipe_graph

# Mock responses
MALFORMED_JSON = '{"receitas": [{"nome_do_prato": "Gourmet Dish", "tempo_preparo": "30 min", "porcoes": 2,'  # Broken EOF

VALID_JSON_3_RECIPES = """
{
  "receitas": [
    {
      "nome_do_prato": "Frango ao Azeite de Alecrim com Purê Rústico",
      "tempo_preparo": "40 minutos",
      "porcoes": 3,
      "ingredientes_usados": ["400g de peito de frango", "3 batatas", "1 colher de manteiga"],
      "modo_de_preparo": [
        "Descasque e cozinhe as batatas até amolecerem.",
        "Grelhe o frango com azeite e alecrim na frigideira quente.",
        "Esprema as batatas e misture com manteiga e sal.",
        "Monte os pratos dispondo o frango ao lado do purê."
      ],
      "visual_tag": "Seared chicken breast slices next to potato purée on a dark plate, steaming, microgreens garnish",
      "tipo_receita": "destaque"
    },
    {
      "nome_do_prato": "Batata Crocante Especial",
      "tempo_preparo": "20 minutos",
      "porcoes": 2,
      "ingredientes_usados": ["2 batatas médias", "1 colher de azeite"],
      "modo_de_preparo": [
        "Corte as batatas em cubos pequenos.",
        "Seque bem com papel toalha.",
        "Doure na frigideira com azeite bem quente por 10 minutos.",
        "Sirva crocante com pitada de sal."
      ],
      "visual_tag": "Golden crispy potato cubes in a ceramic bowl, steaming hot, macro photography",
      "tipo_receita": "pratica"
    }
  ]
}
"""

class TestRecipeGraph(unittest.IsolatedAsyncioTestCase):

    @patch("app.services.recipe_graph.ChatOpenAI")
    @patch("app.services.recipe_graph.image_service.generate_recipe_image")
    async def test_successful_flow_on_first_try(self, mock_image_gen, mock_chat_openai):
        print("\n[TEST] Verifying successful flow on first try...")
        
        # Setup mocks
        mock_image_gen.return_value = "data:image/png;base64,image_base64_string"
        
        # Mock LLM Response
        mock_model_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.content = VALID_JSON_3_RECIPES
        mock_model_instance.ainvoke = AsyncMock(return_value=mock_response)
        mock_chat_openai.return_value = mock_model_instance

        # Execute Graph
        inputs = {
            "ingredients": ["frango", "batata"],
            "user_id": None
        }
        
        result = await recipe_graph.ainvoke(inputs)
        
        self.assertTrue(result["is_valid"])
        self.assertEqual(result["attempt_count"], 0)
        self.assertEqual(result["provider"], "deepseek")
        self.assertEqual(len(result["recipes_data"]["receitas"]), 2)
        
        # Verify parallel images mapped
        self.assertEqual(result["recipe_images"][0], "data:image/png;base64,image_base64_string")
        self.assertEqual(result["recipe_images"][1], "data:image/png;base64,image_base64_string")
        
        # Check image injection
        self.assertEqual(result["recipes_data"]["receitas"][0]["image_url"], "data:image/png;base64,image_base64_string")
        
        print("[SUCCESS] First try flow verified.")

    @patch("app.services.recipe_graph.ChatOpenAI")
    @patch("app.services.recipe_graph.image_service.generate_recipe_image")
    async def test_self_correction_loop(self, mock_image_gen, mock_chat_openai):
        print("\n[TEST] Verifying Self-Correction (Reflexion) Loop...")
        
        mock_image_gen.return_value = "data:image/png;base64,image_base64_string"
        
        mock_model_instance = MagicMock()
        mock_malformed = MagicMock(content=MALFORMED_JSON)
        mock_valid = MagicMock(content=VALID_JSON_3_RECIPES)
        
        # LLM returns malformed first, then valid corrected JSON
        mock_model_instance.ainvoke = AsyncMock(side_effect=[mock_malformed, mock_valid])
        mock_chat_openai.return_value = mock_model_instance

        inputs = {
            "ingredients": ["frango", "batata"],
            "user_id": None
        }
        
        result = await recipe_graph.ainvoke(inputs)
        
        # Verify it went through 1 correction attempt and succeeded
        self.assertTrue(result["is_valid"])
        self.assertEqual(result["attempt_count"], 1)
        self.assertEqual(result["provider"], "deepseek")
        self.assertEqual(len(result["recipes_data"]["receitas"]), 2)
        
        print("[SUCCESS] Self-Correction loop successfully verified.")

    @patch("app.services.recipe_graph.ChatOpenAI")
    @patch("app.services.recipe_graph.ChatGroq")
    @patch("app.services.recipe_graph.image_service.generate_recipe_image")
    async def test_fallback_escalation_to_groq(self, mock_image_gen, mock_chat_groq, mock_chat_openai):
        print("\n[TEST] Verifying escalation fallback to Groq...")
        
        mock_image_gen.return_value = "data:image/png;base64,image_base64_string"
        
        # DeepSeek consistently returns malformed JSON
        mock_ds_instance = MagicMock()
        mock_ds_malformed = MagicMock(content=MALFORMED_JSON)
        mock_ds_instance.ainvoke = AsyncMock(return_value=mock_ds_malformed)
        mock_chat_openai.return_value = mock_ds_instance
        
        # Groq returns valid JSON
        mock_groq_instance = MagicMock()
        mock_groq_valid = MagicMock(content=VALID_JSON_3_RECIPES)
        mock_groq_instance.ainvoke = AsyncMock(return_value=mock_groq_valid)
        mock_chat_groq.return_value = mock_groq_instance

        inputs = {
            "ingredients": ["frango", "batata"],
            "user_id": None
        }
        
        result = await recipe_graph.ainvoke(inputs)
        
        # Verify it escalated to Groq and succeeded
        self.assertTrue(result["is_valid"])
        self.assertEqual(result["provider"], "groq")
        self.assertEqual(len(result["recipes_data"]["receitas"]), 2)
        
        print("[SUCCESS] Fallback escalation verified.")

if __name__ == "__main__":
    asyncio.run(unittest.main())
