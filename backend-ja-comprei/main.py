from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env vars before imports
load_dotenv()

from app.routers import voice_router, recipe_router, auth_router, metadata_router

app = FastAPI(title="Já Comprei Backend", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite Dev 1
        "http://localhost:5174",  # Vite Dev 2
        "http://localhost:5175",  # Vite Dev 3
        "http://localhost:3000",  # React Default
        "https://jacomprei.app",  # Production — landing pública (arquitetura dividida)
        "https://www.jacomprei.app", # WWW Production
        "https://app.jacomprei.app", # Production — SPA do app (subdomínio, arquitetura dividida)
        "https://api.jacomprei.app" # Self (docs)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    print(f"REQUEST: {request.method} {request.url.path} - STATUS: {response.status_code} - TEMPO: {process_time:.2f}ms")
    return response

# Include Routers
# Voice: /api/voice/transcribe
app.include_router(voice_router.router, prefix="/api") 

# Recipes: /api/sugerir-receitas
app.include_router(recipe_router.router, prefix="/api")

# Metadata: /api/recipes/ metadata
app.include_router(metadata_router.router, prefix="/api")

# Auth: /api/auth/register
app.include_router(auth_router.router, prefix="/api/auth")

@app.get("/")
def home():
    return {"message": "Backend Já Comprei (Hybrid AI) está ON!", "status": "ok", "version": "2.0.0"}