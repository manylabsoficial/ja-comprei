# Plan: Cache e Estabilidade de Sessão

Este plano detalha as etapas para implementar o controle de versão e cache no frontend.

## Passos Atômicos

### Fase 1: Configuração de Build e Cache
- [x] Adicionar Meta Tags de Cache no `index.html` <!-- id: cs_1 -->
- [x] Configurar `vite.config.js` para injetar `VITE_BUILD_ID` via `define` <!-- id: cs_2 -->

### Fase 2: Lógica de Versionamento (Frontend)
- [x] Implementar verificação de Build ID no `App.jsx` ou `main.jsx` <!-- id: cs_3 -->
- [x] Implementar lógica de `localStorage.clear()` e `reload()` em caso de divergência de ID <!-- id: cs_4 -->

### Fase 3: Segurança de Sessão
- [x] Refatorar `ProtectedRoute.jsx` para usar `supabase.auth.getUser()` em vez de `getSession()` <!-- id: cs_5 -->
- [x] Adicionar tratamento de erro global para falhas de autenticação (redirecionamento para login) <!-- id: cs_6 -->

## Definição de Pronto (DoD)
- O site recarrega automaticamente ao detectar um Build ID novo.
- O `index.html` não é servido do cache de disco sem validação.
- Tentativas de acesso com tokens inválidos são barradas imediatamente pela chamada ao Supabase.
