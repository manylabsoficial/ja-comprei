from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GEMINI_API_KEY: str | None = None
    POLLINATIONS_API_KEY: str | None = None
    
    # Model Constants
    MODEL_HEAVY: str = "llama-3.3-70b-versatile"
    MODEL_FAST: str = "llama-3.1-8b-instant"
    MODEL_AUDIO: str = "whisper-large-v3-turbo"
    
    # Novo modelo para Visão/OCR
    MODEL_VISION: str = "meta-llama/llama-4-maverick-17b-128e-instruct" 
    
    # Pollinations Model (flux, turbo, etc)
    POLLINATIONS_MODEL: str = "turbo" 

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