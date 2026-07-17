import logging
import json
import asyncio
from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict
from pydantic import ValidationError

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import get_settings
from app.prompts.chef_v2 import CHEF_SYSTEM_PROMPT
from app.utils.sanitize import sanitize_ingredient_list
from app.schemas import ReceitasResponse
from app.services.image_service import image_service

settings = get_settings()
logger = logging.getLogger(__name__)

class RecipeState(TypedDict):
    # Inputs
    ingredients: List[str]
    user_id: Optional[str]
    
    # Compiled context
    user_preferences: Optional[str]
    recipe_count: int
    recipe_context: str
    exploitation_count: int
    exploration_count: int
    
    # LLM intermediates
    raw_response: Optional[str]
    recipes_data: Optional[Dict[str, Any]]
    
    # State tracking
    is_valid: bool
    validation_errors: List[str]
    attempt_count: int
    max_attempts: int
    active_model: str
    provider: str  # "deepseek" | "groq"
    
    # Images output
    recipe_images: Dict[int, str]

# --- NODES ---

async def prepare_context_node(state: RecipeState) -> Dict[str, Any]:
    """
    REQ-01: Sanitizes ingredients and compiles RAG user preferences.
    """
    logger.info("RecipeGraph [Node: PrepareContext]: Preparing context and sanitizing inputs...")
    
    sanitized_ingredients = sanitize_ingredient_list(state["ingredients"])
    count = len(sanitized_ingredients)
    
    # Dynamic context & recipe count scaling
    if count <= 5:
        recipe_count = 2
        recipe_context = "compra rápida - foco em praticidade"
        exploration_count = 1
    elif count <= 15:
        recipe_count = 4
        recipe_context = "compra média - variedade moderada"
        exploration_count = 1
    elif count <= 30:
        recipe_count = 8
        recipe_context = "compra grande - explore combinações criativas"
        exploration_count = 3
    else:
        recipe_count = 12
        recipe_context = "compra do mês - cardápio semanal completo"
        exploration_count = 5
        
    exploitation_count = recipe_count - exploration_count
    
    # Fetch user preferences from Supabase if user_id is provided
    user_preferences = None
    if state.get("user_id"):
        try:
            from app.routers.metadata_router import supabase 
            res = supabase.schema("jacomprei").table("user_recipe_metadata")\
                .select("*")\
                .eq("user_id", state["user_id"])\
                .order("created_at", desc=True)\
                .limit(20)\
                .execute()
            
            if res.data:
                from app.services.metadata_extractor import metadata_extractor
                user_preferences = metadata_extractor.get_user_preferences_summary(res.data)
                logger.info(f"RecipeGraph: Loaded preferences for user {state['user_id']}")
        except Exception as e:
            logger.warning(f"RecipeGraph: Failed to fetch user preferences: {e}")
            
    return {
        "ingredients": sanitized_ingredients,
        "recipe_count": recipe_count,
        "recipe_context": recipe_context,
        "exploitation_count": exploitation_count,
        "exploration_count": exploration_count,
        "user_preferences": user_preferences,
        "attempt_count": 0,
        "max_attempts": 3,
        "provider": "deepseek",
        "is_valid": False,
        "validation_errors": [],
        "recipe_images": {}
    }

