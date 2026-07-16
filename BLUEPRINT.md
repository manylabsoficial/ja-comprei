# 📘 BLUEPRINT — Já Comprei

> Documento mestre do projeto. Visão, arquitetura, auditoria de IA e backlog.
> Gerado em 26/06/2026.

---

## 1. IDENTIDADE DO PRODUTO

**Já Comprei** é um assistente culinário mobile-first que transforma sua nota fiscal (ou lista digitada/ditada) em receitas personalizadas geradas por IA.

**Fluxo principal:** Fotografa → Extrai ingredientes → Sugere receitas com imagens → Salva e compartilha.

**Posicionamento:** "Sua despensa inteligente — do recibo à receita."

**Público-alvo:** Brasileiros que fazem compras de supermercado e querem ideias do que cozinhar com o que já têm em casa, sem precisar pensar.

---

## 2. STACK TECNOLÓGICA

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React (Vite) | 19.2 |
| Roteamento | React Router DOM | 7.12 |
| Estilo | Tailwind CSS | 4.1 |
| Animações | Framer Motion | 11.18 |
| Ícones | Lucide React | 0.562 |
| Linguagem Frontend | JavaScript (JSX) + 1 arquivo TS | — |
| Backend | FastAPI (Python) | 3.12 |
| Banco/Backend-as-Service | Supabase | SDK JS 2.90 |
| LLM Principal | Groq API (OpenAI-compatible) | — |
| LLM Alternativo | DeepSeek API (OpenAI-compatible) | — |
| Imagens | Pollinations.ai | flux |
| Transcrição | Groq Whisper | Large V3 Turbo |
| Email Transacional | Brevo | API |

**Domínios:**
- Frontend: Hospedagem Vite estática
- API: `api.jacomprei.app`
- Backend: FastAPI server (render/railway)

---

## 3. ARQUITETURA DO SISTEMA

```
[Frontend React]
     │
     ├── POST /api/analisar-nota        → OCR de nota fiscal
     ├── POST /api/sugerir-receitas     → Geração de receitas + imagens
     ├── POST /api/voice/transcribe     → Transcrição de áudio (Whisper)
     └── POST /api/recipes/:id/extract-metadata → Extração de metadados
     │
     ▼
[Backend FastAPI]
     │
     ├── app/routers/recipe_router.py   → Endpoints de receita
     ├── app/routers/voice_router.py    → Endpoint de voz
     ├── app/routers/metadata_router.py → Endpoint de metadados
     │
     ├── app/services/groq_service.py   → Cliente Groq (LLM + Vision + Audio)
     ├── app/services/ai_orchestrator.py → Orquestração multi-passo
     ├── app/services/pollinations_service.py → Imagens Ghibli
     ├── app/services/metadata_extractor.py → Extração de metadados
     │
     └── app/core/config.py             → Configurações e modelos
     │
     ▼
[Supabase]
     ├── jacomprei.profiles             → Usuários + créditos
     ├── jacomprei.recipes              → Receitas salvas
     ├── jacomprei.shopping_lists       → Listas de compras
     ├── jacomprei.credit_transactions  → Histórico de créditos
     └── jacomprei.user_recipe_metadata → Memória Evolutiva
```

---

## 4. PIPELINE DE IA (Fluxo Completo)

```
1. ENTRADA DE INGREDIENTES
   ├── Scanner (câmera/galeria) → POST /api/analisar-nota
   │   └── Groq Vision (Scout 17B) → OCR + classificação de itens
   ├── Entrada Manual → lista direta de itens
   └── Entrada por Voz → POST /api/voice/transcribe
       └── Groq Whisper → texto → parse de ingredientes

2. GERAÇÃO DE RECEITAS → POST /api/sugerir-receitas
   ├── Busca Memória Evolutiva (últimas 20 receitas do usuário)
   ├── Agrega preferências (proteínas, métodos, sabores, custo)
   ├── Monta CHEF_SYSTEM_PROMPT com instruções dinâmicas
   ├── Groq Heavy (DeepSeek V4 Flash) → JSON com receitas + visual_tag
   └── Validação Pydantic (ReceitasResponse)

3. GERAÇÃO DE IMAGENS (para cada receita)
   ├── visual_tag + estilo Ghibli → Pollinations.ai/flux
   └── URL injetada no JSON de resposta

4. PERSISTÊNCIA (quando usuário salva)
   ├── INSERT em jacomprei.recipes (Supabase)
   ├── Dedução de crédito (1 por geração)
   └── Async: POST /api/recipes/:id/extract-metadata
       └── Groq Fast analisa receita → extrai 12 campos de metadados
```

