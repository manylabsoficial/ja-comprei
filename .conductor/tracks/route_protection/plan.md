# Route Protection - Plano de Implementação

## Fase 1: Componente ProtectedRoute

### 1.1 Criar componente `ProtectedRoute.jsx`
- [x] Criar `frontend-ja-comprei/src/components/ProtectedRoute.jsx`
- [x] Usar `supabase.auth.getSession()` para verificar autenticação
- [x] Estado: `isLoading`, `isAuthenticated`
- [x] Renderizar loading spinner enquanto verifica
- [x] Redirecionar para `/login` se não autenticado
- [x] Renderizar `children` se autenticado

---

## Fase 2: Refatorar RecipeContext

### 2.1 Adicionar Session Listener
- [x] Modificar `RecipeContext.jsx`
- [x] Usar `supabase.auth.onAuthStateChange()` para updates reativos
- [x] Atualizar `user` no state quando sessão mudar
- [x] Limpar `user` no logout automaticamente

### 2.2 Remover Auto-Login de Produção
- [x] Modificar `ensureDevSession()` em `recipeService.js`
- [x] Verificar `window.location.hostname` rigorosamente
- [x] Remover hardcode de credenciais se não for localhost

---

## Fase 3: Envolver Rotas Protegidas

### 3.1 Modificar `App.jsx`
- [x] Importar `ProtectedRoute`
- [x] Envolver rotas protegidas:
  - `/dashboard`
  - `/scanner`
  - `/scanning`
  - `/analyzing`
  - `/lista`
  - `/sugestoes`
  - `/minhas-receitas`
  - `/minhas-listas`
  - `/minhas-listas/:id`
  - `/perfil`
  - `/entrada-manual`
  - `/receita/:index`
  - `/debug/recipes`
- [x] Manter públicas: `/`, `/login`, `/confirmacao`, `/r/:slug`

---

## Fase 4: Polish

### 4.1 UX de Redirecionamento
- [x] Adicionar query param `?redirect=` ao redirecionar para login
- [x] Após login bem-sucedido, redirecionar para URL original

### 4.2 Limpar Contexto no Logout
- [x] Garantir que `setUser(null)` seja chamado
- [x] Limpar `recipes` e `ingredients` do contexto

---

## Verificação

### Teste 1: Acesso Não-Autenticado
1. Abrir aba anônima/limpar cookies
2. Tentar acessar `/dashboard` diretamente
3. **Verificar:** Redirecionado para `/login`

### Teste 2: Logout e Re-acesso
1. Fazer login normal
2. Ir para `/perfil` e clicar "Sair"
3. **Verificar:** Redirecionado para `/`
4. Tentar acessar `/dashboard` via URL
5. **Verificar:** Redirecionado para `/login`

### Teste 3: Session entre abas
1. Abrir app em 2 abas (logado)
2. Na aba 1, fazer logout
3. **Verificar:** Aba 2 detecta e redireciona

---

## Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| `src/components/ProtectedRoute.jsx` | CRIAR |
| `src/context/RecipeContext.jsx` | MODIFICAR |
| `src/App.jsx` | MODIFICAR |
| `src/services/recipeService.js` | MODIFICAR |

## Estimativa
~1-2 horas de desenvolvimento
