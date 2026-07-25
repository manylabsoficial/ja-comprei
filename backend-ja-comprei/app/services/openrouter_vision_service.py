import json
import logging
import re

from openai import OpenAI
from pydantic import ValidationError

from app.core.config import get_settings
from app.prompts.ocr_vision_v1 import VISION_SYSTEM_PROMPT
from app.schemas import VisionResponse


logger = logging.getLogger(__name__)
settings = get_settings()


class OpenRouterVisionService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            timeout=settings.OPENROUTER_VISION_TIMEOUT_SECONDS,
            default_headers={
                "HTTP-Referer": "https://jacomprei.app",
                "X-Title": "Ja Comprei Receipt OCR",
            },
        )

    def extract_receipt(self, image_data_url: str) -> dict:
        if not settings.OPENROUTER_API_KEY:
            raise RuntimeError("OpenRouter vision is not configured.")

        response = self.client.chat.completions.create(
            model=settings.OPENROUTER_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_SYSTEM_PROMPT},
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                }
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )

        content = response.choices[0].message.content or ""
        raw_data = self._parse_json(content)

        try:
            return VisionResponse.model_validate(raw_data).model_dump()
        except ValidationError as error:
            logger.warning("OpenRouter vision validation failed: %s", error)
            if "ingredientes" in raw_data:
                for item in raw_data["ingredientes"]:
                    item.setdefault("categoria", "outros")
            return VisionResponse.model_validate(raw_data).model_dump()

    @staticmethod
    def _parse_json(content: str) -> dict:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"(\{.*\})", content, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            raise ValueError("Vision provider returned invalid JSON.")


openrouter_vision_service = OpenRouterVisionService()