---

## 5. AUDITORIA DE PROMPTS DE IA

**Data:** 26/06/2026 | **Nota geral:** 5/10 — Funcional mas no estágio MVP artesanal.

### 5.1 Mapa de Prompts

| # | Prompt | Arquivo | Modelo Atual | Nota |
|---|---|---|---|---|
| P1 | CHEF_SYSTEM_PROMPT | `groq_service.py:12` | Llama 3.3 70B | 6/10 |
| P2 | OCR Vision | `groq_service.py:184` | ❌ Maverick (deprecado) | 3/10 |
| P3 | Parse Ingredients | `groq_service.py:161` | Llama 3.1 8B | 2/10 |
| P4 | Metadata Extraction | `metadata_extractor.py:11` | Llama 3.1 8B | 4/10 |
| P5 | Image Generation | `pollinations_service.py:17` | Pollinations flux | 4/10 |
| P6 | User Preferences Summary | `metadata_extractor.py:70` | — (código, não prompt) | 5/10 |

### 5.2 Problemas por Prompt

#### P1 — CHEF_SYSTEM_PROMPT (`groq_service.py:12-111`)
O prompt principal de geração de receitas (~100 linhas).

**Problemas:**
1. **Zero-shot puro.** Nenhum exemplo de receita bem-formada. Sem few-shot, o modelo adivinha o formato.
2. **Tom hostil.** Abuso de CAPS NEGATIVOS: "Proibido", "NÃO", "JAMAIS", "OBRIGATÓRIO" — cria resistência no modelo.
3. **Regras contraditórias.** Seção 5.4 "não há limite máximo de passos" vs 5.5 "cada passo UMA ÚNICA ação".
4. **Princípios cegos.** Maillard é bom para carnes mas irrelevante para salada de frutas. O modelo não sabe quando aplicar cada um.
5. **Despensa Virtual inflada.** Assume 11 itens básicos. Se o usuário só tem 2 ingredientes, a receita pode depender de 7 que ele não tem.
6. **Visual tag sem exemplos.** "Descreva o que se VÊ, não o que se chama" é boa instrução, mas sem exemplos o modelo gera nomes em vez de descrições.
7. **Injeção dinâmica frágil.** `.format(dynamic_instructions=...)` quebra se o texto contiver `{}`.
8. **Sem proteção contra prompt injection.** `ingredients_str = ", ".join(ingredients)` injeta dados brutos do usuário.
9. **Exploitation/Exploration por fórmula fixa.** `num_exploration` = 1, 1, 3, 5 sem adaptação real ao perfil do usuário.
10. **Sem instrução de fallback.** Se ingredientes não combinam, o prompt não orienta o que fazer.

**Recomendações:**
- Adicionar 2-3 exemplos few-shot de receitas completas com `modo_de_preparo` e `visual_tag`
- Substituir CAPS NEGATIVOS por guidelines condicionais: "Quando houver proteínas, prefira selar/dourar. Para vegetais, prefira refogar ou grelhar."
- Migrar para string template seguro (Jinja2 ou similar) com escape de variáveis
- Sanitizar lista de ingredientes contra injection
- Calcular exploração baseado em diversidade de preferências (não fórmula fixa)
- Adicionar regra de fallback: "Se ingredientes não combinam, retorne a melhor receita possível com os 3 ingredientes mais versáteis."

#### P2 — OCR Vision (`groq_service.py:184-190`)
Prompt de extração de itens de nota fiscal (~4 linhas).

