# Handoff — sessão "Já Comprei: arquitetura dividida + redesign"

> Cole este arquivo (ou peça pro Claude ler) no início do novo chat:
> "Lê C:\Users\emanu\Documents\Projetos\Já comprei\docs\HANDOFF_SESSION.md e continua a partir daí."

## Contexto geral — dois repositórios envolvidos

1. **`C:\Users\emanu\Documents\Projetos\3D construtor de sites\cinematic-3d-site-builder`**
   — o pipeline que gera a landing 3D cinematográfica (brief YAML → site estático).
   ⚠️ **Não tem `.git` próprio** — a raiz do git aponta pra `C:\Users\emanu` inteiro.
   Nunca rodar `git add/commit` ali sem isolar antes.

2. **`C:\Users\emanu\Documents\Projetos\Já comprei`**
   — o produto real: `frontend-ja-comprei/` (React 19 + Vite + React Router 7 +
   Tailwind 4 + Framer Motion + Supabase) e `backend-ja-comprei/` (FastAPI).
   Tem `.git` próprio e saudável. **Atenção:** já havia mudanças não commitadas
   nesse repo ANTES desta sessão começar (ex: uma classe CSS já diferia do
   último commit) — ao revisar o diff final antes de commitar, ele vai incluir
   tanto essas mudanças prévias do usuário quanto as feitas nesta sessão,
   misturadas. Revisar linha por linha com o usuário antes de commitar.

Domínio real do produto: **`jacomprei.app`** (não `.com`). Backend já roda em
`api.jacomprei.app`.

## A decisão estratégica: Arquitetura Dividida

```
jacomprei.app          → landing 3D cinematográfica (estática, gerada pelo pipeline, SEO forte)
app.jacomprei.app      → o SPA React (o produto logado)
api.jacomprei.app      → backend (já existia)
```

Motivo: usuários buscam "receitas com IA" no Google — SEO importa muito. Um
SPA client-side puro (sem SSR) tem SEO fraco; a landing precisa ser HTML real
servido na raiz. Deploy: **Vercel, 2 projetos apontando pro mesmo repo GitHub**
(um com Root Directory = `frontend-ja-comprei/`, outro = `landing/`), cada um
com seu domínio.

## FRENTE A — Arquitetura/Deploy: status = completa do lado do código

### O que foi feito (não commitado ainda em nenhum dos dois repos)

**No pipeline** (`cinematic-3d-site-builder`):
- `pipeline/lib/build.js`: SEO completo condicionado a um novo campo `siteUrl`
  no brief — `og:image`/`og:url` absolutos, `<link rel="canonical">`, Twitter
  Card, JSON-LD (`SoftwareApplication`), `robots.txt` + `sitemap.xml` gerados
  automaticamente. Sem `siteUrl`, tudo cai pro comportamento relativo de
  sempre (testado, sem regressão).
- `pipeline/lib/build.js`: **roteamento inteligente do CTA** — script inline
  detecta `localhost`/`127.0.0.1`/`file://` e troca o link pro `cta.hrefDev`
  em vez do `cta.href` de produção. Testado de verdade com Playwright nos
  dois cenários (confirmado funcionando).
- `pipeline/lib/assets.js` + `ingest-manual-assets.js`: novo parâmetro
  `frameQuality` (WebP quality, default 90).
- `pipeline/lib/intake.js` + `plan.js`: threading de `siteUrl` e `font`.
- `briefs/schema.md`: documentado tudo acima.
- `briefs/ja-comprei.brief.yaml`: `siteUrl: https://jacomprei.app`,
  `cta.href: https://app.jacomprei.app/login`,
  `cta.hrefDev: http://localhost:5173/login` (porta default do Vite — ajustar
  se o front rodar noutra), `cta.button: Entrar` (era "Baixar o Já Comprei" —
  errado, é web/PWA por enquanto, sem `.apk`), `frameFps: 12`,
  `frameQuality: 80`, `frameMaxWidth: 1440` (landing pública otimizada).
- Landing final: **71MB → ~19MB** deployável (masters `.mp4` excluídos do
  deploy — não são carregados em runtime —, WebP q80, frames a 1440px, hero
  comprimido pra og:image de 4.7MB→1MB).

**No repo Já Comprei:**
- `frontend-ja-comprei/src/App.jsx`: `/` agora **redireciona pro `/login`**
  (`<Navigate to="/login" replace/>`). A `LandingPage` antiga (React) foi
  **desvinculada, não deletada** — mora agora em `/landing-classic`.
