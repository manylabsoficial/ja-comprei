import logging
import json
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

class AIOrchestrator:
    """
    Orchestrates calls across AI providers (DeepSeek, Groq) and Image Gen (Pollinations).
    Multi-provider with automatic fallback for resilience.
    """

    async def process_receipt_image(self, image_buffer: bytes) -> dict:
        """
        Flow:
        1. Pollinations Vision -> Extract raw text from receipt image.
        2. Groq -> Parse raw text into structured JSON ingredients.
        """
        try:
            # Step 1: Encode Image
            # Need to import utils here or at top
            from app.utils.image_utils import encode_image_to_base64
            
            # Assuming bytes come as JPEG or detecting mimetype would be better, but defaulting to jpeg for base64 header
            base64_image = encode_image_to_base64(image_buffer)

            # Step 2: Vision (Groq Scout)
            logger.info("Sending image to Groq Vision (Scout)...")
            structured_data = groq_service.extract_text_vision(base64_image)
            
            logger.info(f"Groq Extraction Result: {json.dumps(structured_data, ensure_ascii=False)}")
            return structured_data

        except Exception as e:
            logger.error(f"Orchestrator Receipt Error: {e}")
            raise e

    async def generate_recipes_with_images(self, ingredients: list[str], user_id: str = None, run_id: str | None = None) -> dict:
        """
        Runs the LangGraph State Machine to suggest creative recipes with images.
        Uses Roteador de Imagens Tríplice and self-correction.
        """
        try:
            from app.services.recipe_graph import recipe_graph
            
            inputs = {
                "ingredients": ingredients,
                "user_id": user_id,
                "run_id": run_id,
            }
            
            logger.info("Orchestrator: Invoking LangGraph Recipe Graph...")
            result = await recipe_graph.ainvoke(inputs)
            
            if not result.get("is_valid"):
                # AC-04: Raise exception when all models and fallbacks are exhausted
                raise RuntimeError("Falha crítica ao estruturar receitas com IA. Todos os modelos falharam.")
                
            return result["recipes_data"]

        except Exception as e:
            logger.error(f"Orchestrator Recipe Error: {e}")
            raise e

ai_orchestrator = AIOrchestrator()