**Problemas:**
1. **Extremamente curto** para recibos fiscais brasileiros (NFC-e, SAT, Cupom Fiscal).
2. **Zero exemplos.** Sem referência do que é um recibo brasileiro típico.
3. **Sem instruções sobre qualidade da foto.** Papel térmico, dobras, glare.
4. **Classificação de categorias ambígua.** Sem definição do que é "alimento" vs "outros".
5. **Prompt em português para modelo majoritariamente inglês.** Melhor performance com prompts em inglês para tarefas estruturadas.
6. **Sem chain-of-thought.** Modelo forçado a produzir JSON direto sem raciocinar.

**Recomendações:**
- Reescrever em inglês para melhor performance do modelo
- Adicionar 2-3 exemplos de recibos brasileiros com output esperado
- Incluir instruções sobre recibos fiscais brasileiros (campos comuns, formatos)
- Adicionar chain-of-thought: "Primeiro identifique o tipo de documento, depois extraia os itens..."
- Definir claramente cada categoria com exemplos

#### P3 — Parse Ingredients (`groq_service.py:161`)
Prompt de parsing de texto para ingredientes estruturados (1 frase).

**Problemas:**
1. **Prompt de 1 frase.** Sem formato, exemplos ou regras.
2. **System prompt em inglês + input em português.** Inconsistência de idioma.
3. **Sem validação Pydantic no output.** Diferente do Vision, sem schema validation.

**Recomendações:**
- Reescrever com exemplos de parsing de texto em português
- Adicionar validação Pydantic no resultado (criar schema `ParsedIngredients`)
- Incluir regras para quantidades brasileiras ("1 cx", "2 pcts", "1 kg", "500g")

#### P4 — Metadata Extraction (`metadata_extractor.py:11-35`)
Prompt de extração de metadados de receitas salvas.

**Problemas:**
1. **System prompt vazio + instruções no user message.** As 12 regras vão no user, mas o modelo prioriza o system.
2. **Sem exemplos de extração correta.** 12 campos sem referência entrada→saída.
3. **Campos com viés cultural.** "custo_estimado" no Brasil — sem referência, o modelo alucina.
4. **Pydantic literals em português.** `"facil", "medio", "dificil"` — modelo frequentemente retorna `"fácil"` ou `"easy"`.

**Recomendações:**
- Mover instruções para o system prompt
- Adicionar 2 exemplos de entrada→saída
- Relaxar validação para aceitar variantes (normalizar acentos, traduzir)
- Fornecer referência de preços brasileiros para custo_estimado

#### P5 — Image Generation (`pollinations_service.py:17-18`)
Prompt de geração de imagens Ghibli.

**Problemas:**
1. **Sufixo idêntico para TODAS as receitas.** Toda imagem com o mesmo estilo, sem variação.
2. **Sem variação de seed.** Imagens com mesmo visual_tag podem ser idênticas.
3. **Negative prompt básico.** Sem especificidades Ghibli.
4. **Dimensões fixas 1024×1024.**
5. **Enhance=false** desligado.
6. **Config ignora POLLINATIONS_MODEL.** `config.py` diz `turbo` mas `pollinations_service.py` hardcoded `flux`.

**Recomendações:**
- Criar 3-4 variações de estilo Ghibli (café da manhã, almoço/jantar, lanche, sobremesa)
- Adicionar seed aleatório documentado
- Melhorar negative prompt com termos específicos: "modern anime, CGI, sketch, chibi, 3D, deformed"
- Ativar enhance=true no Pollinations
- Unificar config e código para `flux`
- Adicionar aspect ratios diferentes (hero 16:9, card 1:1)

#### P6 — User Preferences Summary (`metadata_extractor.py:70-113`)
Agregação do Memória Evolutiva (código, não prompt).

**Problemas:**
1. **Agregação ingênua.** Counter sem peso temporal. Receita de 6 meses = peso de ontem.
2. **Limit fixo de 20 registros.** Power users perdem contexto.
3. **Porcentagens truncadas.** `v*100//total` perde casas decimais.
4. **Formato textual injetado no prompt.** `.format()` pode quebrar com caracteres especiais.