async def generate_recipes_deepseek_node(state: RecipeState) -> Dict[str, Any]:
    """
    REQ-02: Calls DeepSeek V4 Flash with Pydantic JSON response format.
    """
    logger.info("RecipeGraph [Node: GenerateRecipesDeepseek]: Querying DeepSeek V4 Flash...")
    
    if not settings.DEEPSEEK_API_KEY:
        logger.warning("RecipeGraph: DEEPSEEK_API_KEY is not configured. Simulating model failure for fallback.")
        return {
            "validation_errors": ["DEEPSEEK_API_KEY missing"],
            "is_valid": False,
            "attempt_count": state["max_attempts"]  # Force direct escalation
        }
        
    dynamic_instructions = f"""
Crie exatamente {state['recipe_count']} receitas criativas e sofisticadas para esta {state['recipe_context']}.

## REGRAS DE BALANCEAMENTO (Exploitation vs Exploration)
- **Receitas Alinhadas ({state['exploitation_count']}):** Devem refletir as preferências culinárias históricas do usuário.
- **Receitas Exploratórias ({state['exploration_count']}):** Devem introduzir NOVIDADES (técnicas contemporâneas, proteínas ou sabores que o usuário não costuma salvar).
"""
    if state["user_preferences"]:
        dynamic_instructions += f"\n## PREFERÊNCIAS DO USUÁRIO (RAG)\n{state['user_preferences']}\n"
        dynamic_instructions += "\nDIRETRIZ: Priorize receitas gourmet que combinem com o perfil acima.\n"
        
    system_prompt = CHEF_SYSTEM_PROMPT.format(dynamic_instructions=dynamic_instructions)
    ingredients_str = ", ".join(state["ingredients"])
    
    try:
        # Initialize ChatOpenAI for DeepSeek
        model = ChatOpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL,
            model=settings.DEEPSEEK_MODEL_FLASH,
            temperature=0.85,
            max_tokens=8000,
            model_kwargs={"response_format": {"type": "json_object"}}
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Ingredientes: {ingredients_str}")
        ]
        
        response = await model.ainvoke(messages)
        return {
            "raw_response": response.content,
            "active_model": settings.DEEPSEEK_MODEL_FLASH,
            "provider": "deepseek"
        }
    except Exception as e:
        logger.error(f"RecipeGraph: DeepSeek generation failed: {e}")
        return {
            "validation_errors": [f"DeepSeek call error: {str(e)}"],
            "is_valid": False,
            "attempt_count": state["max_attempts"]  # Escalates directly
        }

async def generate_recipes_groq_node(state: RecipeState) -> Dict[str, Any]:
    """
    REQ-02: Fallback in chain (Groq GPT-OSS 120B -> GPT-OSS 20B).
    """
    logger.info("RecipeGraph [Node: GenerateRecipesGroq]: Querying Groq API...")
    
    # Decide model based on retry status
    model_name = settings.MODEL_HEAVY_FALLBACK
    if state["attempt_count"] > 0:
        model_name = settings.MODEL_FAST
        logger.info(f"RecipeGraph: Retrying Groq with faster model: {model_name}")
        
    dynamic_instructions = f"""
Crie exatamente {state['recipe_count']} receitas culinárias para esta {state['recipe_context']}.
## REGRAS DE BALANCEAMENTO (Exploitation vs Exploration)
- **Receitas Alinhadas ({state['exploitation_count']}):** Refletir preferências históricas do usuário.
- **Receitas Exploratórias ({state['exploration_count']}):** Introduzir novidades culinárias contemporâneas.
"""
    if state["user_preferences"]:
        dynamic_instructions += f"\n## PREFERÊNCIAS DO USUÁRIO (RAG)\n{state['user_preferences']}\n"
        
    system_prompt = CHEF_SYSTEM_PROMPT.format(dynamic_instructions=dynamic_instructions)
    ingredients_str = ", ".join(state["ingredients"])
    
    try:
        model = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=model_name,
            temperature=0.85,
            model_kwargs={"response_format": {"type": "json_object"}}
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Ingredientes: {ingredients_str}")
        ]
        
        response = await model.ainvoke(messages)
        return {
            "raw_response": response.content,
            "active_model": model_name,
            "provider": "groq"
        }
    except Exception as e:
        logger.error(f"RecipeGraph: Groq generation failed: {e}")
        # If heavy fallback failed, try to set up parameters to check for next fallback or raise exception
        return {
            "validation_errors": [f"Groq call error: {str(e)}"],
            "is_valid": False,
            "attempt_count": state["max_attempts"]
        }

