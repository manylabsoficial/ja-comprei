from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas import UserRegister, PasswordResetRequest
from app.services.email_service import email_service
from app.core.config import get_settings
from supabase import create_client, Client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def get_supabase_admin() -> Client:
    settings = get_settings()
    # Usa a SERVICE ROLE KEY para ter permissões de admin (auth.admin)
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

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