**Recomendações:**
- Peso exponencial por recência (ex: peso = 0.9^(meses desde criação))
- Aumentar limit para 50 ou parametrizar por tier do usuário
- Usar floats para porcentagens (1 casa decimal)
- Template seguro para injeção

### 5.3 Problemas Arquiteturais Transversais

| # | Problema | Impacto |
|---|---|---|
| 1 | **Sem versionamento de prompts.** Impossível A/B testing ou rollback. | Melhorias sem métrica. |
| 2 | **Sem logging de qualidade.** Sem taxa de parse JSON, validação Pydantic, distribuição de tipos de receita. | Melhorias no escuro. |
| 3 | **Sem cache de respostas.** Ingredientes idênticos = nova chamada à API. | Desperdício de créditos. |
| 4 | **Sem timeout/recovery para respostas truncadas.** Max tokens no meio do JSON = parse quebra. | Falha silenciosa. |
| 5 | **Dependência única da Groq.** Fora do ar = app inteiro parado. | Single point of failure. |
| 6 | **Modelos fixos no código.** Sem hot-swap de modelos. | Rigidez operacional. |
| 7 | **Sem moderação de conteúdo.** Receitas não passam por filtro de segurança. | Risco de conteúdo inadequado. |
| 8 | **json_mode em vez de structured output / tool calling.** Menos confiável. | Maior taxa de JSON malformado. |
| 9 | **Sem streaming.** Todas as respostas são síncronas e bloqueantes. | UX lenta. |

---

## 6. AUDITORIA DE MODELOS DE IA

**Data:** 26/06/2026

### 6.1 Modelos Atuais

| Constante | Modelo | Provedor | Preço Input | Preço Output | Status |
|---|---|---|---|---|---|
| `MODEL_HEAVY` | `llama-3.3-70b-versatile` | Groq | $0.59 | $0.79 | 🟢 Production |
| `MODEL_FAST` | `llama-3.1-8b-instant` | Groq | $0.05 | $0.08 | 🟢 Production |
| `MODEL_VISION` | `meta-llama/llama-4-maverick-17b-128e-instruct` | Groq | ❓ | ❓ | 🔴 **AUSENTE** |
| `MODEL_AUDIO` | `whisper-large-v3-turbo` | Groq | $0.04/h | — | 🟢 Production |
| `POLLINATIONS_MODEL` | `turbo` (config) / `flux` (código) | Pollinations | — | — | ⚠️ Inconsistente |

### 6.2 🚨 CRÍTICO: MODEL_VISION Está Ausente da Groq

O modelo `meta-llama/llama-4-maverick-17b-128e-instruct` **não consta em nenhuma lista atual da Groq** (Production, Preview ou Deprecated). As chamadas de OCR podem já estar falhando ou prestes a falhar.

**Substituto imediato:** `meta-llama/llama-4-scout-17b-16e-instruct` (Preview, $0.11/$0.34, 750 tps, multimodal).

### 6.3 Cenários de Upgrade

#### Cenário A: Groq Puro (menor atrito)
Trocar modelos dentro da Groq, sem adicionar provedor.

| Função | Atual | Proposto | Economia |
|---|---|---|---|
| Heavy | Llama 3.3 70B ($0.59/$0.79) | GPT-OSS 120B ($0.15/$0.60) | 75% input / 24% output |
| Fast | Llama 3.1 8B ($0.05/$0.08) | GPT-OSS 20B ($0.075/$0.30) | Custo sobe, qualidade triplica |
| Vision | ❌ Maverick (deprecado) | Scout 17B ($0.11/$0.34) | Correção |
| Audio | Whisper Turbo ($0.04/h) | Manter | — |

**Custo mensal estimado (1K receitas):** ~$8-14

#### Cenário B: Híbrido Groq + DeepSeek (recomendado)
Melhor custo-benefício, multi-provider para resiliência.

