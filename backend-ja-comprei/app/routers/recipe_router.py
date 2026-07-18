import time
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, File, Request, status
from pydantic import BaseModel
from app.services.ai_orchestrator import ai_orchestrator
from app.services.generation_observability import generation_observability
from app.routers.auth_router import get_authenticated_user
import json

router = APIRouter(tags=["Receitas"])

class IngredienteInput(BaseModel):
    item: str
    quantidade: str

class PedidoReceitas(BaseModel):
    ingredientes: list[IngredienteInput]
    user_id: str | None = None


class ImageRenderEvent(BaseModel):
    generation_id: str
    recipe_index: int
    event_type: str
    provider: str | None = None

@router.post("/sugerir-receitas")
async def sugerir_receitas(pedido: PedidoReceitas, request: Request):
    # Extract just names for the AI
    lista_nomes = [i.item for i in pedido.ingredientes]
    print(f"Gerando receitas para: {lista_nomes}")
    run_id = str(uuid4())
    user_id = pedido.user_id
    if request.headers.get("Authorization"):
        user_id = get_authenticated_user(request).id

    await generation_observability.create_run(run_id, user_id, len(lista_nomes))
    generation_observability.event(run_id, "request_received", "api", metadata={"ingredient_count": len(lista_nomes)})
    started = time.perf_counter()
    try:
        # Use Orchestrator to include Images and User Preferences
        result = await ai_orchestrator.generate_recipes_with_images(lista_nomes, user_id=user_id, run_id=run_id)
        result["generation_id"] = run_id
        await generation_observability.finish_run(
            run_id, "succeeded", int((time.perf_counter() - started) * 1000),
            recipe_count=len(result.get("receitas", [])),
        )
        return result
    except Exception as e:
        print(f"Erro ao gerar receitas: {e}")
        await generation_observability.finish_run(
            run_id, "failed", int((time.perf_counter() - started) * 1000), error=e,
        )
        raise HTTPException(status_code=500, detail="recipe_generation_failed") from e


@router.post("/generation-events", status_code=status.HTTP_202_ACCEPTED)
async def record_generation_image_event(event: ImageRenderEvent, request: Request):
    """Record whether a recipe image actually rendered in the user's browser."""
    user = get_authenticated_user(request)
    if event.event_type not in {"image_loaded", "image_failed"}:
        raise HTTPException(status_code=422, detail="invalid_generation_event")
    recorded = await generation_observability.record_client_image_event(
        event.generation_id, user.id, event.recipe_index, event.event_type,
        {"provider": event.provider or "unknown"},
    )
    if not recorded:
        raise HTTPException(status_code=404, detail="generation_run_not_found")
    return {"ok": True}

@router.post("/analisar-nota")
async def analisar_nota(file: UploadFile = File(...)):
    print(f"Analisando lista/nota: {file.filename}")
    try:
        content = await file.read()
        
        # Check if it looks like an image (basic check or rely on orchestrator)
        filename = file.filename.lower()
        if filename.endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp')):
             # Use Orchestrator (Pollinations Vision -> Groq Parser)
             return await ai_orchestrator.process_receipt_image(content)
        else:
             # Text fallback (legacy/txt files)
             try:
                 text_content = content.decode("utf-8")
                 # We still need groq_service for parsing text directly if we want to support .txt
                 # But orchestrator could expose this too. avoiding import cycle, let's just error for now 
                 # or import groq_service inside if needed, OR orchestrator handle text too?
                 # Let's verify 'ai_orchestrator' logic. It uses 'extract_text_from_image'.
                 # For simplicity: Assume image upload for now as per "Scanner" feature.
                 # If user uploads .txt, we can fail or handle.
                 
                 raise HTTPException(status_code=400, detail="Por favor envie uma imagem (JPG, PNG) para análise.")
             except:
                 raise HTTPException(status_code=400, detail="Formato de arquivo não suportado.")

    except Exception as e:
        print(f"Erro ao analisar nota: {e}")
        raise HTTPException(status_code=500, detail=str(e))