- `frontend-ja-comprei/src/components/AppLayout.jsx`: `hideNavRoutes`
  atualizado com as novas rotas.
- `frontend-ja-comprei/vercel.json` (novo arquivo): rewrite de SPA
  (`{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`) — sem
  isso, dar refresh em `/scanner` etc dá 404.
- **`landing/`** (pasta nova na raiz do repo, ~19MB): cópia do
  `output/ja-comprei/` do pipeline, sem `assets/clips/` (masters .mp4) e sem
  artefatos de QC internos (`qc/`, `qc-report.json`, `storyboard.json`).
  Precisa ser **re-sincronizada manualmente** toda vez que o brief do
  pipeline mudar (copiar, excluir clips, comprimir hero, copiar robots/
  sitemap). Não há script automatizado pra isso ainda — só fiz na mão.
- **`backend-ja-comprei/main.py`**: CORS corrigido — adicionado
  `"https://app.jacomprei.app"` ao `allow_origins` (sem isso, todas as
  chamadas de API do app quebrariam depois do split).

### Achado NÃO corrigido (decisão do usuário)
`backend-ja-comprei/main.py` linha ~44: `app.include_router(metadata_router.router, ...)`
mas `metadata_router` **nunca é importado** (linha 3 só importa `voice_router,
recipe_router, auth_router`). Deveria dar `NameError` na subida do backend.
Vale conferir se esse arquivo é mesmo o que roda em produção.

### O que só o usuário pode fazer (painel Vercel/DNS)
1. Criar o 2º projeto Vercel (Root Directory = `landing/`, sem build) →
   domínio raiz `jacomprei.app`.
2. Confirmar que o projeto atual (`frontend-ja-comprei`) fica em
   `app.jacomprei.app`.
3. DNS no Vercel: raiz → landing, `app.` → app.
4. Commit + push dos dois repos (nada foi commitado ainda — revisar
   `git status`/`git diff` primeiro, ver nota sobre mudanças pré-existentes).

## FRENTE B — Redesign UX: Fase 1 concluída e testada

### Como chegamos aqui
Rodei um **agente especialista em UX/UI** (Opus, em background) que leu o
código do app + o design system já documentado
(`Já comprei/MODERN_DARK_BENTO_DESIGN_SYSTEM.md`) e produziu uma proposta
completa: **`Já comprei/docs/DESIGN_PROPOSAL.md`** (528 linhas — diagnóstico,
princípios, tokens, redesign tela-a-tela com wireframes ASCII, jornada do
usuário, plano de rollout em 5 fases). **Leia esse arquivo antes de continuar
a Fase 2+** — ele é o roteiro completo.

**Diagnóstico central:** o app tinha dois universos brigando — landing nova
(dark/dourada/sans/cinematográfica) vs. telas internas (claras, creme
`#FDFBF7`, pastel sage/terracotta, serifa Playfair, **3 laranjas diferentes**
`#E07A5F`/`#ee522b`/`orange-600`, nenhum era o dourado da marca).

### Decisões travadas com o usuário
- **Tema:** escuro/dourado vira o **padrão** (primeira visita), mas o modo
  claro **continua disponível** via toggle (usuário pediu explicitamente,
  diferente da recomendação "só dark" do agente) — e o claro também precisou
  ganhar paleta coerente (não ficou com sage/terracotta antigo).
- **Fonte:** Plus Jakarta Sans confirmada (display + corpo).
- **Sequência:** Fase 1 inteira de uma vez (tokens + BottomNav), depois
  revisão em conjunto — não passo a passo miúdo.

### O que foi implementado na Fase 1 (arquivos tocados, todos em `frontend-ja-comprei/`)