| Função | Modelo | Provedor | Preço |
|---|---|---|---|
| Heavy | `deepseek-v4-flash` | DeepSeek API | $0.14/$0.28 |
| Heavy (fallback) | `openai/gpt-oss-120b` | Groq | $0.15/$0.60 |
| Fast | `openai/gpt-oss-20b` | Groq | $0.075/$0.30 |
| Vision | `meta-llama/llama-4-scout-17b-16e-instruct` | Groq | $0.11/$0.34 |
| Audio | `whisper-large-v3-turbo` | Groq | $0.04/h |
| Imagens | `flux` | Pollinations | — |

**Custo mensal estimado (1K receitas):** ~$6-10

#### Cenário C: DeepSeek Máximo (menor custo)
Migrar tudo que for possível para DeepSeek.

| Função | Modelo | Provedor | Preço |
|---|---|---|---|
| Heavy | `deepseek-v4-flash` | DeepSeek | $0.14/$0.28 |
| Fast | `deepseek-v4-flash` | DeepSeek | $0.14/$0.28 |
| Vision | `meta-llama/llama-4-scout-17b-16e-instruct` | Groq | $0.11/$0.34 |
| Audio | `whisper-large-v3-turbo` | Groq | $0.04/h |

**Custo mensal estimado (1K receitas):** ~$5-8

### 6.4 Comparativo de Modelos para Geração de Receitas

| Modelo | Provedor | Preço (in/out) | Contexto | Max Output | Reasoning |
|---|---|---|---|---|---|
| Llama 3.3 70B *(atual)* | Groq | $0.59/$0.79 | 131K | 32K | ❌ |
| GPT-OSS 120B | Groq | $0.15/$0.60 | 131K | 65K | ✅ |
| Qwen3-32B | Groq | $0.29/$0.59 | 131K | 40K | ✅ |
| **DeepSeek V4 Flash** | DeepSeek | **$0.14/$0.28** | **1M** | **384K** | ✅ |
| DeepSeek V4 Pro | DeepSeek | $0.435/$0.87 | 1M | 384K | ✅ |

**Conclusão:** DeepSeek V4 Flash é 76% mais barato que o atual com 12x mais output (384K vs 32K). Isso elimina o problema de truncamento de receitas longas — crítico para compras de 30+ itens onde o sistema gera até 12 receitas.

### 6.5 Recomendação Final

Adotar o **Cenário B (Híbrido Groq + DeepSeek)** como arquitetura alvo:

1. **Migrar Heavy → DeepSeek V4 Flash** (ganho massivo em custo e qualidade)
2. **Manter GPT-OSS 120B na Groq como fallback** do Heavy
3. **Migrar Fast → GPT-OSS 20B na Groq** (melhor parsing)
4. **Corrigir Vision → Scout 17B** (URGENTE — modelo atual deprecado)
5. **Manter Whisper Turbo** (já é o ideal)
6. **Unificar Pollinations → `flux`** (corrigir inconsistência config vs código)

---

## 7. RISCOS TÉCNICOS

| # | Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|---|
| R1 | `MODEL_VISION` deprecado → OCR quebrado | 🔴 Crítico | 🔴 Certo | Trocar para Scout 17B imediatamente |
| R2 | `deductCredit` client-side manipulável | 🔴 Alto | 🟠 Média | Migrar para Supabase RPC/Edge Function |
| R3 | Race condition: check + deduct separados | 🔴 Alto | 🟠 Média | Operação atômica server-side |
| R4 | Groq fora do ar = app parado | 🔴 Alto | 🟡 Baixa | Adicionar DeepSeek como fallback |
| R5 | Prompt injection via ingredientes | 🟠 Médio | 🟠 Média | Sanitizar input antes de injetar no prompt |
| R6 | Receitas truncadas (32K max output) | 🟠 Médio | 🟠 Média | Migrar para DeepSeek (384K output) |
| R7 | JSON malformado sem recovery | 🟠 Médio | 🟡 Baixa | Retry com temperatura menor + reparo de JSON |
| R8 | Credenciais DEV hardcoded | 🟡 Médio | 🟢 Baixa | Mover para env vars |
| R9 | Receitas em memória (perdem no refresh) | 🟡 Médio | 🟢 Baixa | Persistir rascunho no sessionStorage |
| R10 | Debug de prompt exposto na UI | 🟡 Baixo | 🟢 Alta | Remover antes de produção |
| R11 | 3 landing pages duplicadas | 🟡 Baixo | 🟢 Alta | Consolidar em 1 |

