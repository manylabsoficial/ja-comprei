# 📘 BLUEPRINT COMPLETO — Projeto "Já Comprei"

> Documentação técnica de referência — gerada em 24/06/2026 a partir da auditoria do código-fonte.

---

## 📌 1. IDENTIDADE DO PRODUTO

**Já Comprei** é um assistente culinário mobile-first que transforma sua **nota fiscal** (ou lista digitada/ditada) em **receitas personalizadas geradas por IA**. O fluxo: fotografa → extrai ingredientes → sugere receitas → salva e compartilha.

**Posicionamento:** "Sua despensa inteligente — do recibo à receita."

**Domínios:**
- Frontend: (a definir / hospedagem do build Vite)
- API: `api.jacomprei.app`
- Backend: serviço externo (não neste repo)

---

## 🏗️ 2. STACK TECNOLÓGICA

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 19.2 |
| Build | Vite | 7.2 |
| Roteamento | React Router DOM | 7.12 |
| Estilo | Tailwind CSS | 4.1 |
| Animações | Framer Motion + tailwindcss-animate | 11.18 / 1.0 |
| Ícones | Lucide React | 0.562 |
| Backend-as-a-Service | Supabase JS SDK | 2.90 |
| Linguagem | JavaScript (JSX) + 1 arquivo TS | — |
| Linter | ESLint | 9.39 |
| Pacotes | npm | — |

---

## 🗂️ 3. ESTRUTURA DE DIRETÓRIOS

```
frontend-ja-comprei/
├── index.html              # HTML raiz (título + cache-control)
├── package.json
├── vite.config.js          # Plugin React + VITE_BUILD_ID dinâmico (cache busting)
├── tailwind.config.js      # Tema: cores, fontes, animações
├── postcss.config.js
├── eslint.config.js
├── .env.production         # VITE_API_URL=https://api.jacomprei.app
├── .gitignore
├── test-supabase.js        # Script manual de teste de conexão
├── public/
│   ├── logo.ico
│   ├── vite.svg
│   └── mockups/            # Assets de design
└── src/
    ├── main.jsx            # Entry point: StrictMode → BrowserRouter → RecipeProvider → App
    ├── App.jsx             # Roteamento + handlers de negócio (scan, generate, etc.)
    ├── index.css           # Estilos globais Tailwind
    ├── App.css
    ├── Home.jsx            # ⚠️ Possível componente órfão
    ├── LandingPage.jsx     # Landing v1 (rota /)
    ├── LandingPageV2.jsx   # Landing v2 (rota /index2)
    ├── LandingPageModern.jsx # Landing v3 (rota /v2)
    ├── assets/
    │   ├── react.svg
    │   └── images/         # Logo.png, etc.
    ├── components/
    │   ├── AppLayout.jsx       # Wrapper + BottomNav condicional
    │   ├── BottomNav.jsx       # Nav inferior colapsável (5 itens)
    │   ├── ProtectedRoute.jsx  # Guard de auth (getUser)
    │   ├── Dashboard.jsx       # Home logada (grid de serviços)
    │   ├── Scanner.jsx         # Hub: câmera ou galeria
    │   ├── CameraScanner.jsx   # Viewfinder + capture + flash
    │   ├── ScanMethodModal.jsx # Modal de seleção de método
    │   ├── Scanning.jsx        # Tela de loading OCR
    │   ├── Analyzing.jsx       # Tela de loading receitas (dicas do chef)
    │   ├── ShoppingList.jsx    # Lista editável + salvar (ATIVA)
    │   ├── Ingredients.jsx     # ⚠️ Versão antiga da lista (órfã?)
    │   ├── Suggestions.jsx     # Grid de receitas geradas
    │   ├── RecipeDetail.jsx    # Detalhe completo (hero + ingredientes + preparo)
    │   ├── Recipes.jsx         # ⚠️ Possível versão antiga (órfã?)
    │   ├── Loading.jsx         # ⚠️ Componente de loading genérico (órfão?)
    │   └── ResponsiveImage.jsx # ⚠️ Helper de imagem (órfão?)
    ├── context/
    │   └── RecipeContext.jsx   # Estado global: recipes, ingredients, user
    ├── hooks/
    │   ├── useCameraStream.js  # Câmera: getUserMedia + flash + cleanup
    │   └── useAudioRecorder.js # MediaRecorder → Blob webm/opus
    ├── lib/
    │   └── supabase.js         # Cliente Supabase singleton
    ├── services/
    │   ├── api.ts              # Camada HTTP (fetch) → backend Python
    │   └── recipeService.js    # CRUD Supabase + credits + slug + dev session
    ├── data/
    │   └── mockLists.js        # 4 listas mock (8/18/31/45 itens) p/ teste
    └── pages/
        ├── LoginPage.jsx           # Email/senha + signup
        ├── ConfirmationPage.jsx    # OTP de confirmação de email
        ├── ManualEntryPage.jsx     # Entrada manual de itens
        ├── VoiceInputPage.jsx      # Gravação + transcrição Whisper
        ├── RecipeDetailPage.jsx    # Wrapper: busca por índice/state
        ├── SavedRecipeDetailPage.jsx # Wrapper: busca por slug (público)
        ├── SavedRecipesPage.jsx    # Listagem "Livro de Receitas"
        ├── MyListsPage.jsx         # Listagem de listas salvas
        ├── SavedListDetailsPage.jsx # Detalhe de uma lista salva
        ├── ProfilePage.jsx         # Perfil + stats + créditos
        └── RecipeTestPage.jsx      # Debug: teste com mocks
```

