from fastapi import APIRouter, HTTPException, Depends
from app.services.metadata_extractor import metadata_extractor
from app.services.groq_service import groq_service # For verifying recipe exists if needed
# We'll use a direct supabase client if possible or just rely on the frontend passing data
# But the plan says POST /api/recipes/{recipe_id}/extract-metadata
# So we need to fetch the recipe from Supabase first.
import os
from supabase import create_client, Client

router = APIRouter(tags=["Memória Evolutiva"])

# Supabase setup for backend
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend operations
supabase: Client = create_client(url, key)

@router.post("/recipes/{recipe_id}/extract-metadata")
async def extract_recipe_metadata(recipe_id: str):
    try:
        # 1. Fetch recipe from Supabase
        res = supabase.schema("jacomprei").table("recipes").select("*").eq("id", recipe_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Receita não encontrada")
        
        recipe = res.data
        user_id = recipe['user_id']
        
        # 2. Extract metadata using IA
        metadata = await metadata_extractor.extract_from_recipe(recipe)
        
        # 3. Save to user_recipe_metadata
        payload = metadata.model_dump()
        payload['user_id'] = user_id
        payload['recipe_id'] = recipe_id
        
        # upsert to handle retries
        save_res = supabase.schema("jacomprei").table("user_recipe_metadata").upsert(payload, on_conflict="user_id,recipe_id").execute()
        
        return {"status": "success", "metadata": save_res.data[0]}
        
    except Exception as e:
        print(f"Erro na extração de metadados: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}/preferences")
async def get_user_preferences(user_id: str):
    try:
        # Fetch last 20 metadata records for this user
        res = supabase.schema("jacomprei").table("user_recipe_metadata")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(20)\
            .execute()
            
        summary = metadata_extractor.get_user_preferences_summary(res.data)
        
        return {
            "user_id": user_id,
            "total_recipes_analyzed": len(res.data),
            "summary": summary,
            "raw_metadata": res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
