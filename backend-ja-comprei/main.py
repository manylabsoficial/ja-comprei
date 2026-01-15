from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import voice_router, recipe_router
from dotenv import load_dotenv

# Load env vars
load_dotenv()

app = FastAPI(title="Já Comprei Backend", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite Dev
        "http://localhost:3000",  # React Default
        "https://jacomprei.app",  # Production
        "https://www.jacomprei.app", # WWW Production
        "https://api.jacomprei.app" # Self (docs)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
# Voice: /api/voice/transcribe
app.include_router(voice_router.router, prefix="/api") 

# Recipes: /api/sugerir-receitas
app.include_router(recipe_router.router, prefix="/api")

@app.get("/")
def home():
    return {"message": "Backend Já Comprei (Hybrid AI) está ON!", "status": "ok", "version": "2.0.0"}