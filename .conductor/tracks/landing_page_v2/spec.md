# Landing Page V2 - Especificação

## Objetivo
Criar uma nova landing page alternativa na rota `/index2` para testes A/B, com foco no **core do produto** (receitas a partir da nota fiscal) e destaque secundário para a **Memória Evolutiva**.

## Requisitos

### Hierarquia de Comunicação
1. **Prioridade 1 (Hero)**: Scanner de notas → Receitas instantâneas com IA
2. **Prioridade 2 (Seção destacada)**: Chef que aprende com você (Memória Evolutiva)
3. **Prioridade 3 (Benefits)**: Economia, praticidade, sustentabilidade

### Core Features
1. **Scanner de Notas Fiscais** - OCR com IA (FOCO PRINCIPAL)
2. **Sugestão de Receitas** - Chef brasileiro com IA (FOCO PRINCIPAL)
3. **Memória Evolutiva** - IA que aprende seus gostos (DIFERENCIAL)
4. **Livro de Receitas** - Persistência na nuvem

### Princípios de Design
- **Mobile-First**: Layout otimizado para celulares como prioridade
- **Responsivo**: Adaptação perfeita para tablet (768px) e desktop (1024px+)
- **Premium**: Design moderno, animações suaves, micro-interações
- **Impactante**: O usuário deve sentir que o app é algo incrível

### Estrutura das Seções

#### 1. Hero Section (Core do App)
- **Badge**: "Receitas com IA" ou "Cozinha Inteligente"
- **Headline**: "Escaneie sua nota, receba receitas"
- **Subheadline**: "A IA transforma suas compras em pratos deliciosos em segundos"
- **Visual**: Mockup do app mostrando fluxo nota → ingredientes → receita

#### 2. How It Works (3 Passos Principais)
1. Escaneie a nota
2. Confira os ingredientes
3. Receba receitas criativas

#### 3. AI Learning Section (Diferencial - Destaque Secundário)
- **Título**: "E tem mais: seu Chef aprende com você"
- **Subtítulo**: "Quanto mais você cozinha, mais personalizado fica"
- Visual mostrando a evolução da personalização
- Esta seção destaca a Memória Evolutiva sem ofuscar o core

#### 4. Benefits
- Economia (aproveitamento 100% das compras)
- Rapidez (receitas em segundos)
- Organização (livro de receitas na nuvem)
- Sustentabilidade (menos desperdício)

#### 5. Social Proof (Mock)
- Depoimentos de usuários

#### 6. CTA Final
- "Começar Agora" ou "Experimente Grátis"

### Requisitos Técnicos
- Arquivo: `src/LandingPageV2.jsx`
- Rota: `/index2`
- Stack: React + Tailwind CSS v4
- Ícones: Lucide React
