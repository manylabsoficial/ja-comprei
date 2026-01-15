# Fluxo de Confirmação de Email

## Goal Description
Implementar a página de destino para onde o usuário é redirecionado ao clicar no botão "Confirmar meu cadastro" do e-mail. Esta página deve capturar o token da URL, validar junto ao Supabase e efetivar o login.

## Proposed Changes

### [Frontend] Roteamento
- **Arquivo:** `src/App.jsx`
- Adicionar rota `/confirmacao` apontando para `ConfirmationPage`.

### [Frontend] Página de Confirmação
- **Arquivo:** `src/pages/ConfirmationPage.jsx` (Novo)
- **Lógica:**
  - Ler query params da URL: `token_hash`, `type`, `error`, `error_description`.
  - Se sucesso (`token_hash`):
    - Chamar `supabase.auth.verifyOtp({ token_hash, type: 'signup' })`.
    - Se login OK → Redirecionar para `/perfil` (com toast de sucesso).
  - Se erro na URL → Exibir mensagem amigável ("Link expirado ou inválido").

### [Backend] Configuração de Redirecionamento
- **Verificação Manual:** Garantir que o `auth_router.py` está gerando o link corretamente. Como usamos `supabase.auth.admin.generate_link`, precisamos checar se o link gerado usa a URL base configurada no Supabase ou se precisamos passar `redirect_to`.
- *Ação:* Atualizar `auth_router.py` para passar explicitamente `options={"redirect_to": "https://jacomprei.app/confirmacao"}` (ou localhost em dev).

## Verification Plan
### Manual Verification
1. Fazer registro via `/api/auth/register` (Postman ou UI).
2. Receber email.
3. Clicar no botão.
4. Verificar se abre a nova página `/confirmacao`, processa o token e loga o usuário.
