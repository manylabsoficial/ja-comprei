from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services.ai_orchestrator import ai_orchestrator
import json

router = APIRouter(tags=["Receitas"])

class IngredienteInput(BaseModel):
    item: str
    quantidade: str

class PedidoReceitas(BaseModel):
    ingredientes: list[IngredienteInput]
    user_id: str | None = None

@router.post("/sugerir-receitas")
async def sugerir_receitas(pedido: PedidoReceitas):
    # Extract just names for the AI
    lista_nomes = [i.item for i in pedido.ingredientes]
    print(f"Gerando receitas para: {lista_nomes}")
    try:
        # Use Orchestrator to include Images and User Preferences
        return await ai_orchestrator.generate_recipes_with_images(lista_nomes, user_id=pedido.user_id)
    except Exception as e:
        print(f"Erro ao gerar receitas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