---

## 🎨 4. DESIGN SYSTEM

### Paleta de Cores (`tailwind.config.js`)
| Token | HEX | Uso |
|---|---|---|
| `cream` | `#FDFBF7` | Fundo principal (light) |
| `sage` | `#81B29A` | Primário / CTAs / checks |
| `terracotta` | `#E07A5F` | Accent / destaques |
| `charcoal` | `#3D405B` | Texto principal (light) |
| Dark bg | `#171b19` | Fundo dark mode |

### Tipografia
- **Serif:** Playfair Display (títulos, nomes de pratos)
- **Sans:** Lato / Plus Jakarta Sans (corpo, UI)

### Dark Mode
- Estratégia: classe `.dark` no `<html>` + `darkMode: 'class'`
- Toggle: `Dashboard.jsx` (persistido em `localStorage.theme`)

### Animações customizadas
`float`, `pulse-ring`, `rotate-slow`, `steam-1/2/3` (vapor de comida)

---

## 🔀 5. MAPA DE ROTAS COMPLETO

### Rotas Públicas
| Rota | Componente | Descrição |
|---|---|---|
| `/` | `LandingPage` | Landing page v1 |
| `/index2` | `LandingPageV2` | Landing page v2 |
| `/v2` | `LandingPageModern` | Landing page v3 |
| `/login` | `LoginPage` | Login/Signup email+senha |
| `/confirmacao` | `ConfirmationPage` | Confirmação via OTP |
| `/r/:slug` | `SavedRecipeDetailPage` | Receita pública compartilhável |

### Rotas Protegidas (`ProtectedRoute`)
| Rota | Componente | Descrição |
|---|---|---|
| `/dashboard` | `Dashboard` | Home logada |
| `/scanner` | `Scanner` | Escolher câmera/galeria |
| `/scanning` | `Scanning` | Loading OCR |
| `/analyzing` | `Analyzing` | Loading receitas IA |
| `/lista` | `ShoppingList` | Lista de ingredientes editável |
| `/sugestoes` | `Suggestions` | Grid de receitas geradas |
| `/receita/:index` | `RecipeDetailPage` | Detalhe (memória/session) |
| `/entrada-manual` | `ManualEntryPage` | Digitar itens |
| `/entrada-voz` | `VoiceInputPage` | Ditar itens |
| `/minhas-receitas` | `SavedRecipesPage` | Receitas salvas |
| `/minhas-listas` | `MyListsPage` | Listas salvas |
| `/minhas-listas/:id` | `SavedListDetailsPage` | Detalhe de lista |
| `/perfil` | `ProfilePage` | Perfil + créditos |
| `/debug/recipes` | `RecipeTestPage` | Debug com mocks |