async def validate_recipes_node(state: RecipeState) -> Dict[str, Any]:
    """
    REQ-03: Parses raw JSON, validates against schema, and performs sanity checks.
    """
    logger.info("RecipeGraph [Node: ValidateRecipes]: Validating output recipes...")
    
    raw = state["raw_response"]
    if not raw:
        return {
            "is_valid": False,
            "validation_errors": ["Raw response is empty."]
        }
        
    errors = []
    parsed_data = None
    
    # 1. Parse JSON
    try:
        parsed_data = json.loads(raw)
    except json.JSONDecodeError:
        # Regex sanitization fallback if JSON has markdown block issues
        import re
        json_match = re.search(r"(\{.*\})", raw, re.DOTALL)
        if json_match:
            try:
                parsed_data = json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        if not parsed_data:
            logger.warning("RecipeGraph: Failed to parse raw response as JSON.")
            return {
                "is_valid": False,
                "validation_errors": ["Resposta do modelo não contém um JSON válido."]
            }

    # 2. Pydantic validation
    try:
        validated = ReceitasResponse.model_validate(parsed_data)
        recipes_list = validated.receitas
    except ValidationError as val_err:
        logger.warning(f"RecipeGraph: Pydantic validation failed: {val_err}")
        errors.append(f"Validação do Schema falhou: {str(val_err)}")
        return {
            "is_valid": False,
            "validation_errors": errors
        }

    # 3. Custom qualitative checks
    # Check recipe count
    if len(recipes_list) != state["recipe_count"]:
        errors.append(f"Esperado exatamente {state['recipe_count']} receitas, mas foram geradas {len(recipes_list)}.")
        
    for index, r in enumerate(recipes_list):
        # Steps check
        if len(r.modo_de_preparo) < 4:
            errors.append(f"Receita {index + 1} ({r.nome_do_prato}): modo de preparo muito simplificado (mínimo 4 passos).")
        # Visual Tag check
        if not r.visual_tag or len(r.visual_tag.strip()) < 10:
            errors.append(f"Receita {index + 1} ({r.nome_do_prato}): visual_tag está ausente ou é muito curta.")
            
    if errors:
        logger.warning(f"RecipeGraph: Custom validations failed with {len(errors)} errors.")
        return {
            "is_valid": False,
            "validation_errors": errors
        }
        
    logger.info("RecipeGraph: Validation successful!")
    return {
        "is_valid": True,
        "validation_errors": [],
        "recipes_data": parsed_data
    }

async def correct_recipes_node(state: RecipeState) -> Dict[str, Any]:
    """
    REQ-03: Self-Correction (Reflexion) node. Ask current model to fix its errors.
    """
    attempt = state["attempt_count"] + 1
    logger.info(f"RecipeGraph [Node: CorrectRecipes]: Attempting Self-Correction (Attempt {attempt}/{state['max_attempts']})...")
    
    error_report = "\n".join([f"- {err}" for err in state["validation_errors"]])
    correction_prompt = f"""
Você gerou uma resposta de receitas em JSON que falhou na validação de schema e regras culinárias devido aos seguintes erros:
{error_report}

O JSON original gerado foi:
{state['raw_response']}

Por favor, corrija o JSON acima para resolver todos os erros relatados. 
- Mantenha a estrutura JSON correta.
- Retorne EXCLUSIVAMENTE o JSON de receitas completo e corrigido, sem qualquer tipo de explicação, introdução ou bloco de markdown.
"""
    try:
        messages = [
            SystemMessage(content="Você é um assistente de auto-correção de dados JSON. Retorne apenas JSON válido."),
            HumanMessage(content=correction_prompt)
        ]
        
        if state["provider"] == "deepseek":
            model = ChatOpenAI(
                api_key=settings.DEEPSEEK_API_KEY,
                base_url=settings.DEEPSEEK_BASE_URL,
                model=state["active_model"],
                temperature=0.3,  # Lower temperature for correction precision
                model_kwargs={"response_format": {"type": "json_object"}}
            )
        else:
            model = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model=state["active_model"],
                temperature=0.3,
                model_kwargs={"response_format": {"type": "json_object"}}
            )
            
        response = await model.ainvoke(messages)
        
        return {
            "raw_response": response.content,
            "attempt_count": attempt
        }
    except Exception as e:
        logger.error(f"RecipeGraph: Self-correction model call failed: {e}")
        return {
            "attempt_count": attempt,
            "validation_errors": [f"Self-correction call error: {str(e)}"]
        }