- **`src/index.css`** — reescrita completa do bloco `@theme`:
  - Paleta **clara** (base, sem `.dark`): `surface-base #FBF6EC` (marfim
    quente), `text-primary #2A2118`, etc.
  - Paleta **escura** (`.dark { ... }` override): `surface-base #0c0906`,
    `text-primary #f3ead9`, etc — igual à landing.
  - **Dourado é o MESMO valor nos dois temas** (`gold-500 #e8b44a`, não varia).
  - Tokens novos: `surface-{base,sunken,raised,overlay,hover}`,
    `gold-{300,400,500,600,700}`, `on-gold`, `text-{primary,secondary,tertiary}`,
    `border-{subtle,default,strong,gold}`, `success/danger/warning/info`.
  - **Tipografia:** `--font-serif`/`--font-display`/`--font-sans` todos
    redefinidos pra `"Plus Jakarta Sans", "Inter", system-ui, sans-serif` —
    isso mata a serifa Playfair em QUALQUER lugar do app que use `font-serif`
    (classe Tailwind), sem precisar editar componente por componente.
    Google Fonts import podado (removidos Lato/Playfair/Newsreader/Noto —
    confirmado, via grep, que nenhum componente referenciava esses nomes).
  - **Aliases legados** (`cream`, `sage`, `terracotta`, `charcoal`, `primary`,
    `accent`, `text-main`, `text-muted`, `background-dark`) remapeados —
    ⚠️ **MAS COM UMA REGRA IMPORTANTE (bug real encontrado e corrigido):**
    esses aliases precisam ser **valores FIXOS**, não referências reativas
    (`var(--color-surface-base)` etc) aos tokens novos. Motivo: são usados em
    pares manuais espalhados pelo código, tipo `text-charcoal dark:text-cream`
    — se `cream` virasse uma referência reativa a `surface-base` (que é ESCURO
    em dark mode), o par `dark:text-cream` resultaria em texto quase-preto
    sobre fundo escuro. Isso literalmente aconteceu (título do login ficou
    ilegível), eu vi o bug ao vivo via screenshot e corrigi. `sage`/
    `terracotta`/`primary`/`accent` PODEM ser referências reativas a
    `gold-500` com segurança, porque gold-500 não muda entre temas.
  - Novo bloco `.dark { --color-surface-*: ...; --color-text-*: ...; ... }`.
  - `@layer base`: `html` usa `var(--color-surface-base)`/`var(--color-text-primary)`
    (sem mais `html.dark {}` separado — a variável já resolve sozinha); `h1..h6`
    força `var(--font-sans)` (era `var(--font-serif)` = Playfair).

- **`tailwind.config.js`** — atualizado em paralelo (cores/fontes), com
  comentário deixando claro que o `@theme` do CSS é a fonte real da verdade
  no Tailwind v4 (esse arquivo é só referência/fallback).

- **`src/hooks/useTheme.js`** (novo arquivo) — hook centralizado que
  substitui a lógica DUPLICADA que existia em `Dashboard.jsx` e
  `LandingPage.jsx` (cada um com seu próprio `useState`/`useEffect`/
  `localStorage`). Default agora é `'dark'` quando não há preferência salva
  (era `prefers-color-scheme`). Toggle continua funcionando nos dois sentidos.
  **Nota:** só migrei `Dashboard.jsx` pra usar o hook; `LandingPage.jsx`
  (agora em `/landing-classic`, rota legada/backup) ficou com a lógica antiga
  intacta — decisão consciente de não mexer no que é só histórico.

- **`src/components/Dashboard.jsx`** — trocada a lógica de tema duplicada
  pelo `useTheme()`. Removido import não usado de `useState`/`useEffect`
  (confirmado, via grep, que não eram usados em mais nada no arquivo).

- **`src/components/BottomNav.jsx`** — reescrito seguindo o wireframe da
  proposta (seção 4.10): barra de vidro fixa (`bg-surface-overlay/90
  backdrop-blur-xl`), FAB central dourado (`bg-gold-500 text-on-gold`) pro
  scan, item ativo em dourado (`text-gold-500`), **removido o comportamento
  de recolhimento** (o botão "Menu" que escondia a barra inteira — padrão
  imprevisível, chamado de ruim no diagnóstico).

- **`index.html`** — adicionado script inline bloqueante ANTES do `<head>`
  fechar, que lê `localStorage.getItem('theme')` e aplica `.dark` no
  `<html>` antes da primeira pintura. Sem isso, toda visita (mesmo com
  `.dark` sendo o padrão) piscava claro→escuro, porque o `useTheme` hook só
  aplica a classe depois do React montar (`useEffect`).

### Verificação feita (real, não suposição)
- `npm run build` passa limpo (2145 módulos, sem erro).
- Confirmei via `grep` no CSS compilado que as classes novas
  (`bg-gold-500`, `text-on-gold`, `bg-surface-overlay`,
  `border-border-subtle`, `text-text-tertiary`) foram **realmente geradas**
  (build sem erro não garante isso — classe ausente falharia silenciosamente).
