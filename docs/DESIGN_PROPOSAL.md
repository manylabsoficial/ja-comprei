# Proposta de Redesign — "Já Comprei"
### Do balcão claro à cozinha cinematográfica: unificando a jornada landing → app

> **Objetivo:** fazer a experiência inteira — da landing pública premium até a última tela pós-login — parecer **um único produto**, estendendo a linguagem cinematográfica dourada/quase-preta da nova landing para dentro do app, sem sacrificar usabilidade.
>
> **Escopo desta entrega:** documento de proposta. Nenhum componente foi alterado. As decisões abaixo são opinativas e prontas para implementação em Tailwind 4 + Framer Motion.
>
> **Autor:** Design de Produto (Sênior UX/UI + Design System)
> **Data:** Julho / 2026

---

## Sumário
1. [Diagnóstico](#1-diagnóstico)
2. [Princípios de design](#2-princípios-de-design)
3. [Design system proposto (tokens)](#3-design-system-proposto)
4. [Redesign tela a tela](#4-redesign-tela-a-tela)
5. [Jornada do usuário](#5-jornada-do-usuário)
6. [Plano de implementação em fases](#6-plano-de-implementação-em-fases)

---

## 1. Diagnóstico

O app tem hoje **dois universos visuais brigando**. A landing nova é **dark, dourada, cinematográfica, sans-serif, "a comida é a estrela"**. As telas internas são **claras (creme), pastel terrosas (sage/terracotta), com títulos em serifa Playfair e uma paleta de acentos que virou arco-íris**. Um usuário que passa da porta de entrada para o produto sente que **trocou de app**.

As evidências vêm direto do código que li:

### 1.1 Cor — o divórcio mais grave
- **Landing (norte):** fundo `#0c0906`, accent `#e8b44a`, texto `#f3ead9`.
- **App interno** — `tailwind.config.js` e `src/index.css` definem o tema como:
  ```
  cream       #FDFBF7   ← fundo padrão (CLARO)
  sage        #81B29A   ← "primary"
  terracotta  #E07A5F   ← "accent"
  charcoal    #3D405B   ← texto (azul-acinzentado FRIO)
  ```
  O `@layer base` força `background-color: var(--color-cream)` no `html` — ou seja, **o app abre claro por padrão**. O dark mode existe, mas como um tema `#171b19` (verde-petróleo frio), que **não é** o `#0c0906` quente da landing.
- **`charcoal #3D405B` é um azul-arroxeado frio** — o oposto do "quase-preto quente" da marca. Todo texto e o FAB principal herdam esse tom frio.
- **Acentos viraram arco-íris.** No `Dashboard.jsx`, os cards de serviço usam `bg-terracotta`, `bg-sage`, `bg-amber-500`, `bg-indigo-500`, `bg-blue-500` — cinco famílias de cor sem sistema. `ProfilePage.jsx` ainda soma `from-terracotta to-orange-600`. `RecipeDetail.jsx` introduz um terceiro laranja (`#ee522b`) para o botão Salvar, diferente do terracotta `#E07A5F`. **Há três laranjas diferentes convivendo** e nenhum é o dourado da marca.

### 1.2 Tipografia — serifa onde a landing já a aboliu
- `index.css` força **todos** os headings em serifa: `h1..h6 { font-family: var(--font-serif) }` = **Playfair Display**. Confirmado em uso em `Dashboard` ("Chef!", "O que você quer fazer?"), `ShoppingList` ("Lista de Compras"), `Suggestions` (títulos de receita `font-serif text-2xl`), `RecipeDetail` (o container inteiro é `font-serif`), `ProfilePage`, `LoginPage`.
- A landing **acabou de abandonar a serifa** justamente porque dava ar "editorial/escritura". As telas internas ainda carregam esse ar antigo — é a segunda maior fonte de dissonância depois da cor.

### 1.3 Densidade, tom e chrome
- **Fundos brancos "cartão de receita".** `ShoppingList`, `Suggestions`, `RecipeDetail`, `ProfilePage` empilham `bg-white` sobre `bg-cream`: visual de "app de produtividade claro", não de "experiência apetitosa premium". A comida (a única fonte legítima de cor e calor) aparece pequena, em cards `aspect-[4/3]` cercados de branco.
- **`BottomNav` tem um padrão estranho:** um botão "Menu" flutuante no canto que **recolhe a barra inteira** (`translate-y`), e um FAB central deslocado `-top-5`. É engenhoso, mas foge do padrão de navegação previsível e cria um chrome ruidoso. O estado ativo usa `text-sage` (pastel), quase invisível no escuro.
- **Duas fontes de verdade de tema.** `App.jsx`, `Dashboard.jsx` e a landing cada um gerenciam `theme` no `localStorage` com lógica duplicada. O toggle Sol/Lua no header do Dashboard convida o usuário a sair do dark — mas o produto quer ser dark-first como a landing.
- **Microcopy/afdências de app antigo.** `prompt()`/`alert()` nativos para nomear lista e salvar (`ShoppingList`, `ProfilePage`), footer "© 2024", "Modo Teste (Dev)" exposto no Dashboard. Detalhes que quebram a sensação premium.
- **Continuidade zero.** A landing vende continuidade cinematográfica (3D no scroll, morph entre seções). No app, cada navegação é um corte seco. Card de receita → detalhe não tem transição compartilhada; o "wow" da porta de entrada evapora no primeiro clique.

**Resumo do diagnóstico:** a landing é um restaurante à luz de vela; o app é uma cozinha de escritório sob luz fluorescente. Mesma marca, dois mundos.

---

## 2. Princípios de design

Seis princípios guiam cada decisão daqui pra frente. Servem de régua para qualquer dúvida futura ("isso é Já Comprei?").

1. **Escuro premium, mas apetitoso — nunca frio.** Dark-first, mas o preto é *quente* (`#0c0906`, base marrom/torrado), não o zinc/azul de dashboard SaaS. O escuro existe para fazer a **comida brilhar** e o **dourado pulsar**, como luz de fogão numa cozinha à noite.

2. **A comida é a estrela; a UI é o garçom.** Fotografia de comida é a única fonte primária de cor. O chrome (barras, cards, textos) recua para tons escuros e dourado discreto. Imagem grande, edge-to-edge, com gradiente cinematográfico — nunca miniatura cercada de branco.

3. **Um só dourado, usado com disciplina.** `#e8b44a` é o único acento de marca. Ele significa "ação / valor / caminho principal" (CTAs, item ativo, créditos, destaques). Tudo que hoje é sage/terracotta/amber/indigo/azul colapsa em: **dourado (ação) + neutros quentes (estrutura) + 3 cores semânticas** (sucesso/erro/aviso). Regra: no máximo o dourado + a comida competem por atenção numa tela.

4. **Continuidade, não cortes.** A promessa da landing (movimento contínuo) atravessa a porta. Transições compartilhadas (card→detalhe via `layoutId`), reveals em stagger no scroll, e um mesmo vocabulário de easing (`ease-out-expo`) fazem a navegação *fluir* como uma câmera, não *saltar* como slides.

5. **Sans moderna, hierarquia por peso e escala — não por serifa.** Uma única família sans do sistema/moderna para tudo. Diferenciação vem de peso, tamanho e `tracking`, não de troca de família. Dá cara de app contemporâneo (o motivo exato da landing largar a serifa).

6. **Toque generoso, respiro intencional, movimento sentido.** Mobile-first: alvos ≥44px, um CTA primário claro por tela, espaçamento amplo. Animações são *sentidas, não vistas* (150–600ms), e respeitam `prefers-reduced-motion`.

---

## 3. Design system proposto

Tudo abaixo é derivado do trio-âncora (`#0c0906` / `#e8b44a` / `#f3ead9`) e implementável no bloco `@theme` do Tailwind 4 (substituindo o atual em `src/index.css`).

### 3.1 Paleta — Superfícies (quase-preto quente)
Rampa quente derivada do `#0c0906` (matiz ~30°, subindo em luminância). Substitui `cream` como base e o `#171b19` frio do dark.

| Token | Hex | Uso |
|---|---|---|
| `--surface-base` | `#0c0906` | Fundo do app (âncora) |
| `--surface-sunken` | `#080605` | Poços/inputs afundados, trilhos |
| `--surface-raised` | `#17110b` | Cards, barras, headers |
| `--surface-overlay` | `#211812` | Drawers, modais, menus, popovers |
| `--surface-hover` | `#2a1f15` | Hover de itens/linhas |
| `--surface-gold-tint` | `rgba(232,180,74,0.08)` | Fundo suave de item ativo/selecionado |

### 3.2 Paleta — Dourado (acento de marca)
| Token | Hex | Uso |
|---|---|---|
| `--gold-300` | `#f2cf85` | Texto/ícone dourado em hover, links |
| `--gold-400` | `#edc063` | Realces, bordas ativas |
| `--gold-500` | `#e8b44a` | **Accent primário** (âncora): CTA, ativo |
| `--gold-600` | `#cf9a34` | Estado pressed/active do CTA |
| `--gold-700` | `#a87a24` | Bordas douradas discretas, dividers |
| `--on-gold` | `#1a1206` | Texto/ícone SOBRE preenchimento dourado |
| `--gold-glow` | `rgba(232,180,74,0.28)` | Sombra/halo de elevação dourada |

### 3.3 Paleta — Texto (creme quente)
| Token | Hex | Uso |
|---|---|---|
| `--text-primary` | `#f3ead9` | Títulos, texto de alto contraste (âncora) |
| `--text-secondary` | `#c9bda6` | Corpo, subtítulos |
| `--text-tertiary` | `#8c8271` | Labels, captions, metadados |
| `--text-disabled` | `#5c554a` | Desabilitado, placeholder |
| `--text-on-gold` | `#1a1206` | Texto sobre botão dourado |

### 3.4 Paleta — Bordas / Divisores
| Token | Valor | Uso |
|---|---|---|
| `--border-subtle` | `rgba(243,234,217,0.07)` | Hairline padrão de cards |
| `--border-default` | `rgba(243,234,217,0.12)` | Separadores, inputs |
| `--border-strong` | `rgba(243,234,217,0.20)` | Ênfase, hover de card |
| `--border-gold` | `rgba(232,180,74,0.45)` | Foco, item ativo, CTA outline (borda "pílula" da landing) |

### 3.5 Paleta — Semântica (quente-harmonizada)
Substitui o arco-íris atual. Escolhidas para conviver com o dourado sem competir. Uso **exclusivamente semântico** — nunca decorativo.

| Token | Hex | Significado |
|---|---|---|
| `--success` | `#7fae6e` | Confirmado, salvo, item marcado (verde-erva quente) |
| `--danger` | `#d9603f` | Excluir, erro, sair (terracotta-vermelho — reaproveita o calor do antigo terracotta, agora só semântico) |
| `--warning` | `#e8b44a` | Aviso = o próprio dourado |
| `--info` | `#c9bda6` | Neutro informativo (sem azul) |

> **Regra de migração:** todo `sage` vira dourado (se é ação) ou `--text-secondary` (se é neutro); todo `terracotta`/`orange`/`#ee522b` vira `--gold-500` (CTA) ou `--danger` (destrutivo); `amber/indigo/blue` dos cards do Dashboard **saem** — os cards ficam neutros com ícone dourado.

### 3.6 Tipografia
Uma família sans moderna para tudo. As fontes modernas já estão importadas no `index.css` (**Plus Jakarta Sans**, Inter). Proposta: **Plus Jakarta Sans** como display+corpo (geométrica, contemporânea, boa em PT-BR), Inter como fallback. **Remover Playfair Display** e a regra `h1..h6 { font-family: serif }`.

| Papel | Tamanho (mobile → desktop) | Peso | Tracking |
|---|---|---|---|
| Display / Hero | `32px → 44px` | 700 | `-0.02em` |
| H1 tela | `26px → 32px` | 700 | `-0.015em` |
| H2 seção | `20px → 24px` | 600 | `-0.01em` |
| H3 card | `17px → 18px` | 600 | `0` |
| Body | `15px → 16px` | 400 | `0` |
| Body-strong | `15px → 16px` | 600 | `0` |
| Label / caption | `12px → 13px` | 600 | `0.04em` uppercase |
| Mono (debug) | `12px` | 400 | — |

Cor por padrão: títulos `--text-primary`, corpo `--text-secondary`, labels `--text-tertiary`.

### 3.7 Espaçamento
Escala base-4 (mantém compatível com Tailwind). Ritmo mobile-first.

| Token | px | Uso |
|---|---|---|
| `space-1` | 4 | Ícone↔texto interno |
| `space-2` | 8 | Gaps compactos |
| `space-3` | 12 | Padding interno pequeno |
| `space-4` | 16 | **Padding padrão de card / gutter da tela (mobile)** |
| `space-5` | 20 | Separação de blocos |
| `space-6` | 24 | Gap entre cards |
| `space-8` | 32 | Entre seções |
| `space-12` | 48 | Respiro de topo de conteúdo |
| Gutter tela | `px-4` mobile / `px-6` tablet / `max-w-2xl`–`max-w-5xl` centrado desktop |

### 3.8 Raios (radii)
Cheios e consistentes — a "pílula" da landing como assinatura.

| Token | px | Uso |
|---|---|---|
| `radius-sm` | 12 | Inputs, chips, badges |
| `radius-md` | 16 | Botões retangulares, ícones-container |
| `radius-lg` | 24 | **Cards** (padrão) |
| `radius-xl` | 28 | Drawers, modais, hero cards |
| `radius-pill` | 9999 | CTAs, FAB, avatar, toggles (assinatura da marca) |

### 3.9 Elevação / Sombra
Nada de sombra preta. Elevação no dark = **halo dourado + borda hairline + surface mais clara**.

| Token | Valor | Uso |
|---|---|---|
| `elev-0` | borda `--border-subtle` | Card em repouso (a diferença de surface já eleva) |
| `elev-1` | `0 4px 24px -8px rgba(0,0,0,0.6)` + `--border-subtle` | Card hover, header sticky |
| `elev-2` | `0 12px 40px -12px rgba(0,0,0,0.7)` | Drawer/modal |
| `elev-gold` | `0 8px 32px -8px var(--gold-glow)` | CTA primário, FAB ativo, elemento em foco |

### 3.10 Movimento (Framer Motion)
Um só vocabulário, ecoando a continuidade da landing.

- **Easing padrão (reveals):** `ease: [0.22, 1, 0.36, 1]` (ease-out-expo).
- **Spring (interações/toque):** `{ type: 'spring', stiffness: 300, damping: 30 }`.
- **Durations:** hover/press 150–200ms; reveals 400–600ms; transição de rota 350–450ms.
- **Entrada de tela:** `fadeInUp` (y:16→0, opacity) no container; **stagger 0.06s** em listas (cards de serviço, ingredientes, receitas).
- **Continuidade (assinatura):** transições de elemento compartilhado com `layoutId` — a **imagem do card de receita "vira" a hero da tela de detalhe** (morph), em vez de corte. Mesma ideia para o card de lista → detalhe da lista. É a tradução direta do "morph hero→seção" da landing para o app.
- **Transição de rota:** `AnimatePresence` no `<Routes>` com fade+slide sutil (12px) — dá sensação de câmera contínua, não de troca de página.
- **Acessibilidade:** envolver variantes num hook que zera deslocamentos quando `prefers-reduced-motion: reduce`.

### 3.11 Esqueleto `@theme` (Tailwind 4) — pronto para colar
```css
@theme {
  /* surfaces */
  --color-surface-base: #0c0906;
  --color-surface-sunken: #080605;
  --color-surface-raised: #17110b;
  --color-surface-overlay: #211812;
  --color-surface-hover: #2a1f15;
  /* gold */
  --color-gold-300: #f2cf85;
  --color-gold-400: #edc063;
  --color-gold-500: #e8b44a;
  --color-gold-600: #cf9a34;
  --color-gold-700: #a87a24;
  --color-on-gold: #1a1206;
  /* text */
  --color-text-primary: #f3ead9;
  --color-text-secondary: #c9bda6;
  --color-text-tertiary: #8c8271;
  /* semantic */
  --color-success: #7fae6e;
  --color-danger:  #d9603f;
  --color-warning: #e8b44a;
  /* type */
  --font-sans: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  /* radii */
  --radius-lg: 24px;
  --radius-xl: 28px;
}
/* base: dark-first, quente */
html { background: var(--color-surface-base); color: var(--color-text-primary);
       font-family: var(--font-sans); }
h1,h2,h3,h4,h5,h6 { font-family: var(--font-sans); } /* mata a serifa */
```

> **Decisão de tema:** o app passa a ser **dark-first, tema único** (como a landing). Remover o padrão claro `cream` e o toggle Sol/Lua do Dashboard na v1 do relançamento. (Se quiserem um "modo claro" no futuro, ele volta como opção secundária, não como default — mas recomendo lançar só o dark para máxima coesão.)

---

## 4. Redesign tela a tela

Legenda dos wireframes: `▓` imagem/comida · `◆` dourado · `·` neutro · `[ ]` container/card.

### 4.1 Login / Confirmação
**Hoje:** card `bg-white` centrado sobre creme, título Playfair, botão `bg-sage`. Parece um form de SaaS claro.

**Novo — "entrar na cozinha à noite":** fundo `--surface-base` com uma **foto de comida quente desfocada** atrás (mesmo gradiente cinematográfico da landing), card em vidro escuro `--surface-overlay` + `backdrop-blur`, borda hairline. CTA **pílula dourada** (a mesma da landing) fecha o loop visual com a porta de entrada.

```
┌──────────────────────────────┐
│      ▓▓ foto comida blur ▓▓   │  ← continuidade direta com a landing
│   ┌──────────────────────┐   │
│   │        [logo]        │   │  card vidro escuro, radius-xl
│   │  Bem-vindo de volta   │   │  sans 700, text-primary
│   │  Entre para cozinhar  │   │  text-tertiary
│   │  ┌────────────────┐  │   │
│   │  │ email          │  │   │  input surface-sunken, foco borda-gold
│   │  ├────────────────┤  │   │
│   │  │ senha       👁 │  │   │
│   │  └────────────────┘  │   │
│   │  (  ◆ Entrar  ◆  )   │   │  ← pílula dourada, on-gold, elev-gold
│   │  Não tem conta? Criar │   │  link gold-300
│   └──────────────────────┘   │
│      ← Voltar para o início   │
└──────────────────────────────┘
```
**Por quê:** o primeiro toque pós-landing precisa ser o mesmo mundo. Foto+dourado+pílula = zero ruptura. Substituir `alert()` de erro por banner inline com `--danger`.

### 4.2 Dashboard
**Hoje:** header claro com "Chef!" em serifa + toggle tema + logout; grid de 5 cards arco-íris; "Resumo Rápido" com números soltos; footer "© 2024" e botão "Modo Teste".

**Novo — "o que vamos cozinhar hoje?":** hero curto de boas-vindas sobre `--surface-base`, **ação primária gigante e inequívoca (Escanear)** em destaque dourado, métodos secundários em cards neutros com ícone dourado (sem arco-íris), e um bloco de "continue de onde parou" que traz a comida (receitas/listas recentes com thumbnail) para dentro.

```
┌──────────────────────────────┐
│ ◑ Olá, Emanuel      créditos◆5│  header surface-raised, avatar dourado
│                               │
│  O que vamos cozinhar          │  H1 sans 700
│  hoje?                         │
│ ┌───────────────────────────┐ │
│ │  ◆  ESCANEAR NOTA / GELAD. │ │ ← card-herói dourado, elev-gold, radius-xl
│ │  a partir do que você tem  │ │   (a ação nº1 do produto)
│ └───────────────────────────┘ │
│  ┌─────────┐ ┌─────────┐      │
│  │ ◆ Voz   │ │ ◆ Manual│      │  cards neutros, ícone dourado,
│  └─────────┘ └─────────┘      │  borda-subtle (sem 5 cores)
│                               │
│  Continue de onde parou        │  H2
│  [▓ receita] [▓ receita] →     │  thumbnails de COMIDA (carrossel)
│  ────────────────────────      │
│  Sua despensa · 12 itens ◆     │  stat em linha, dourado no número
└──────────────────────────────┘
```
**Por quê:** o Dashboard hoje trata escanear como "só mais um dos 5 quadradinhos". O produto **é** transformar o que você tem em receita → essa ação merece hierarquia dominante. Os 5 cards coloridos viram 1 herói dourado + 2 secundários neutros. "Resumo" abstrato dá lugar a **comida real** (retomar receitas), reforçando "a comida é a estrela". Remover toggle de tema (dark-first) e "Modo Teste" da produção.

### 4.3 Escolher método de scan (`ScanMethodModal`) + Captura (`CameraScanner`/`Scanner`)
**Novo — modal escuro em vidro, opções como pílulas:** Nota fiscal · Geladeira · Foto da galeria. A **câmera é full-bleed preta** (já é o ambiente natural do dark), com moldura de recorte em **dourado** e a animação de linha de scan em dourado (hoje `@keyframes scan` existe mas sem cor de marca).

```
CAPTURA (full screen preto)
┌──────────────────────────────┐
│  ✕                      ⚡flash│
│                               │
│     ┌───────────────────┐     │  moldura dourada (borda-gold)
│     │ ▓▓ nota / geladeira│     │
│     │ ─── scan line ◆ ───│     │  linha de scan dourada animada
│     └───────────────────┘     │
│   Alinhe a nota na moldura     │  text-secondary
│                               │
│        (   ◉ capturar   )     │  obturador pílula, halo dourado
│   [galeria]        [trocar cam]│
└──────────────────────────────┘
```
**Por quê:** captura já quer tela escura — aqui o dark-first *ajuda* a usabilidade (menos reflexo, foco no conteúdo). A moldura dourada amarra à marca.

### 4.4 Processando (`Scanning` / `Analyzing`)
**Novo — momento cinematográfico, não spinner:** fundo `--surface-base`, um **anel/partículas douradas** com `--animate-pulse-ring` já existente (recolorido para dourado), microcopy que conta a história ("Lendo sua nota…", "Encontrando receitas…"). Este é o único intervalo — use-o para vender premium, não para mostrar um `Loader2` genérico.

```
┌──────────────────────────────┐
│                               │
│            ◜◆◝                 │  anel dourado pulsando (pulse-ring)
│           ◆   ◆                │  faíscas/steam dourado (animate-steam)
│            ◟◆◞                 │
│   Analisando seus ingredientes │  sans 600, text-primary
│   Isso leva alguns segundos    │  text-tertiary
└──────────────────────────────┘
```
**Por quê:** transforma latência (o custo real de OCR/IA) em deleite de marca. Reaproveita animações que já existem no `index.css`.

### 4.5 Lista de ingredientes (`ShoppingList`)
**Hoje:** cards `bg-white` sobre creme, checkbox sage, CTA `bg-sage`, `prompt()` para nomear ao salvar.

**Novo — "confira a despensa":** linhas escuras `--surface-raised`, **checkbox dourado** (marcado = incluir na geração), item desmarcado esmaece. Header com contagem. CTA primário **pílula dourada fixa** ("Sugerir receitas"). Salvar vira **drawer** (não `prompt()` nativo).

```
┌──────────────────────────────┐
│ ←  Sua despensa        ◆salvar│  header surface-raised
│  8 itens · 6 selecionados      │  text-tertiary
│ ┌───────────────────────────┐ │
│ │ ◆✓  Pão Francês    4 un  ✎🗑│ │  linha surface-raised, radius-lg
│ ├───────────────────────────┤ │  check dourado
│ │ ◆✓  Mussarela    150g   ✎🗑│ │
│ │ ○   Detergente  (fora)  ✎🗑│ │  desmarcado = esmaecido
│ └───────────────────────────┘ │
│  + adicionar item              │  linha tracejada, hover borda-gold
│                               │
│ ══════════════════════════════│
│ (   ◆  Sugerir receitas  ◆  ) │  CTA pílula dourada FIXA (safe-area)
└──────────────────────────────┘
```
**Por quê:** o gesto central (incluir/excluir item da geração) fica óbvio com o check dourado. CTA fixo elimina o scroll até o fim. Drawer de salvar substitui o `prompt()` feio e alinha com os drawers já existentes na tela.

### 4.6 Sugestões (`Suggestions`)
**Hoje:** cards `bg-white` com imagem `aspect-[4/3]`, título serifa, badge pastel, botão sage. Comida existe mas é pequena entre branco.

**Novo — "cardápio cinematográfico":** cada receita é um **card imersivo de imagem grande** (`aspect-[4/5]` no mobile), com **gradiente escuro subindo** (`from-surface-base`), título+meta *sobre* a foto, badge dourado. O card inteiro é clicável (dispensa botão redundante). A comida ocupa a tela; o chrome some.

```
┌──────────────────────────────┐
│ ◑ Sugestões do Chef      🔍   │
│ 4 receitas com o que você tem  │  text-secondary
│ ┌───────────────────────────┐ │
│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  imagem grande, aspect-4/5
│ │▓▓  ◆ Rápido ▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  badge dourado no topo
│ │░░░░gradiente surface-base░░│ │
│ │ Macarrão à Carbonara       │ │  título SOBRE a foto (sans 700)
│ │ ⏱ 25min · ◆ Fácil          │ │  meta em creme/dourado
│ └───────────────────────────┘ │  (card todo clicável → layoutId)
│ ┌───────────────────────────┐ │
│ │▓▓▓  próxima receita  ▓▓▓▓▓│ │
│ └───────────────────────────┘ │
└──────────────────────────────┘
```
**Por quê:** materializa "a comida é a estrela". O card grande é mais apetitoso e mais tocável (alvo enorme). O `layoutId` na imagem prepara o morph para o detalhe. Remover o botão de "prompt debug" (`Eye`) da build de produção.

### 4.7 Detalhe da receita (`RecipeDetail`)
**Hoje:** hero de imagem 40vh (bom!) mas o corpo é creme/branco com serifa e três laranjas diferentes; botão Salvar em `#ee522b`.

**Novo — "a receita como uma cena":** hero **full-bleed** com gradiente `to-surface-base` (a foto funde no fundo escuro, continuidade real). Chega via **morph do card** (mesma imagem, `layoutId`). Meta em "pílulas" escuras com ícone dourado. Ingredientes com check dourado. Passos numerados com **marcador dourado**. Um único CTA: **Salvar (pílula dourada)**.

```
┌──────────────────────────────┐
│ ▓▓▓▓▓ HERO full-bleed ▓▓▓▓▓▓ │  ← imagem que veio do card (morph)
│ ← ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ♡    │
│ ░░░ gradiente → surface-base ░│
│  ◆ Rápido  ◆ Saudável         │  chips dourado-outline
│  Macarrão à Carbonara          │  H1 sans 700 sobre o fim do gradiente
│ ┌──────┬──────┬──────┐        │
│ │⏱25min│◆Fácil│👥 4  │        │  meta em cards surface-raised
│ └──────┴──────┴──────┘        │
│  Ingredientes           6      │
│ ┌───────────────────────────┐ │
│ │ ◆✓ 200g espaguete          │ │  check dourado
│ │ ◆✓ 100g bacon              │ │
│ └───────────────────────────┘ │
│  Modo de preparo               │
│  ◆1 ─ Ferva a água…            │  passo com marcador dourado + trilha
│  ◆2 ─ Frite o bacon…           │
│ (   ◆  Salvar receita  ◆  )    │  CTA pílula dourada (único)
└──────────────────────────────┘
```
**Por quê:** o hero que "derrete" no fundo escuro é a tradução literal da continuidade da landing. Unifica os três laranjas num só dourado. A serifa sai; a hierarquia vem de peso/escala.

### 4.8 Salvos — Receitas (`SavedRecipesPage`) e Listas (`MyLists` / detalhes)
**Novo — "seu livro de receitas":** grade 2-col de cards-imagem (mesma linguagem de Sugestões, menores), busca/filtro em pílula escura no topo. Listas salvas: linhas escuras com mini-thumbnails dos itens e data; toque abre detalhe com o mesmo morph. Empty state ilustrado ("Você ainda não salvou receitas — escaneie sua primeira nota") com CTA dourado, em vez de tela vazia.

```
RECEITAS SALVAS
┌──────────────────────────────┐
│ Meu livro de receitas          │
│ ( 🔍 buscar… )        ◆ filtro │  pílula escura
│ ┌──────────┐ ┌──────────┐     │
│ │▓▓▓▓▓▓▓▓▓▓│ │▓▓▓▓▓▓▓▓▓▓│     │  grid 2-col imagem
│ │ Carbonara│ │ Risoto   │     │
│ └──────────┘ └──────────┘     │
└──────────────────────────────┘
```
**Por quê:** consistência total com Sugestões/Detalhe = a jornada inteira "rima". Empty states cuidados elevam o premium onde o app hoje só mostra vazio.

### 4.9 Perfil (`ProfilePage`)
**Hoje:** avatar terracotta, card de créditos `from-terracotta to-orange-600`, stats coloridos, acordeão de preferências, `alert()` nos botões.

**Novo — "sua conta, mesmo mundo escuro":** avatar em círculo dourado-tint, **card de créditos como herói dourado** (o valor/plano é o que importa comercialmente — merece o dourado da marca), stats em cards neutros com número dourado, lista de ações em linhas escuras. Toggle de tema **removido** (dark-first); se mantido, vira uma linha discreta em Preferências.

```
┌──────────────────────────────┐
│         ◑ (avatar gold)        │
│         Emanuel                │  sans 700
│         emanuel@…  ◆ Fundador  │  badge dourado
│ ┌───────────────────────────┐ │
│ │ ◆ Créditos            ∞/12 │ │  card-herói dourado (elev-gold)
│ │ Plano Pro · gerenciar →    │ │
│ └───────────────────────────┘ │
│  ┌────────┐ ┌────────┐        │
│  │ ◆ 3    │ │ ◆ 5    │        │  stats neutros, número dourado
│  │ Receitas│ │ Listas │        │
│  └────────┘ └────────┘        │
│  Configurações                 │
│  ⚙ Preferências            →   │  linhas surface-raised
│  🔒 Trocar senha           →   │
│  💳 Trocar plano           →   │
│  ⏻ Sair da conta               │  --danger
└──────────────────────────────┘
```
**Por quê:** créditos = o motor de receita do negócio; dar a ele o dourado alinha marca e monetização. Trocar `alert()`/`confirm()` por drawers/modais escuros nativos do sistema.

### 4.10 `BottomNav` (chrome global)
**Hoje:** barra que **se recolhe** por um botão "Menu" no canto + FAB deslocado, ativo em `text-sage` (some no escuro).

**Novo — barra de vidro escuro fixa, previsível:** `--surface-overlay` + `backdrop-blur`, 4 abas + **FAB central "Escanear" dourado** (a ação nº1, sempre visível). Ativo = ícone+label **dourados** com um ponto/indicador. **Remover o recolhimento** (padrão imprevisível; navegação deve estar sempre à mão). `safe-area` respeitada.

```
┌──────────────────────────────┐
│  🏠      📖    (◆)    🛒    ◑  │  glass surface-overlay, blur
│ Início Receitas SCAN Listas Perfil│  ativo = dourado; FAB dourado elev-gold
└──────────────────────────────┘
```
**Por quê:** navegação é infraestrutura — deve ser estável e legível. O ativo dourado dá orientação clara no dark. O FAB dourado central repete a promessa "escanear é o coração".

---

## 5. Jornada do usuário

Fluxo ponta a ponta, com a fricção atual e como o redesign resolve:

| Etapa | Fricção hoje | Redesign |
|---|---|---|
| **Landing → Login** | Salto de mundo: dourado/escuro → form branco sage. | Login escuro com foto+pílula dourada: **continuidade imediata**, zero ruptura. |
| **Login → Dashboard** | 5 cards arco-íris; escanear não tem destaque; toggle tema convida a "escapar" do dark. | Herói dourado "Escanear"; secundários neutros; dark-first sem toggle. Ação nº1 óbvia. |
| **Dashboard → Método → Captura** | Método é "mais um quadradinho"; câmera clara destoa. | Modal escuro em pílulas → câmera full-bleed com moldura/scan dourados (dark ajuda a captura). |
| **Captura → Processando** | `Loader2` genérico; latência = tédio. | Momento cinematográfico dourado (anel/faíscas) que **vende premium** durante a espera. |
| **Processando → Lista** | Cards brancos, check sage apagado, CTA some no scroll, `prompt()` para salvar. | Linhas escuras, check dourado claro, **CTA pílula fixa**, drawer de salvar. |
| **Lista → Gerando → Sugestões** | Comida pequena entre branco; botão redundante por card. | Cards-imagem grandes clicáveis; a comida domina; `layoutId` prepara o morph. |
| **Sugestões → Detalhe** | Corte seco; corpo claro/serifa/3 laranjas. | **Morph da imagem** card→hero; hero funde no escuro; um só dourado; sans. |
| **Detalhe → Salvar → Salvos** | 3º laranja no Salvar; salvos sem identidade. | Salvar pílula dourada; salvos = "livro de receitas" na mesma linguagem; empty states cuidados. |
| **Perfil / Créditos** | Créditos em terracotta aleatório; `alert()` nas ações. | Créditos = herói dourado (alinha marca+monetização); ações em drawers escuros. |
| **Navegação (transversal)** | BottomNav recolhível imprevisível; ativo invisível. | Barra de vidro fixa, ativo dourado, FAB escanear sempre presente. |

**Ganho macro:** a jornada deixa de ser "landing linda → app funcional porém genérico" e passa a ser **uma cena contínua** — mesma luz, mesma cor, mesmo movimento, do primeiro scroll ao salvar a receita.

---

## 6. Plano de implementação em fases

Rollout incremental que **nunca quebra o app**: a Fase 1 troca a fundação de tokens (impacto global imediato e barato); as fases seguintes migram tela a tela sobre essa fundação. Como quase todo componente usa classes utilitárias ligadas a tokens (`bg-cream`, `text-charcoal`, `bg-sage`), **redefinir os tokens já reveste 60–70% do app de uma vez**.

### Fase 0 — Preparação (0,5 dia)
- Congelar a paleta/tokens deste doc. Adicionar **fonte Plus Jakarta Sans** (já importada) como `--font-sans`.
- Criar `src/lib/motion.js` com as variantes (`fadeInUp`, `stagger`, spring) + hook `useReducedMotion`.
- Criar um branch `redesign/dark-premium` e uma rota de "kitchen sink" (galeria de componentes) para validar tokens isoladamente.

### Fase 1 — Fundação global (o primeiro e mais impactante passo) (1–2 dias)
1. **Reescrever o `@theme` em `src/index.css`** com os tokens da seção 3.11: surfaces quentes, dourado, texto creme, semântica.
2. **Matar a serifa:** trocar `h1..h6 { font-family: serif }` por `--font-sans`.
3. **Dark-first, tema único:** remover o default claro do `@layer base` (fundo = `--surface-base`); remover a lógica de `theme`/`localStorage` duplicada em `App.jsx`/`Dashboard.jsx`/landing e o toggle Sol/Lua.
4. **Remapear aliases legados** para não quebrar componentes ainda não migrados: apontar `--color-cream → surface-base`, `--color-charcoal → text-primary`, `--color-sage → gold-500`, `--color-terracotta → gold-500`/`danger`. Assim, **o app inteiro fica dark+dourado no dia 1**, mesmo antes de tocar em cada tela.
5. **`BottomNav` + `AppLayout`** (chrome global, visível em toda tela logada): barra de vidro escuro, ativo dourado, FAB dourado, remover recolhimento. Alto ROI de coesão por ser onipresente.

> ✅ **Critério de saída da Fase 1:** navegar por todo o app já dá sensação dark/dourada coesa, sem nenhuma tela "branca". Nada quebrado (aliases garantem retrocompatibilidade).

### Fase 2 — Espinha dorsal da jornada de conversão (2–3 dias)
Ordem por impacto na jornada principal (a que todo usuário percorre):
1. **Login / Confirmação** — primeira impressão pós-landing.
2. **Dashboard** — herói dourado "Escanear", cards neutros, "continue de onde parou".
3. **ShoppingList** — check dourado, CTA pílula fixa, drawer de salvar (remove `prompt()`).
4. **Suggestions** — cards-imagem grandes + `layoutId` na imagem.
5. **RecipeDetail** — morph do hero, um só dourado, meta/steps dourados.

### Fase 3 — Captura e deleite (1–2 dias)
6. **ScanMethodModal / CameraScanner / Scanner** — modal escuro, moldura+scan dourados.
7. **Scanning / Analyzing** — momento cinematográfico (reaproveita `pulse-ring`/`steam`, recolorido).
8. **ManualEntryPage / VoiceInputPage** — inputs escuros, mic com halo dourado.

### Fase 4 — Biblioteca e conta (1–2 dias)
9. **SavedRecipesPage / MyListsPage / SavedListDetails / SavedRecipeDetail** — "livro de receitas", empty states.
10. **ProfilePage** — créditos como herói dourado; `alert()`/`confirm()` → drawers.

### Fase 5 — Continuidade e polish (1–2 dias)
11. **Transições de rota** com `AnimatePresence` (fade+slide) — a "câmera contínua".
12. Stagger nos reveals de lista; `prefers-reduced-motion`.
13. Textura de ruído sutil global (`opacity ~0.02`) e gradiente quente ambiente para profundidade.
14. Limpeza: remover "Modo Teste (Dev)" e botão de prompt-debug da produção; atualizar footer/versão; QA de contraste (WCAG AA: creme sobre `#0c0906` passa folgado; validar dourado como texto só em ≥16px/bold).

> **Estimativa total:** ~8–12 dias de front, com **valor visível já no fim da Fase 1** (app inteiro vira dark/dourado) e a jornada de conversão coesa ao fim da Fase 2.

---

### Anexo — Decisões que peço para o time bater o martelo
1. **Lançar só dark** (recomendado, máxima coesão) vs. manter modo claro como opção secundária. Minha recomendação: só dark na v1.
2. **Plus Jakarta Sans** como display+corpo (já importada) — confirmar ou eleger outra sans moderna (Inter/Geist/Satoshi).
3. **Remover o recolhimento do BottomNav** (recomendado) — confirmar que ninguém depende desse comportamento.

*Fim da proposta.*
