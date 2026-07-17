from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.schemas import UserRegister, PasswordResetRequest
from app.services.email_service import email_service
from app.core.config import get_settings
from supabase import create_client, Client
import logging
from pydantic import BaseModel, Field

router = APIRouter()
logger = logging.getLogger(__name__)


class ShoppingListCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    items: list[dict] = Field(min_length=1)

def get_supabase_admin() -> Client:
    settings = get_settings()
    # Usa a SERVICE ROLE KEY para ter permissões de admin (auth.admin)
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def get_authenticated_user(request: Request):
    """Validate the bearer token and return the Supabase user it represents."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    access_token = auth_header.split(" ", 1)[1]
    settings = get_settings()
    user_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    try:
        user_response = user_client.auth.get_user(access_token)
        if not user_response or not user_response.user:
            raise ValueError("Invalid session")
        return user_response.user
    except Exception as exc:
        logger.warning("Invalid bearer token: %s", exc)
        raise HTTPException(status_code=401, detail="Unauthorized") from exc

@router.post("/register", status_code=201)
async def register_user(user_data: UserRegister, background_tasks: BackgroundTasks):
    """
    Registra um usuário no Supabase e envia email de boas-vindas customizado (Brevo).
    """
    supabase = get_supabase_admin()
    
    try:
        # 1. Criar usuário com email_confirm=False para evitar disparo automático do Supabase
        # E também garantir que nós controlamos o link de confirmação
        user_response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "user_metadata": {"nome": user_data.nome},
            "email_confirm": False 
        })
        
        user_id = user_response.user.id
        logger.info(f"User created directly in Supabase: {user_id}")

        # 2. Gerar Link Mágico de Cadastro
        # Isso cria um link do tipo: https://jacomprei.app/confirmacao?token=...
        # Precisamos garantir que o SITE_URL do Supabase esteja configurado corretamente ou passamos redirect_to
        
        # Define base URL based on environment/hardcoded for now to ensure consistency
        # Em DEV, pode ser http://localhost:5173/confirmacao se quiser testar local
        # Mas para produção deve ser a URL final.
        redirect_url = "https://jacomprei.app/confirmacao"
        
        link_response = supabase.auth.admin.generate_link({
            "type": "signup",
            "email": user_data.email,
            "password": user_data.password,
            "options": {"redirect_to": redirect_url}
        })
        
        action_link = link_response.properties.action_link
        logger.info(f"Magic Link generated for {user_data.email}")

        # 3. Enviar Email via Brevo
        # Usamos BackgroundTasks para não travar a resposta da API
        if email_service.api_instance:
            background_tasks.add_task(
                email_service.send_welcome_email,
                to_email=user_data.email,
                name=user_data.nome,
                confirm_link=action_link
            )
        else:
            logger.warning("Email service not available, skipping welcome email.")

        return {"message": "User created successfully. Confirmation email sent."}

    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        # Tratamento de erro simples - idealmente parsear erro do supabase
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password-request", status_code=200)
async def request_password_reset(data: PasswordResetRequest, background_tasks: BackgroundTasks):
    """
    Inicia o fluxo de recuperação de senha.
    Retorna 200 sempre para evitar enumeração de usuários.
    """
    supabase = get_supabase_admin()
    
    try:
        # 1. Gerar Link de Recuperação
        # Se o usuário não existir, o Supabase geralmente lança erro.
        link_response = supabase.auth.admin.generate_link({
            "type": "recovery",
            "email": data.email
        })
        
        action_link = link_response.properties.action_link
        
        # 2. Enviar Email
        # Recuperar nome dos metadados seria ideal, mas generate_link retorna User objects?
        # link_response.user.user_metadata might be available
        user_name = "Chef"
        if hasattr(link_response, 'user') and link_response.user and link_response.user.user_metadata:
             user_name = link_response.user.user_metadata.get('nome', 'Chef')

        if email_service.api_instance:
             background_tasks.add_task(
                email_service.send_password_recovery_email,
                to_email=data.email,
                name=user_name,
                reset_link=action_link
            )
        
        logger.info(f"Password reset link generated/sent for {data.email}")

    except Exception as e:
        # Se der erro (ex: user not found), logamos mas retornamos sucesso pro emular segurança
        logger.warning(f"Password reset request failed (likely user not found): {str(e)}")
        pass

    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/manylabs/ensure-access", status_code=200)
async def ensure_manylabs_access(request: Request):
    """
    Endpoint de Autoativação Segura do ManyLabs.
    Verifica o token recebido e carimba a permissão de acesso ao Já Comprei
    utilizando a Service Role.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    access_token = auth_header.split(" ")[1]
    
    # 1. Validar a identidade do usuário com o token enviado pelo frontend
    # Criamos um client normal (sem service_role) só pra validar o JWT
    settings = get_settings()
    user_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    
    try:
        user_response = user_client.auth.get_user(access_token)
        if not user_response or not user_response.user:
            raise Exception("Invalid session")
    except Exception as e:
        logger.error(f"Error getting user from token: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    user = user_response.user
    user_name = user.user_metadata.get('nome', user.user_metadata.get('name', 'Chef')) if user.user_metadata else 'Chef'
    
    # 2. Executar a autorização ManyLabs com a Service Role
    admin_supabase = get_supabase_admin()
    
    try:
        rpc_response = admin_supabase.rpc("ensure_manylabs_app_access", {
            "p_user_id": user.id,
            "p_email": user.email,
            "p_display_name": user_name
        }).execute()
        
        ok = rpc_response.data
        if not ok:
             raise HTTPException(status_code=403, detail="app_access_required")
             
        return {"ok": True}
        
    except Exception as e:
        logger.error(f"RPC ensure_manylabs_app_access error: {e}")
        # A API pode levantar um HTTP Exception que queremos repassar
        if isinstance(e, HTTPException):
             raise e
        raise HTTPException(status_code=500, detail="manylabs_rpc_failed")


@router.post("/shopping-lists", status_code=201)
async def create_shopping_list(payload: ShoppingListCreate, request: Request):
    """Persist a list without exposing the private `jacomprei` schema to Data API."""
    user = get_authenticated_user(request)
    valid_items = [item for item in payload.items if str(item.get("name", "")).strip()]
    if not valid_items:
        raise HTTPException(status_code=422, detail="List needs at least one valid item.")

    try:
        response = get_supabase_admin().schema("jacomprei").table("shopping_lists").insert({
            "user_id": user.id,
            "title": payload.title.strip(),
            "items": valid_items,
        }).execute()
        return response.data[0]
    except Exception as exc:
        logger.exception("Failed to save shopping list for user %s", user.id)
        raise HTTPException(status_code=500, detail="shopping_list_save_failed") from exc


@router.get("/shopping-lists")
async def get_shopping_lists(request: Request):
    """Return only the authenticated user's saved lists."""
    user = get_authenticated_user(request)
    try:
        response = get_supabase_admin().schema("jacomprei").table("shopping_lists") \
            .select("id,title,items,created_at") \
            .eq("user_id", user.id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as exc:
        logger.exception("Failed to load shopping lists for user %s", user.id)
        raise HTTPException(status_code=500, detail="shopping_list_load_failed") from exc


@router.get("/shopping-lists/{list_id}")
async def get_shopping_list(list_id: str, request: Request):
    """Return one saved list, enforcing ownership on the server."""
    user = get_authenticated_user(request)
    try:
        response = get_supabase_admin().schema("jacomprei").table("shopping_lists") \
            .select("id,title,items,created_at") \
            .eq("id", list_id) \
            .eq("user_id", user.id) \
            .maybe_single() \
            .execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="shopping_list_not_found")
        return response.data
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to load shopping list %s for user %s", list_id, user.id)
        raise HTTPException(status_code=500, detail="shopping_list_load_failed") from exc


@router.delete("/shopping-lists/{list_id}", status_code=204)
async def delete_shopping_list(list_id: str, request: Request):
    """Delete one saved list, enforcing ownership on the server."""
    user = get_authenticated_user(request)
    try:
        get_supabase_admin().schema("jacomprei").table("shopping_lists") \
            .delete() \
            .eq("id", list_id) \
            .eq("user_id", user.id) \
            .execute()
    except Exception as exc:
        logger.exception("Failed to delete shopping list %s for user %s", list_id, user.id)
        raise HTTPException(status_code=500, detail="shopping_list_delete_failed") from exc

