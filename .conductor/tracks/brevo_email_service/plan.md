# Implementação de Emails com Brevo

## Goal Description
Implementar o envio de emails transacionais (Boas-vindas e Recuperação de Senha) usando a API da Brevo v2026. A integração deve ser feita no FastAPI através de um serviço dedicado.

## Proposed Changes

### [Backend] Dependências
- Verificar/Adicionar `brevo-python` em `backend-ja-comprei/requirements.txt`.

### [Backend] Email Service
- **Arquivo:** `app/services/email_service.py`
- Criar classe `EmailService` que utiliza `brevo_python.TransactionalEmailsApi`.
- Método `send_transactional_email(to_email, to_name, template_id, params)`.
- Tratamento de `ApiException`.

### [Backend] Templates Setup
- **Arquivo:** `BREVO_TEMPLATES_SETUP.md` (na raiz do backend ou raiz do projeto).
- Documentar os textos (Assunto, Título, Corpo, CTA) com tom acolhedor para configuração no painel da Brevo.

### [Backend] Integração Auth Router (Robustez & Segurança 🛡️)
- **Arquivo:** `app/routers/auth_router.py`
- **Requisito:** Utilizar `SUPABASE_SERVICE_ROLE_KEY` (adicionar ao `.env`) para acesso `admin`.

- **POST /register:**
    1. Recebe `email`, `password`, `nome`.
    2. **Admin Action:** Chama `supabase.auth.admin.create_user` com `email_confirm=False` (cria usuário sem confirmar).
    3. **Link Generation:** Chama `supabase.auth.admin.generate_link(type="signup", email=...)` para obter o link mágico de confirmação.
    4. **Email:** Chama `email_service.send_welcome_email` passando esse `action_link`.
    5. Retorna 201 Created (sem expor dados sensíveis).
    *Segurança:* Evita o envio automático do Supabase (SMTP deve estar desativado ou ignorado) e garante que o link de confirmação siga nosso template.

- **POST /reset-password-request:**
    1. Recebe `email`.
    2. **Anti-Enumeration:** Se o email não existir, finge que enviou (retorna 200 OK + log interno de erro).
    3. **Link Generation:** Se existir, chama `supabase.auth.admin.generate_link(type="recovery", email=...)`.
    4. **Email:** Chama `email_service.send_password_recovery_email` com o `action_link`.
    *Segurança:* Protege a base contra mineração de emails válidos.

## Verification Plan
### Manual Verification
1. Criar novo usuário (via endpoint ou UI) → Verificar se log de sucesso aparece no console do Backend (simulado se sem chave válida).
2. Chamar endpoint de reset de senha → Verificar log.
