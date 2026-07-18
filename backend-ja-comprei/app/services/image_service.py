import logging
import time

import httpx

from app.core.config import get_settings
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
    """Generate recipe photography through OpenRouter with a durable model fallback."""

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

    async def _generate_with_openrouter(
        self,
        prompt: str,
        model: str,
        quality: str | None,
        timeout_seconds: float,
        run_id: str | None,
        recipe_index: int | None,
        started: float,
        attempt: str,
    ) -> str | None:
        """Return an OpenRouter image payload, or None while recording the precise failure."""
        try:
            logger.info("ImageService: Generating image with OpenRouter model %s (%s).", model, attempt)
            request_body = {
                "model": model,
                "prompt": prompt,
                "n": 1,
            }
            if quality:
                request_body["quality"] = quality
            if model == settings.OPENROUTER_IMAGE_MODEL:
                request_body["resolution"] = settings.OPENROUTER_IMAGE_RESOLUTION
                request_body["aspect_ratio"] = settings.OPENROUTER_IMAGE_ASPECT_RATIO

            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                response = await client.post(
                    self.openrouter_url,
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "HTTP-Referer": "https://app.jacomprei.app",
                        "X-OpenRouter-Title": "Ja Comprei",
                        "Content-Type": "application/json",
                    },
                    json=request_body,
                )

            if response.status_code != 200:
                logger.warning("ImageService: OpenRouter %s failed with status %s.", model, response.status_code)
                generation_observability.event(
                    run_id, "image_provider_failed", "image_generation", level="warning",
                    provider="openrouter", model=model, recipe_index=recipe_index,
                    error=f"http_{response.status_code}", metadata={"attempt": attempt},
                )
                return None

            data = response.json().get("data", [])
            image_data = data[0] if data else None
            if not image_data:
                generation_observability.event(
                    run_id, "image_provider_failed", "image_generation", level="warning",
                    provider="openrouter", model=model, recipe_index=recipe_index,
                    error="empty_image_payload", metadata={"attempt": attempt},
                )
                return None

            base64_image = image_data.get("b64_json")
            if base64_image:
                media_type = image_data.get("media_type", "image/png")
                generation_observability.event(
                    run_id, "image_completed", "image_generation", provider="openrouter",
                    model=model, recipe_index=recipe_index,
                    duration_ms=int((time.perf_counter() - started) * 1000),
                    metadata={"attempt": attempt, "payload": "data_url", "media_type": media_type},
                )
                return f"data:{media_type};base64,{base64_image}"

            image_url = image_data.get("url")
            if image_url:
                generation_observability.event(
                    run_id, "image_completed", "image_generation", provider="openrouter",
                    model=model, recipe_index=recipe_index,
                    duration_ms=int((time.perf_counter() - started) * 1000),
                    metadata={"attempt": attempt, "payload": "remote_url"},
                )
                return image_url

            generation_observability.event(
                run_id, "image_provider_failed", "image_generation", level="warning",
                provider="openrouter", model=model, recipe_index=recipe_index,
                error="unsupported_image_payload", metadata={"attempt": attempt},
            )
        except Exception as exc:
            logger.warning("ImageService: OpenRouter %s raised %r", model, exc)
            generation_observability.event(
                run_id, "image_provider_failed", "image_generation", level="warning",
                provider="openrouter", model=model, recipe_index=recipe_index,
                error=exc, metadata={"attempt": attempt, "timeout_seconds": timeout_seconds},
            )
        return None

    async def generate_recipe_image(
        self,
        visual_tag: str,
        meal_type: str = "default",
        dish_name: str | None = None,
        ingredients: list[str] | None = None,
        run_id: str | None = None,
        recipe_index: int | None = None,
    ) -> str:
        """Return an OpenRouter image URL, or an empty value when both models fail."""
        full_prompt = self._build_full_prompt(visual_tag, meal_type, dish_name, ingredients)
        started = time.perf_counter()

        generation_observability.event(
            run_id, "image_started", "image_generation", provider="openrouter",
            model=settings.OPENROUTER_IMAGE_MODEL, recipe_index=recipe_index,
        )

        if settings.OPENROUTER_API_KEY:
            primary_image = await self._generate_with_openrouter(
                full_prompt, settings.OPENROUTER_IMAGE_MODEL, settings.OPENROUTER_IMAGE_QUALITY,
                settings.OPENROUTER_IMAGE_TIMEOUT_SECONDS, run_id, recipe_index, started, "primary",
            )
            if primary_image:
                return primary_image

            fallback_model = settings.OPENROUTER_IMAGE_FALLBACK_MODEL
            if fallback_model and fallback_model != settings.OPENROUTER_IMAGE_MODEL:
                logger.info("ImageService: Primary image model failed; trying %s.", fallback_model)
                generation_observability.event(
                    run_id, "image_fallback", "image_generation", provider="openrouter",
                    model=fallback_model, recipe_index=recipe_index,
                    duration_ms=int((time.perf_counter() - started) * 1000),
                    metadata={"reason": "primary_model_unavailable", "strategy": "secondary_openrouter_model"},
                )
                fallback_image = await self._generate_with_openrouter(
                    full_prompt, fallback_model, settings.OPENROUTER_IMAGE_FALLBACK_QUALITY,
                    settings.OPENROUTER_IMAGE_FALLBACK_TIMEOUT_SECONDS, run_id, recipe_index, started, "fallback",
                )
                if fallback_image:
                    return fallback_image

        logger.warning("ImageService: No image could be generated for recipe %s.", recipe_index)
        generation_observability.event(
            run_id, "image_unavailable", "image_generation", level="warning", provider="openrouter",
            model=settings.OPENROUTER_IMAGE_FALLBACK_MODEL, recipe_index=recipe_index,
            duration_ms=int((time.perf_counter() - started) * 1000),
            metadata={"reason": "all_openrouter_models_unavailable"},
        )
        return ""


image_service = ImageService()