---

## 8. BACKLOG PRIORIZADO

### 🔴 P0 — Bloqueios de Produção (antes do lançamento público)

| # | Tarefa | Esforço |
|---|---|---|
| P0-1 | **Corrigir MODEL_VISION:** trocar `llama-4-maverick` → `llama-4-scout-17b` | 30 min |
| P0-2 | **Unificar Pollinations:** corrigir config `turbo` → `flux` | 5 min |
| P0-3 | **Adicionar DeepSeek como provedor:** criar `DeepSeekService`, configurar API key, endpoint | 4h |
| P0-4 | **Migrar Heavy → DeepSeek V4 Flash:** trocar modelo de geração de receitas | 2h |
| P0-5 | **Sanitizar ingredientes contra prompt injection:** escapar caracteres especiais | 1h |
| P0-6 | **Adicionar fallback multi-provider:** DeepSeek → Groq GPT-OSS 120B | 3h |
| P0-7 | **Migrar Fast → GPT-OSS 20B:** trocar modelo de parsing e metadata | 1h |

### 🟠 P1 — Qualidade dos Prompts (primeira semana pós-lançamento)

| # | Tarefa | Esforço |
|---|---|---|
| P1-1 | **Adicionar few-shot examples (2-3) em todos os prompts** (Chef, OCR, Parse, Metadata) | 6h |
| P1-2 | **Refatorar CHEF_SYSTEM_PROMPT:** remover redundâncias, CAPS NEGATIVOS → guidelines condicionais | 4h |
| P1-3 | **Refatorar OCR Vision:** reescrever em inglês, adicionar chain-of-thought, exemplos de recibos BR | 3h |
| P1-4 | **Migrar de `.format()` para Jinja2:** template engine seguro com escape de variáveis | 2h |
| P1-5 | **Criar sistema de versionamento de prompts:** armazenar em `prompts/` versionados | 3h |
| P1-6 | **Adicionar variação ao prompt de imagem:** 3-4 humores visuais Ghibli (manhã/noite, rústico/elegante) | 2h |
| P1-7 | **Melhorar agregação do Memória Evolutiva:** peso temporal, limit 50 | 3h |

### 🟡 P2 — Infraestrutura de Qualidade (primeiro mês)

| # | Tarefa | Esforço |
|---|---|---|
| P2-1 | **Sistema de avaliação de prompts:** logging de taxa de validação Pydantic, distribuição de tipos de receita, taxa de erro JSON | 5h |
| P2-2 | **Cache de receitas:** Redis ou dict em memória para ingredientes idênticos | 3h |
| P2-3 | **Timeout + retry para respostas truncadas:** detectar JSON incompleto, retry com max_tokens maior | 2h |
| P2-4 | **Migrar json_mode → structured output / tool calling** onde suportado | 4h |
| P2-5 | **Moderação de conteúdo:** filtro de segurança nas receitas geradas | 3h |
| P2-6 | **Migrar `deductCredit` para Supabase RPC:** atomicidade server-side | 4h |
| P2-7 | **Corrigir metadata extraction:** normalizar acentos (fácil→facil), traduzir easy→facil | 1h |

### 🟢 P3 — UX e Robustez (contínuo)

