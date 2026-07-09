import logging
import random
import httpx
from urllib.parse import quote
from app.core.config import get_settings
from app.services.pollinations_service import pollinations_service

settings = get_settings()
logger = logging.getLogger(__name__)

# Style variations by meal type — all anchored in "Studio Ghibli style"
STYLE_VARIATIONS = {
    "cafe_manha": (
        "Morning light streaming through window, steam rising from warm food, "
        "soft golden tones, cozy kitchen atmosphere, Studio Ghibli style"
    ),
    "almoco": (
        "Midday table by the window, vibrant natural daylight, colorful fresh ingredients, "
        "home-cooked meal presentation, Studio Ghibli style"
    ),
    "jantar": (
        "Evening ambiance, warm candlelight glow, rich comforting shadows, "
        "steam visible in dim light, intimate dinner setting, Studio Ghibli style"
    ),
    "lanche": (
        "Afternoon sunlight, delicate pastel tones, casual cozy setup, "
        "hand-drawn texture, soft shadows, Studio Ghibli style"
    ),
    "sobremesa": (
        "Soft dreamy lighting, delicate pastel colors, whimsical presentation, "
        "glistening textures, magical atmosphere, Studio Ghibli style"
    ),
    "default": (
        "Anime food illustration, hand-drawn 2D art, steaming hot, glossy texture, "
        "vibrant colors, delicious, cozy atmosphere, Studio Ghibli style"
    ),
}

# Negative prompt — specific to Ghibli/anime food art
NEGATIVE_PROMPT = (
    "photorealistic, 3d render, CGI, modern anime style, sketch lines, "
    "chibi, deformed, low resolution, blurry, text, watermark, photo, real, "
    "plastic, artificial, dark shadows, western cartoon style"
)

class ImageService:
    """
    Unified Image Service utilizing the Roteador de Imagens Tríplice:
    1. Primary: OpenRouter Image API (Flux Schnell).
    2. Fallback: Google Gemini Image API (Imagen 3 / Nano Banana).
    3. Tertiary: Pollinations AI (as last resort, returning static URL).
    """

    def __init__(self):
        self.openrouter_url = "https://openrouter.ai/api/v1/images"
        self.gemini_image_model = "gemini-2.5-flash-image"

    def _build_full_prompt(self, visual_tag: str, meal_type: str) -> str:
        """
        Builds a detailed prompt with meal-type style context.
        """
        style = STYLE_VARIATIONS.get(meal_type, STYLE_VARIATIONS["default"])
        return f"{visual_tag}. {style}. Negative prompt: {NEGATIVE_PROMPT}"

    async def generate_recipe_image(self, visual_tag: str, meal_type: str = "default") -> str:
        """
        Orchestrates image generation across providers.
        Returns a base64 Data URI or a static URL.
        """
        full_prompt = self._build_full_prompt(visual_tag, meal_type)
        
        # 1. Primary: OpenRouter
        if settings.OPENROUTER_API_KEY:
            try:
                logger.info(f"ImageService: Attempting OpenRouter Image Generation using {settings.OPENROUTER_IMAGE_MODEL}...")
                async with httpx.AsyncClient(timeout=30.0) as client:
                    headers = {
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "model": settings.OPENROUTER_IMAGE_MODEL,
                        "prompt": full_prompt,
                        "aspect_ratio": "1:1",
                        "n": 1
                    }
                    response = await client.post(self.openrouter_url, json=payload, headers=headers)
                    
                    if response.status_code == 200:
                        res_json = response.json()
                        if "data" in res_json and len(res_json["data"]) > 0:
                            image_url = res_json["data"][0]["url"]
                            logger.info("ImageService: OpenRouter succeeded.")
                            return image_url
                        else:
                            logger.warning(f"ImageService: OpenRouter empty response data: {res_json}")
                    else:
                        logger.warning(f"ImageService: OpenRouter failed with code {response.status_code}: {response.text}")
            except Exception as e:
                logger.warning(f"ImageService: OpenRouter raised exception: {e}")

        # 2. Secondary (Fallback): Gemini Image API
        if settings.GEMINI_API_KEY:
            try:
                logger.info(f"ImageService: Falling back to Gemini Image API ({self.gemini_image_model})...")
                async with httpx.AsyncClient(timeout=30.0) as client:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.gemini_image_model}:generateContent?key={settings.GEMINI_API_KEY}"
                    
                    payload = {
                        "contents": [
                            {
                                "parts": [
                                    {
                                        "text": full_prompt
                                    }
                                ]
                            }
                        ],
                        "generationConfig": {
                            "responseMimeType": "image/png"
                        }
                    }
                    response = await client.post(url, json=payload)
                    
                    if response.status_code == 200:
                        res_json = response.json()
                        candidates = res_json.get("candidates", [])
                        if candidates and len(candidates) > 0:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and "inlineData" in parts[0]:
                                mime_type = parts[0]["inlineData"].get("mimeType", "image/png")
                                base64_data = parts[0]["inlineData"].get("data")
                                if base64_data:
                                    logger.info("ImageService: Gemini Image API succeeded.")
                                    return f"data:{mime_type};base64,{base64_data}"
                        
                        logger.warning(f"ImageService: Gemini API returned unexpected structure: {res_json}")
                    else:
                        logger.warning(f"ImageService: Gemini API failed with code {response.status_code}: {response.text}")
            except Exception as e:
                logger.warning(f"ImageService: Gemini API raised exception: {e}")

        # 3. Tertiary (Último Recurso): Pollinations AI (returns static generation URL client-side)
        logger.info("ImageService: Falling back to Pollinations AI (Tertiary)...")
        # Pollinations generates a URL which the client fetches, so we just return the URL format
        return pollinations_service.get_ghibli_url(visual_tag, meal_type=meal_type)

image_service = ImageService()
