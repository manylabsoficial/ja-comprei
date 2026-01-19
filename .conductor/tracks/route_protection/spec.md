# Route Protection - Especificação

## Objetivo
Garantir que rotas protegidas (dashboard, perfil, listas, receitas, etc.) sejam acessíveis **apenas** para usuários autenticados, redirecionando visitantes não logados para a página de login.

## Contexto
- Atualmente, o app usa `ensureDevSession()` que faz auto-login em localhost
- Não existe verificação de autenticação nas rotas protegidas
- O logout limpa a sessão Supabase, mas o usuário ainda pode navegar pelo histórico/URL

## Requisitos Funcionais

### RF1 - Componente ProtectedRoute
- Verificar sessão Supabase antes de renderizar children
- Redirecionar para `/login` se não autenticado
- Exibir loading enquanto verifica sessão

### RF2 - Envolver Rotas Protegidas
- Dashboard, Scanner, Lista, Sugestões, Receitas, Perfil, etc.
- Manter Landing Page (`/`) e Login (`/login`) públicas
- Manter rotas de confirmação públicas

### RF3 - Session Listener (Real-time)
- Reagir a mudanças de sessão (login/logout de outra aba)
- Atualizar estado do contexto automaticamente

### RF4 - Desabilitar Dev Auto-Login em Produção
- `ensureDevSession()` deve ser NO-OP fora de localhost
- Remover credenciais hardcoded do código

## Requisitos Não-Funcionais

### RNF1 - Performance
- Não bloquear renderização com verificações síncronas
- Cache de sessão para evitar chamadas repetidas

### RNF2 - UX
- Transição suave (não piscar conteúdo protegido)
- Mensagem clara ao redirecionar ("Faça login para continuar")

## Arquivos Impactados
- `src/components/ProtectedRoute.jsx` [NOVO]
- `src/context/RecipeContext.jsx` [MODIFICAR]
- `src/App.jsx` [MODIFICAR]
- `src/services/recipeService.js` [MODIFICAR]
