import httpx
import base64
import logging
import json
from app.core.config import get_settings
from urllib.parse import quote

settings = get_settings()
logger = logging.getLogger(__name__)

class PollinationsService:
    def __init__(self):
        self.base_url_gen = "https://gen.pollinations.ai"

    def get_image_url(self, prompt: str, width: int = 800, height: int = 600) -> str:
        """
        Constructs the URL for generating an image via GET request.
        Model: flux (Photorealistic)
        """
        # Encode prompt safely
        encoded_prompt = quote(prompt)
        
        # Build URL
        # https://gen.pollinations.ai/image/{prompt}?model={model}&width={w}&height={h}&nologo=true
        url = f"{self.base_url_gen}/image/{encoded_prompt}?model={settings.POLLINATIONS_MODEL}&width={width}&height={height}&nologo=true"
        
        # Check for seed/enhance if needed, keeping it simple for now standard Plan
        
        if settings.POLLINATIONS_API_KEY:
            url += f"&key={settings.POLLINATIONS_API_KEY}"
            
        return url

pollinations_service = PollinationsService()