---

## 🔄 6. FLUXOS PRINCIPAIS (User Journeys)

### Fluxo A — Escanear Nota → Receitas
```
Landing → Login → Dashboard → Scanner
  → [Câmera: CameraScanner | Galeria: input file]
  → Scanning (loading)
  → POST /api/analisar-nota (OCR)
  → ShoppingList (editar ingredientes)
  → [Sugerir Receitas]
  → Analyzing (loading)
  → POST /api/sugerir-receitas (IA gera receitas + imagens)
  → [checkCredits → deductCredit]
  → Suggestions (grid)
  → RecipeDetail (/receita/:index)
  → [Salvar] → POST Supabase → /r/:slug
```

### Fluxo B — Entrada Manual
```
Dashboard → ManualEntryPage → (itens) → ShoppingList → ...mesmo fluxo
```

### Fluxo C — Entrada por Voz
```
Dashboard → VoiceInputPage
  → useAudioRecorder (grava webm/opus)
  → POST /api/voice/transcribe (Whisper)
  → parse (split por vírgula/quebra/" e ")
  → ManualEntryPage (state.initialItems) → ShoppingList
```

### Fluxo D — Receita Compartilhada
```
Usuário salva receita → gera slug → URL /r/:slug
Qualquer pessoa acessa → SavedRecipeDetailPage → getRecipeBySlug
```

---

## 🤖 7. INTEGRAÇÃO COM IA / BACKEND

### Endpoints da API (`services/api.ts`)
Base URL: `import.meta.env.VITE_API_URL` (dev: `localhost:8000/api` | prod: `api.jacomprei.app`)

| Método | Endpoint | Input | Output | IA |
|---|---|---|---|---|
| POST | `/api/analisar-nota` | `FormData{file}` | `{ingredientes: [{item, quantidade, categoria}]}` | OCR |
| POST | `/api/sugerir-receitas` | `{ingredientes: [{item, quantidade}]}` | `{receitas: [{nome_do_prato, ingredientes_usados, modo_de_preparo, tempo_preparo, difficulty, image_url, visual_tag, descricao_imagem, tag}]}` | LLM + Image Gen |
| POST | `/api/voice/transcribe` | `FormData{file: audio.webm}` | `{text: "..."}` | Whisper |
| POST | `/api/recipes/:id/extract-metadata` | — | (assíncrono, non-blocking) | Metadata extraction |

### Contrato de Receita (LLM → Frontend)
O frontend aceita variações (normalização defensiva):
```js
title = recipe.title || recipe.nome_do_prato
ingredients = recipe.ingredients || recipe.ingredientes_usados
steps = recipe.steps || recipe.modo_de_preparo
image = recipe.image_url || recipe.image
time = recipe.time || recipe.tempo_preparo
```

---

## 🗄️ 8. CAMADA DE DADOS (Supabase)

### Cliente (`lib/supabase.js`)
```js
createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
```

### Schema `jacomprei` — Tabelas

#### `profiles`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (FK auth.users) | — |
| `credits_balance` | int | Saldo de créditos |
| `subscription_tier` | enum | `user` / `founder` / `admin` / `dev` |

#### `recipes`
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `title` | text |
| `slug` | text (único) |
| `ingredients` | jsonb |
| `instructions` | jsonb |
| `image_url` | text |
| `visual_tag` | text |
| `is_public` | bool |
| `created_at` | timestamptz |

#### `shopping_lists`
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `title` | text |
| `items` | jsonb |
| `created_at` | timestamptz |

#### `credit_transactions`
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `amount` | int (-1 para débito) |
| `description` | text |