- Servi o `dist/` real via um servidor HTTP local (com fallback de SPA,
  espelhando o `vercel.json`) e testei com Playwright:
  - **Modo escuro** (padrão): tela de login em `http://.../login` —
    `bg #0c0906`, `text #f3ead9`, fonte Plus Jakarta Sans, zero erro de
    console. Screenshot conferido visualmente.
  - **Achei e corrigi o bug do alias** (acima) nesse teste — o título
    "Bem-vindo de volta!" estava invisível antes da correção.
  - **Modo claro** (toggle): marfim quente, card branco, texto legível,
    dourado consistente — conferido depois de corrigir uma pegadinha do
    *harness de teste* (servidor de teste sem fallback de SPA dava página
    em branco no reload — não era bug do app, era do meu script de teste).
- `npm run lint`: 23 erros pré-existentes em arquivos **não tocados** por
  mim (`CameraScanner.jsx`, `Suggestions.jsx`, `RecipeContext.jsx`,
  `ConfirmationPage.jsx`, `ManualEntryPage.jsx`, `MyListsPage.jsx`,
  `SavedListDetailsPage.jsx`, e um erro de `refs` provavelmente em
  `LandingPage`/`LandingPageModern`). Rodei eslint isolado só nos arquivos
  que toquei (`Dashboard.jsx`, `BottomNav.jsx`, `AppLayout.jsx`,
  `useTheme.js`, `App.jsx`) — só 1 erro, pré-existente
  (`isAdmin` não usado, `App.jsx:116`, dentro de `handleGenerate`, função que
  eu nunca toquei).

### O que falta (Fases 2-5 do DESIGN_PROPOSAL.md — não iniciado)

- **Fase 2** (espinha dorsal da conversão): `LoginPage`/`ConfirmationPage`
  (polish visual além do que a cascata de tokens já deu), `Dashboard` (herói
  dourado "Escanear" em destaque, hoje é só mais um card entre 5; "continue
  de onde parou" trazendo comida), `ShoppingList` (check dourado, CTA pílula
  fixa, drawer no lugar do `prompt()` nativo), `Suggestions` (cards-imagem
  grandes com `layoutId` preparando o morph), `RecipeDetail` (hero
  full-bleed que "funde" no fundo escuro via `layoutId`, um só dourado em
  vez dos 3 laranjas).
- **Fase 3**: `ScanMethodModal`/`CameraScanner`/`Scanner` (moldura + linha de
  scan douradas), `Scanning`/`Analyzing` (momento cinematográfico em vez de
  spinner genérico), `ManualEntryPage`/`VoiceInputPage`.
- **Fase 4**: `SavedRecipesPage`/`MyListsPage`/`SavedListDetailsPage`/
  `SavedRecipeDetailPage` ("livro de receitas", empty states cuidados),
  `ProfilePage` (créditos como card-herói dourado, `alert()`/`confirm()` →
  drawers).
- **Fase 5**: transições de rota com `AnimatePresence`, stagger em listas,
  `prefers-reduced-motion`, textura de ruído sutil, limpeza final (remover
  "Modo Teste (Dev)" e o botão de prompt-debug da produção, QA de contraste
  WCAG AA).

## Coisas importantes pra não esquecer / gotchas

- Porta dev do Vite assumida em `cta.hrefDev` = `5173` (default) — confirmar
  se bate com o `npm run dev` real do usuário.
- Servidor de teste estático precisa de fallback pra `index.html` em
  qualquer rota (senão reload em rota client-side dá 404/branco) — isso é
  exatamente o que o `vercel.json` já resolve em produção.
- Aliases Tailwind legados **nunca devem virar `var()` reativo** se forem
  usados em pares manuais `dark:` espalhados pelo código — vale essa lição
  pras próximas fases também (checar cada componente antes de assumir que a
  cascata de tokens sozinha resolve).
- Repo Já Comprei tinha mudanças não commitadas ANTES desta sessão — revisar
  diff completo com o usuário antes de qualquer commit.
- Nada foi commitado em nenhum repo até agora nesta sessão inteira.

## Pra retomar

Pergunte ao usuário: seguir pra **Fase 2** do redesign (Login/Dashboard/
ShoppingList/Suggestions/RecipeDetail), ou primeiro revisar/commitar o que
já está pronto (Frente A + Fase 1 da Frente B)?
