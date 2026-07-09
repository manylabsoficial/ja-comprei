from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GEMINI_API_KEY: str | None = None
    POLLINATIONS_API_KEY: str | None = None
    OPENROUTER_API_KEY: str | None = None
    
    # Model Constants
    MODEL_HEAVY: str = "llama-3.3-70b-versatile"
    MODEL_FAST: str = "openai/gpt-oss-20b"
    MODEL_AUDIO: str = "whisper-large-v3-turbo"
    
    # Modelo para Visão/OCR (Llama 4 Scout 17B, multimodal, 750 tps)
    MODEL_VISION: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    
    # Heavy model fallback (Groq) — used when DeepSeek is unavailable
    MODEL_HEAVY_FALLBACK: str = "openai/gpt-oss-120b"
    
    # DeepSeek Models (alternative provider, better cost/quality)
    DEEPSEEK_API_KEY: str | None = None
    DEEPSEEK_MODEL_FLASH: str = "deepseek-v4-flash"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    
    # Pollinations Model (flux)
    POLLINATIONS_MODEL: str = "flux"
    
    # OpenRouter Image Model
    OPENROUTER_IMAGE_MODEL: str = "black-forest-labs/flux-1-schnell"

    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Anon Key (Opcional se formos usar só service role aqui, mas bom ter)
    SUPABASE_SERVICE_ROLE_KEY: str

    # Brevo Settings
    BREVO_API_KEY: str
    BREVO_WELCOME_TEMPLATE_ID: int | None = None
    BREVO_RESET_TEMPLATE_ID: int | None = None

    class Config:
        env_file = ".env"
        extra = "ignore" 

@lru_cache()
def get_settings():
    return Settings()