### Funções de Serviço (`recipeService.js`)
| Função | Operação |
|---|---|
| `ensureDevSession()` | Auto-login dev (só localhost) |
| `generateSlug(title)` | Slugify + sufixo HHMMSS |
| `saveRecipeToSupabase()` | INSERT recipe + trigger metadata |
| `getRecipeBySlug()` | SELECT por slug |
| `getSavedRecipes()` | SELECT por user_id |
| `saveShoppingList()` | INSERT lista |
| `getShoppingLists()` | SELECT por user_id |
| `deleteShoppingList()` | DELETE por id |
| `getShoppingListById()` | SELECT por id |
| `checkCredits()` | SELECT profile → allowed/isPrivileged/balance |
| `deductCredit()` | UPDATE credits_balance + INSERT transaction |

---

## 🔐 9. AUTENTICAÇÃO & SEGURANÇA

- **Método:** Email + Senha (Supabase Auth)
- **Confirmação:** OTP via email (`ConfirmationPage` → `verifyOtp`)
- **Proteção de rota:** `ProtectedRoute` valida com `supabase.auth.getUser()` (server-side)
- **Auto-login DEV:** Cria/usa `dev@jacomprei.com` / `senha123` apenas em `localhost` (flag `import.meta.env.DEV`)
- **Logout manual:** Setado via `sessionStorage('manual_logout')` para bloquear re-auto-login
- **Listener:** `onAuthStateChange` limpa estado global no logout

### Roles & Privilégios
| Tier | Comportamento |
|---|---|
| `dev` | Créditos ilimitados (bypass) |
| `admin` | Créditos ilimitados (bypass) |
| `founder` | (definido, sem bypass explícito) |
| `user` | Débito normal de créditos |

---

## ⚡ 10. RECURSOS AVANÇADOS

### Câmera (`useCameraStream.js`)
- `getUserMedia` com `facingMode: environment` (traseira)
- Resolução alvo: 1920×1080
- Suporte a **flash/torch** (se disponível via `track.getCapabilities()`)
- Cleanup agressivo (stop tracks no unmount)
- Guard contra race conditions (`activeRequestRef`)

### Áudio (`useAudioRecorder.js`)
- `MediaRecorder` → Blob `audio/webm`
- Echo cancellation + noise suppression + auto gain
- Timer de gravação
- Cleanup de tracks no unmount

### Cache Busting (`vite.config.js` + `App.jsx`)
- `VITE_BUILD_ID` gerado dinamicamente (timestamp) a cada build
- Ao detectar mudança → `localStorage.clear()` + `sessionStorage.clear()` + reload

---

## 📊 11. ESTADO ATUAL (Maturidade por Módulo)

| Módulo | Status | Maturidade |
|---|---|---|
| Landing pages | ✅ 3 versões | 🟢 Produção |
| Auth (email/senha) | ✅ Completo | 🟢 Produção |
| Scanner (câmera) | ✅ Completo | 🟢 Produção |
| OCR de notas | ✅ Integrado | 🟡 Depende do backend |
| Lista de compras | ✅ CRUD completo | 🟢 Produção |
| Entrada manual | ✅ Completo | 🟢 Produção |
| Entrada por voz | ✅ Whisper integrado | 🟡 Depende do backend |
| Geração de receitas IA | ✅ Completo | 🟡 Depende do backend |
| Detalhe de receita | ✅ Robusto | 🟢 Produção |
| Salvar receitas + slug | ✅ Completo | 🟢 Produção |
| Receita pública (/r/:slug) | ✅ Completo | 🟢 Produção |
| Listas salvas | ✅ CRUD | 🟢 Produção |
| Sistema de créditos | ⚠️ Base client-side | 🔴 Requer Edge Function |
| Perfil | ⚠️ Parcial | 🟡 Stats, falta edição |
| Pagamentos | ❌ Não iniciado | 🔴 Bloqueia monetização |
| PWA/Offline | ❌ Não iniciado | 🔴 Crítico p/ mobile |
| Testes | ❌ Zero | 🔴 Risco alto |

---

## 🗺️ 12. ROADMAP / BACKLOG PRIORIZADO