| # | Tarefa | Esforço |
|---|---|---|
| P3-1 | **Streaming de receitas:** resposta progressiva em vez de bloqueante | 8h |
| P3-2 | **A/B testing de prompts** com métricas de engajamento | 8h |
| P3-3 | **Logging estruturado com tracing** (ex: LangSmith, Braintrust) | 6h |
| P3-4 | **Suporte a aspect ratios diferentes** nas imagens (hero 16:9, card 1:1) | 2h |
| P3-5 | **Consolidar 3 landing pages em 1** | 4h |
| P3-6 | **Remover debug UI** (prompt de imagem exposto no Suggestions) | 30 min |
| P3-7 | **Limpar componentes órfãos** (Home, Ingredients, Recipes, Loading, ResponsiveImage) | 2h |

---

## 9. MAPA DE ROTAS (FRONTEND)

### Rotas Públicas
| Rota | Componente | Descrição |
|---|---|---|
| `/` | `LandingPage` | Landing page |
| `/login` | `LoginPage` | Login/Signup |
| `/confirmacao` | `ConfirmationPage` | OTP de confirmação |
| `/r/:slug` | `SavedRecipeDetailPage` | Receita pública compartilhável |

### Rotas Protegidas
| Rota | Componente | Descrição |
|---|---|---|
| `/dashboard` | `Dashboard` | Home logada |
| `/scanner` | `Scanner` | Câmera ou galeria |
| `/scanning` | `Scanning` | Loading OCR |
| `/analyzing` | `Analyzing` | Loading receitas IA |
| `/lista` | `ShoppingList` | Lista de ingredientes editável |
| `/sugestoes` | `Suggestions` | Grid de receitas geradas |
| `/receita/:index` | `RecipeDetailPage` | Detalhe da receita |
| `/entrada-manual` | `ManualEntryPage` | Digitar itens |
| `/entrada-voz` | `VoiceInputPage` | Ditar itens |
| `/minhas-receitas` | `SavedRecipesPage` | Receitas salvas |
| `/minhas-listas` | `MyListsPage` | Listas salvas |
| `/minhas-listas/:id` | `SavedListDetailsPage` | Detalhe de lista |
| `/perfil` | `ProfilePage` | Perfil + créditos |
| `/debug/recipes` | `RecipeTestPage` | Debug com mocks |

---

## 10. ESQUEMA SUPABASE (`jacomprei`)

### `profiles`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (FK auth.users) | PK |
| `credits_balance` | int | Saldo de créditos |
| `subscription_tier` | enum | `user` / `founder` / `admin` / `dev` |

### `recipes`
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

### `shopping_lists`
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `title` | text |
| `items` | jsonb |
| `created_at` | timestamptz |

### `credit_transactions`
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `amount` | int (-1 = débito) |
| `description` | text |

### `user_recipe_metadata`
| Campo | Tipo |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `recipe_id` | uuid |
| `proteina_principal` | text |
| `metodo_cocao` | jsonb |
| `perfil_sabor` | jsonb |
| `nivel_dificuldade` | text |
| `tempo_estimado_minutos` | int |
| `tipo_refeicao` | text |
| `utensilios_especiais` | jsonb |
| `ingredientes_chave` | jsonb |
| `restricoes_detectadas` | jsonb |
| `custo_estimado` | text |
| `ocasiao` | text |
| `num_ingredientes` | int |
| `created_at` | timestamptz |

---

## 11. PLANO DE MIGRAÇÃO IMEDIATA (P0)

Ordem recomendada de execução:

```
1. [30 min]  Corrigir MODEL_VISION: Maverick → Scout 17B
2. [5 min]   Corrigir POLLINATIONS_MODEL: turbo → flux
3. [1h]      Sanitizar ingredientes contra prompt injection
4. [4h]      Criar DeepSeekService + configurar API key
5. [2h]      Migrar MODEL_HEAVY → deepseek-v4-flash
6. [3h]      Adicionar fallback DeepSeek → Groq GPT-OSS 120B
7. [1h]      Migrar MODEL_FAST → openai/gpt-oss-20b
```

Após P0 concluído, o app estará com modelos atualizados, multi-provider, e custo 60-80% menor por receita gerada.

---

*Documento mestre do Já Comprei. Atualizar conforme novas features, auditorias ou mudanças de arquitetura.*
