import logging
import random
from urllib.parse import quote
from app.core.config import get_settings

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


class PollinationsService:
    """
    Handles image generation using Pollinations.ai with Studio Ghibli style.
    Supports meal-type-specific style variations for visual diversity.
    """

    def __init__(self):
        self.base_url_gen = "https://gen.pollinations.ai"

    def get_ghibli_url(
        self,
        visual_tag: str,
        meal_type: str = "default",
        aspect: str = "1:1"
    ) -> str:
        """
        Generates a Pollinations URL for a Studio Ghibli style food illustration.

        Args:
            visual_tag: English description of the dish (e.g., "Steak with fried egg")
            meal_type: One of "cafe_manha", "almoco", "jantar", "lanche", "sobremesa", "default"
            aspect: Aspect ratio — "1:1" for cards, "16:9" for hero images

        Returns:
            str: The authenticated URL for the image.
        """
        style = STYLE_VARIATIONS.get(meal_type, STYLE_VARIATIONS["default"])

        full_prompt = f"{visual_tag}. {style}"
        encoded_prompt = quote(full_prompt)

        seed = random.randint(1, 999999)

        width = 1024
        height = 1024

        url = f"{self.base_url_gen}/image/{encoded_prompt}"
        url += f"?model={settings.POLLINATIONS_MODEL}"
        url += f"&width={width}&height={height}"
        url += f"&nologo=true"
        url += f"&enhance=true"
        url += f"&seed={seed}"
        url += f"&negative={quote(NEGATIVE_PROMPT)}"

        if settings.POLLINATIONS_API_KEY:
            url += f"&key={settings.POLLINATIONS_API_KEY}"

        logger.info(
            f"Image URL generated: meal_type={meal_type}, aspect={aspect}, "
            f"seed={seed}, tag='{visual_tag[:60]}...'"
        )

        return url


# Singleton instance
pollinations_service = PollinationsService()