### 🔴 Prioridade Crítica (P0)
1. **Migrar `deductCredit` para Supabase RPC/Edge Function** — segurança + atomicidade
2. **Integrar Stripe (pagamentos)** — desbloqueia receita
3. **Transformar em PWA** — offline + instalável

### 🟠 Prioridade Alta (P1)
4. **Error Boundary + Toast system** — substituir `alert()`
5. **Refatorar `App.jsx`** — extrair handlers para hooks/services
6. **Migrar para TypeScript** — tipar contracts da IA
7. **Dashboard com dados reais** (estatísticas dinâmicas)
8. **Edição/Exclusão de receitas** + favoritar (❤️)

### 🟡 Prioridade Média (P2)
9. **Login social (Google)** — reduz fricção
10. **Busca e filtros** em receitas/listas
11. **Compartilhamento social** (Web Share API)
12. **Recuperação de senha** (forgot password)
13. **Limpeza de componentes órfãos** (Home, Ingredients, Recipes, Loading, ResponsiveImage)
14. **Consolidar 3 landing pages** em 1 final

### 🟢 Prioridade Baixa (P3)
15. **Testes automatizados** (Vitest + Testing Library)
16. **SEO + Meta tags + favicon + OG**
17. **Acessibilidade (a11y)** — ARIA, contraste, teclado
18. **Sentry** (error reporting produção)
19. **Remover debug UI** (prompt de imagem no `Suggestions`)
20. **Atualizar README** (ainda é template Vite)

---

## 🔑 13. VARIÁVEIS DE AMBIENTE

```env
# .env.local (desenvolvimento)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_URL=http://localhost:8000/api
VITE_API_BASE=http://localhost:8000        # usado em extract-metadata

# .env.production (commitado)
VITE_API_URL=https://api.jacomprei.app

# Gerado automaticamente (não definir manualmente)
VITE_BUILD_ID        # timestamp do build (vite.config.js)
```

---

## 📋 14. COMANDOS

```bash
npm run dev       # Servidor de desenvolvimento (Vite)
npm run build     # Build de produção
npm run preview   # Preview do build
npm run lint      # ESLint
```

---

## ⚠️ 15. RISCOS TÉCNICOS DOCUMENTADOS

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| R1 | `deductCredit` client-side manipulável | 🔴 Alto | Migrar para RPC/Edge Function |
| R2 | Race condition: check + deduct separados | 🔴 Alto | Operação atômica server-side |
| R3 | Credenciais DEV hardcoded | 🟡 Médio | Mover para env vars |
| R4 | Receitas em memória (perdem no refresh) | 🟡 Médio | Persistir rascunho |
| R5 | Contrato LLM não tipado | 🟡 Médio | Zod schema + TS |
| R6 | `console.log` em produção | 🟢 Baixo | Remover ou condicionar a DEV |
| R7 | Debug de prompt exposto na UI | 🟡 Médio | Remover antes de produção |
| R8 | 3 landing pages duplicadas | 🟢 Baixo | Consolidar |

---

## 📝 16. HISTÓRICO DE VERSIONAMENTO (Git)

| Commit | Descrição |
|---|---|
| `ada2bde` (HEAD → main) | atualização dos requirements |
| `9bd9c5a` | faltou uma coisa |
| `795adf7` | atualizações front e back |
| `167d33a` | novo requerimentos |
| `cdedc21` | mais atualizações para produção, como autenticação |
| `33bcd58` | adicionado sdk oficial revo |
| `0d79f2d` | mais um teste |
| `70753c7` | adicionando bibliotecas |
| `0a5296d` | commit antes do primeiro deploy MVP |
| `ac486c9` | receitas aprimoradas e imagens incríveis gibli |
| `c5ee974` | site funcional com alguns bugs na geração de imagens |
| `9fe4a2f` | Commit inicial limpo |

**Repo remoto:** `https://github.com/manylabsoficial/ja-comprei.git`

---

*Este blueprint é o documento vivo de referência do projeto. Atualize-o conforme novas funcionalidades são implementadas.*