async def generate_images_parallel_node(state: RecipeState) -> Dict[str, Any]:
    """
    REQ-04 & REQ-05: Parallel image generation via asyncio.gather.
    """
    logger.info("RecipeGraph [Node: GenerateImagesParallel]: Generating Ghibli style images in parallel...")
    
    recipes_list = state["recipes_data"]["receitas"]
    meal_types = ["cafe_manha", "almoco", "jantar", "lanche", "sobremesa"]
    
    tasks = []
    for index, recipe in enumerate(recipes_list):
        visual_tag = recipe.get("visual_tag", f"{recipe.get('nome_do_prato', 'Delicious food')}, Studio Ghibli style")
        meal_type = meal_types[index % len(meal_types)]
        
        # Create coroutine
        tasks.append(image_service.generate_recipe_image(
            visual_tag,
            meal_type=meal_type,
            dish_name=recipe.get("nome_do_prato"),
            ingredients=recipe.get("ingredientes_usados", []),
        ))
        
    # Execute concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    recipe_images = {}
    for index, img_res in enumerate(results):
        if isinstance(img_res, Exception):
            logger.error(f"RecipeGraph: Image generation failed for recipe {index}: {img_res}")
            # Fallback URL on failure
            from app.services.pollinations_service import pollinations_service
            recipe = recipes_list[index]
            fallback_url = pollinations_service.get_ghibli_url(recipe.get("visual_tag", "Delicious food"))
            recipe_images[index] = fallback_url
        else:
            recipe_images[index] = img_res
            
    return {
        "recipe_images": recipe_images
    }

async def aggregate_and_respond_node(state: RecipeState) -> Dict[str, Any]:
    """
    Merges generated images back into the recipes structure.
    """
    logger.info("RecipeGraph [Node: AggregateAndRespond]: Merging images and recipes data...")
    
    recipes_data = state["recipes_data"]
    recipe_images = state["recipe_images"]
    
    for index, recipe in enumerate(recipes_data["receitas"]):
        img_url = recipe_images.get(index, "")
        recipe["image_url"] = img_url
        recipe["image_url_large"] = img_url
        
    return {
        "recipes_data": recipes_data
    }

# --- EDGES & ROUTERS ---

def router_after_validation(state: RecipeState) -> str:
    """
    LangGraph conditional edge router.
    """
    if state["is_valid"]:
        return "generate_images_parallel"
        
    if state["attempt_count"] < state["max_attempts"]:
        return "correct_recipes"
        
    # Max attempts exceeded
    if state["provider"] == "deepseek":
        logger.warning("RecipeGraph: DeepSeek validation attempts exhausted. Escalating to Groq fallback.")
        return "escalate_to_groq"
        
    # Groq fallback also exhausted
    logger.error("RecipeGraph: All LLM providers and fallbacks exhausted. Halting.")
    return "halt_with_error"

# --- GRAFO COMPILATION ---

workflow = StateGraph(RecipeState)

# Define Nodes
workflow.add_node("prepare_context", prepare_context_node)
workflow.add_node("generate_recipes_deepseek", generate_recipes_deepseek_node)
workflow.add_node("generate_recipes_groq", generate_recipes_groq_node)
workflow.add_node("validate_recipes", validate_recipes_node)
workflow.add_node("correct_recipes", correct_recipes_node)
workflow.add_node("generate_images_parallel", generate_images_parallel_node)
workflow.add_node("aggregate_and_respond", aggregate_and_respond_node)

# Define Entry Point
workflow.set_entry_point("prepare_context")

# Define Transitions
workflow.add_edge("prepare_context", "generate_recipes_deepseek")
workflow.add_edge("generate_recipes_deepseek", "validate_recipes")
workflow.add_edge("generate_recipes_groq", "validate_recipes")
workflow.add_edge("correct_recipes", "validate_recipes")
workflow.add_edge("generate_images_parallel", "aggregate_and_respond")
workflow.add_edge("aggregate_and_respond", END)

# Define Conditional Edge
workflow.add_conditional_edges(
    "validate_recipes",
    router_after_validation,
    {
        "generate_images_parallel": "generate_images_parallel",
        "correct_recipes": "correct_recipes",
        "escalate_to_groq": "generate_recipes_groq",
        "halt_with_error": END
    }
)

# Compile Graph
recipe_graph = workflow.compile()
