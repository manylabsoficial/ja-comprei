import logging
import time

import httpx

from app.core.config import get_settings
from app.services.pollinations_service import pollinations_service
from app.services.generation_observability import generation_observability

settings = get_settings()
logger = logging.getLogger(__name__)


# Lighting direction by meal type. The product visual identity is editorial food photography.
STYLE_VARIATIONS = {
    "cafe_manha": "soft natural morning side light, warm but color-accurate tones, calm kitchen atmosphere",
    "almoco": "bright natural midday side light, vibrant but realistic ingredients, relaxed home-cooking atmosphere",
    "jantar": "warm evening side light, subtle comforting shadows, intimate but realistic dinner setting",
    "lanche": "gentle afternoon window light, casual refined tabletop, soft natural shadows",
    "sobremesa": "soft dessert lighting, delicate natural color, refined but believable presentation",
    "default": "cinematic natural side light, warm but color-accurate tones, dark neutral tabletop",
}

# OpenRouter Image does not offer a portable negative-prompt parameter, so these
# constraints are included directly in the request text.
NEGATIVE_CONSTRAINTS = (
    "no raw or undercooked meat; no plastic, waxy, melted, rubbery, or artificial food textures; "
    "no oversized protein, distorted grains, duplicated ingredients, or impossible food geometry; "
    "no excessive grill marks, burnt black stripes, neon colors, text, watermark, labels, hands, "
    "utensils blocking the dish, people, unrelated ingredients, anime, illustration, 3D render, CGI, or cartoon styling"
)


class ImageService:
    """Generate recipe photography via OpenRouter, with Pollinations as fallback."""

    def __init__(self):
        self.openrouter_url = "https://openrouter.ai/api/v1/images"

    def _build_full_prompt(
        self,
        visual_tag: str,
        meal_type: str,
        dish_name: str | None = None,
        ingredients: list[str] | None = None,
    ) -> str:
        style = STYLE_VARIATIONS.get(meal_type, STYLE_VARIATIONS["default"])
        title = dish_name or "a Brazilian home-cooked dish"
        ingredient_list = ", ".join(ingredients or []) or "the ingredients naturally required by the dish"

        return f"""
Create a premium editorial food photograph of \"{title}\".

Hero dish: {visual_tag}.
Use only ingredients and preparation details that are plausible for this dish: {ingredient_list}.

Present one realistic, delicious, fully cooked serving on a simple ceramic plate. The food must look genuinely edible,
with natural proportions, believable texture, subtle steam when appropriate, and appetizing but restrained garnish.

Photography direction: high-end Brazilian food magazine editorial; {style}; shallow depth of field; 50mm food photography;
refined home-cooking presentation; focus sharply on the hero dish with a softly blurred background; 4:5 vertical composition.

Strict constraints: {NEGATIVE_CONSTRAINTS}.

The final image must look like an authentic, appetizing photograph of a dish someone would want to cook at home.
""".strip()

    async def generate_recipe_image(
        self,
        visual_tag: str,
        meal_type: str = "default",
        dish_name: str | None = None,
        ingredients: list[str] | None = None,
        run_id: str | None = None,
        recipe_index: int | None = None,
    ) -> str:
        """Return a data URL from OpenRouter or a Pollinations fallback URL."""
        full_prompt = self._build_full_prompt(visual_tag, meal_type, dish_name, ingredients)
        started = time.perf_counter()

        generation_observability.event(
            run_id, "image_started", "image_generation", provider="openrouter",
            model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
        )

        if settings.OPENROUTER_API_KEY:
            try:
                logger.info("ImageService: Generating image with OpenRouter model %s", settings.OPENROUTER_IMAGE_MODEL)
                # Image providers can queue for a long time. The recipe flow must
                # stay responsive, so fall back promptly instead of holding the
                # entire request open until the browser aborts it.
                async with httpx.AsyncClient(timeout=20.0) as client:
                    response = await client.post(
                        self.openrouter_url,
                        headers={
                            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                            "HTTP-Referer": "https://app.jacomprei.app",
                            "X-OpenRouter-Title": "Ja Comprei",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": settings.OPENROUTER_IMAGE_MODEL,
                            "prompt": full_prompt,
                            "n": 1,
                            "quality": settings.OPENROUTER_IMAGE_QUALITY,
                        },
                    )

                    if response.status_code == 200:
                        data = response.json().get("data", [])
                        if data:
                            image_data = data[0]
                            base64_image = image_data.get("b64_json")
                            if base64_image:
                                media_type = image_data.get("media_type", "image/png")
                                logger.info("ImageService: OpenRouter succeeded.")
                                generation_observability.event(
                                    run_id, "image_completed", "image_generation", provider="openrouter",
                                    model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
                                    duration_ms=int((time.perf_counter() - started) * 1000),
                                    metadata={"payload": "data_url", "media_type": media_type},
                                )
                                return f"data:{media_type};base64,{base64_image}"

                            image_url = image_data.get("url")
                            if image_url:
                                logger.info("ImageService: OpenRouter succeeded with a hosted URL.")
                                generation_observability.event(
                                    run_id, "image_completed", "image_generation", provider="openrouter",
                                    model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
                                    duration_ms=int((time.perf_counter() - started) * 1000),
                                    metadata={"payload": "remote_url"},
                                )
                                return image_url

                        logger.warning("ImageService: OpenRouter returned no usable image payload.")
                        generation_observability.event(run_id, "image_provider_failed", "image_generation",
                                                       level="warning", provider="openrouter",
                                                       model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
                                                       error="empty_image_payload")
                    else:
                        logger.warning("ImageService: OpenRouter failed with status %s: %s", response.status_code, response.text)
                        generation_observability.event(run_id, "image_provider_failed", "image_generation",
                                                       level="warning", provider="openrouter",
                                                       model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
                                                       error=f"http_{response.status_code}")
            except Exception as exc:
                logger.warning("ImageService: OpenRouter raised exception: %r", exc)
                generation_observability.event(run_id, "image_provider_failed", "image_generation",
                                               level="warning", provider="openrouter",
                                               model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
                                               error=exc)

        logger.info("ImageService: Falling back to Pollinations AI.")
        fallback_url = pollinations_service.get_ghibli_url(full_prompt, meal_type=meal_type)
        generation_observability.event(
            run_id, "image_fallback", "image_generation", provider="pollinations",
            model=settings.POLLINATIONS_MODEL, recipe_index=recipe_index,
            duration_ms=int((time.perf_counter() - started) * 1000),
            metadata={"reason": "openrouter_unavailable", "payload": "remote_url"},
        )
        return fallback_url


image_service = ImageService()
