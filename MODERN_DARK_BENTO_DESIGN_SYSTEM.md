# 🎨 Modern Dark Bento Design System

> Um guia completo e reutilizável para criar interfaces modernas, premium e coesas no estilo "Bento Grid Dark Mode" — inspirado em startups de ponta como Linear, Vercel, Framer e Raycast.

---

## 📋 Sumário

1. [Filosofia de Design](#-filosofia-de-design)
2. [Fundamentos Visuais](#-fundamentos-visuais)
3. [Sistema de Cores](#-sistema-de-cores)
4. [Espaçamento](#-sistema-de-espacamento)
5. [Tipografia](#-tipografia)
6. [Animações](#-animacoes-framer-motion)
7. [Componentes Visuais](#-componentes-visuais)
8. [Elementos Decorativos](#-elementos-decorativos)
9. [Layout Bento Grid](#-layout-bento-grid)
10. [Animações Avançadas](#-animacoes-avancadas-premium)
11. [Checklist](#-checklist-de-implementacao)
12. [Referências](#-referencias)
13. [Proibido](#-proibido-nunca-faca)

---

## 🎯 Filosofia de Design

### Princípio Central

> **"Uma experiência visual unificada, não um template genérico."**

### Os 6 Pilares

| Pilar | Descrição |
|-------|-----------|
| **Modernidade** | Sensação de 2024/2025. Nada de "site corporativo tradicional" |
| **Coesão** | Tudo pertence ao mesmo universo visual — cores, espaçamentos, formas |
| **Premium** | Parece caro, bem feito, intencional. Cada pixel tem propósito |
| **Hierarquia** | O olho do usuário sabe exatamente para onde ir primeiro |
| **Respiro** | Espaçamentos amplos. O vazio é intencional e elegante |
| **Movimento** | Microanimações que dão vida sem distrair |

### Sensação Alvo

Quando um usuário acessa a página, deve sentir:
- "Isso parece profissional"
- "Essa empresa investe em qualidade"
- "O produto/serviço deve ser tão bom quanto o site"

---

## 🖤 Fundamentos Visuais

### Dark Mode como Base (OBRIGATÓRIO)

O dark mode não é uma preferência — é uma **escolha de design**. Ele:
- Cria contraste dramático com elementos de cor
- Transmite sofisticação e modernidade
- Reduz fadiga visual em experiências prolongadas
- Destaca gradientes e efeitos de luz

### Elementos Decorativos Essenciais

| Elemento | Propósito | Implementação |
|----------|-----------|---------------|
| **Gradient Orbs** | Profundidade e cor ambiente | Divs com `blur-3xl`, cores vibrantes, `opacity: 20-30%` |
| **Glassmorphism** | Camadas e profundidade | `backdrop-blur-xl`, `bg-white/5`, `border-white/10` |
| **Gradientes de Texto** | Destacar palavras-chave | `bg-clip-text`, `text-transparent`, `bg-gradient-to-r` |
| **Sombras Coloridas** | Elevar elementos | `shadow-blue-500/25`, nunca `shadow-black` |

---

## 🎨 Sistema de Cores

### Paleta Base (Zinc)

```css
/* CORES BASE - NUNCA MUDE */
--bg-primary: #09090b;      /* zinc-950 - Fundo principal */
--bg-secondary: #18181b;    /* zinc-900 - Cards */
--bg-tertiary: #27272a;     /* zinc-800 - Hover states */

--text-primary: #fafafa;    /* zinc-50 - Títulos */
--text-secondary: #a1a1aa;  /* zinc-400 - Corpo */
--text-muted: #71717a;      /* zinc-500 - Labels secundários */

--border-default: #27272a;  /* zinc-800 */
--border-subtle: rgba(255,255,255,0.1);
```

### Cores de Acento (Gradientes)

```css
/* GRADIENTE PRIMÁRIO (USE SEMPRE) */
--accent-gradient: linear-gradient(to right, #3b82f6, #8b5cf6);
/* blue-500 to violet-500 */

/* Variações */
--accent-blue: #3b82f6;     /* blue-500 */
--accent-violet: #8b5cf6;   /* violet-500 */
--accent-cyan: #06b6d4;     /* cyan-500 (alternativo) */

/* Sombras de Acento */
--shadow-accent: rgba(59, 130, 246, 0.25);
```

### Cores Funcionais

```css
/* Sucesso */
--success: #22c55e;         /* green-500 */

/* Alertas */
--warning: #eab308;         /* yellow-500 */

/* Estrelas/Ratings */
--rating: #facc15;          /* yellow-400 */
```

### Aplicação em Tailwind

```jsx
// ✅ CORRETO:
<div className="bg-zinc-950 text-zinc-100">
  <div className="bg-zinc-900 border-zinc-800 rounded-3xl">
    <h1 className="text-white">Título</h1>
    <p className="text-zinc-400">Texto</p>
    <button className="bg-gradient-to-r from-blue-600 to-violet-600 
                       shadow-lg shadow-blue-500/25">
      Botão
    </button>
  </div>
</div>

// ❌ ERRADO (nunca use):
<div className="bg-gray-900">         {/* use zinc, não gray */}
<div className="text-white">          {/* para body use zinc-400 */}
<div className="rounded-lg">          {/* use rounded-2xl ou rounded-3xl */}
<div className="shadow-black">        {/* use sombras coloridas */}
```

---

## 📐 Sistema de Espaçamento

### Entre Seções

```jsx
py-20         /* 80px vertical - padrão */
py-24         /* 96px - seções importantes */
py-32         /* 128px - hero sections */
```

### Container

```jsx
max-w-7xl     /* 1280px - largura máxima */
mx-auto       /* centralizado */
px-4 sm:px-6 lg:px-8  /* padding responsivo */
```

### Grid Gaps

```jsx
gap-6         /* 24px - padrão */
gap-8         /* 32px - cards grandes */
```

### Cantos Arredondados

> **REGRA DE OURO: Nunca use cantos retos (`rounded-none`)**

```jsx
rounded-3xl    /* Cards grandes, sections (24px) */
rounded-2xl    /* Cards médios, buttons (16px) */
rounded-xl     /* Inputs, small cards (12px) */
rounded-full   /* Botões CTA, avatares, badges */
rounded-lg     /* Mínimo permitido para elementos pequenos (8px) */
```

---

## ✍️ Tipografia

### Hierarquia

| Nível | Desktop | Mobile | Peso | Uso |
|-------|---------|--------|------|-----|
| H1 Hero | `text-7xl` (72px) | `text-5xl` | `font-bold` | Título principal |
| H2 Section | `text-5xl` (48px) | `text-3xl` | `font-bold` | Títulos de seção |
| H3 Card | `text-3xl` (30px) | `text-2xl` | `font-bold` | Títulos de cards |
| H4 | `text-xl` (20px) | `text-lg` | `font-semibold` | Subtítulos |
| Body | `text-base` (16px) | `text-base` | `font-normal` | Texto corrido |
| Small | `text-sm` (14px) | `text-sm` | `font-normal` | Labels, captions |

### Estilos Especiais

```jsx
// Título Hero com destaque em gradiente
<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
  Texto normal{" "}
  <span className="bg-gradient-to-r from-blue-400 to-violet-400 
                   bg-clip-text text-transparent">
    destaque gradiente
  </span>
</h1>

// Label de seção (tag acima do título)
<span className="text-sm font-medium text-blue-400 uppercase tracking-wider">
  Nome da Seção
</span>

// Subtítulo descritivo
<p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto">
  Descrição da seção
</p>
```

### Fontes Recomendadas

- **Sans-serif modernas**: Inter, Outfit, Geist, Satoshi
- **Fallback seguro**: `font-sans` do Tailwind (system-ui)

---

## 🎬 Animações (Framer Motion)

### Instalação

```bash
npm install framer-motion
```

### Variantes Base (Copie sempre)

```typescript
import { motion } from "framer-motion";

// Fade In + Slide Up
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

// Stagger Container (para listas)
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
  }
};

// Scale In
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5 } 
  }
};

// Slide In (para cards laterais)
const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};
```

### Easing Padrão (IMPORTANTE)

```typescript
// SEMPRE use este easing para reveals:
ease: [0.22, 1, 0.36, 1]  // ease-out-expo

// Para springs:
{ type: "spring", stiffness: 300, damping: 30 }

// Para reveals suaves:
{ type: "spring", stiffness: 100, damping: 30, restDelta: 0.001 }
```

### Scroll-Triggered Animations

```jsx
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function Section() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
    >
      {/* Conteúdo */}
    </motion.section>
  );
}
```

### Animação de Lista (Stagger)

```jsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={staggerContainer}
>
  {items.map((item, index) => (
    <motion.div 
      key={item.id} 
      variants={fadeInUp}
      custom={index}
    >
      <Card />
    </motion.div>
  ))}
</motion.div>
```

### Transições CSS (Sem Biblioteca)

```jsx
// Hover em botões
className="transition-all duration-300 hover:shadow-xl"

// Hover em imagens
className="transition-transform duration-500 group-hover:scale-105"

// Hover em cards
className="transition-all duration-300 hover:border-zinc-700"
```

### Regras de Animação

1. **Sutil > Dramático**: Animações devem ser sentidas, não vistas conscientemente
2. **Performance**: Use `transform` e `opacity`, nunca anime `width`, `height` ou `top/left`
3. **Uma vez**: Use `viewport.once: true` para animações de scroll
4. **Timing**: 300-600ms para a maioria das animações. Hover pode ser 150-200ms

---

## 🧩 Componentes Visuais

### Card Base

```jsx
import { Card, CardContent } from "@/components/ui/card";

<Card className="bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden">
  <CardContent className="p-8">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### Card com Hover Premium

```jsx
<Card className="bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden 
  group hover:border-zinc-700 transition-all duration-500 
  hover:shadow-xl hover:shadow-blue-500/5">
  <div className="overflow-hidden">
    <img 
      className="w-full h-56 object-cover group-hover:scale-105 
                 transition-transform duration-500" 
    />
  </div>
  <CardContent className="p-6">
    <h3 className="text-lg font-semibold text-white 
                   group-hover:text-blue-400 transition-colors">
      Título
    </h3>
  </CardContent>
</Card>
```

### Botão Primário (Gradiente)

```jsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

<Button 
  size="lg" 
  className="bg-gradient-to-r from-blue-600 to-violet-600 
    hover:from-blue-500 hover:to-violet-500 text-white 
    px-8 py-6 text-lg font-semibold rounded-full 
    shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 
    transition-all duration-300 group"
>
  <Icon className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
  Texto do Botão
  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
</Button>
```

### Botão Secundário (Ghost)

```jsx
<Button 
  variant="outline" 
  size="lg"
  className="bg-white/5 border-white/20 text-white hover:bg-white/10 
    px-8 py-6 text-lg backdrop-blur-sm rounded-full 
    transition-all duration-300 hover:border-white/40"
>
  Saiba Mais
</Button>
```

### Input Estilizado

```jsx
import { Input } from "@/components/ui/input";

<Input 
  className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl h-12 
    placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20" 
/>
```

### Badge/Tag

```jsx
import { Badge } from "@/components/ui/badge";

// Badge neutro
<Badge className="bg-zinc-900/80 backdrop-blur-sm text-white border-0 rounded-full">
  Categoria
</Badge>

// Badge com cor
<span className="text-sm font-medium text-blue-400 uppercase tracking-wider">
  Label
</span>
```

### Ícone em Círculo

```jsx
<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 
                rounded-xl flex items-center justify-center">
  <Icon className="text-white" size={20} />
</div>
```

---

## ✨ Elementos Decorativos

### Gradient Orbs (Fundo)

```jsx
// SEMPRE adicione em sections importantes:
<div className="absolute top-1/4 left-1/4 w-96 h-96 
                bg-blue-600/20 rounded-full blur-3xl" />
<div className="absolute bottom-1/4 right-1/4 w-80 h-80 
                bg-violet-600/20 rounded-full blur-3xl" />
```

### Glassmorphism

```jsx
<div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 
                rounded-3xl">
  {/* Conteúdo com fundo translúcido */}
</div>
```

### Noise Texture (Global)

```jsx
// Adicione no layout principal (App.tsx ou layout root):
<div 
  className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.015]"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
  }}
/>
```

### Grid Pattern (Background)

```jsx
<div 
  className="absolute inset-0 opacity-[0.02]"
  style={{
    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: '60px 60px'
  }}
/>
```

---

## 📱 Layout Bento Grid

### Conceito

O Bento Grid é inspirado nas caixas de bentō japonesas — compartimentos de tamanhos variados que formam um todo harmonioso. Aplicado ao web design:

- Seções não são apenas "empilhadas"
- Cards de tamanhos diferentes criam ritmo visual
- O layout conta uma história de cima para baixo

### Estrutura Típica

```
┌─────────────────────────────────────────────────────────┐
│                      HERO SECTION                        │
│                 (Full Width, min-h-screen)              │
└─────────────────────────────────────────────────────────┘

┌───────────────────────┬─────────────────────────────────┐
│   CARD MENOR (2/5)    │        CARD MAIOR (3/5)         │
│   (Info/Lista)        │        (Form/Interativo)        │
└───────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              GRID DE CARDS (3 colunas)                  │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│   │  Card 1 │   │  Card 2 │   │  Card 3 │              │
│   └─────────┘   └─────────┘   └─────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Implementação com Tailwind

```jsx
// Container principal
<section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  
  {/* Grid 5 colunas: 2 + 3 */}
  <div className="grid lg:grid-cols-5 gap-6">
    <div className="lg:col-span-2">
      {/* Card Menor - Informativo */}
    </div>
    <div className="lg:col-span-3">
      {/* Card Maior - Interativo */}
    </div>
  </div>

  {/* Grid 3 colunas */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <Card key={item.id} />)}
  </div>

  {/* Grid 2 colunas */}
  <div className="grid lg:grid-cols-2 gap-6">
    <div>Lado Esquerdo</div>
    <div>Lado Direito</div>
  </div>
</section>
```

---

## 🎬 Animações Avançadas (Premium)

### Parallax Effect

```jsx
import { useScroll, useTransform, motion } from 'framer-motion';

function ParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        {/* Background com parallax */}
      </motion.div>
    </section>
  );
}
```

### 3D Tilt Card

```jsx
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

function TiltCard({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);
  
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
```

### Magnetic Button

```jsx
import { useMotionValue, useSpring, motion } from 'framer-motion';

function MagneticButton({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
```

### Scroll Progress Bar

```jsx
import { motion, useScroll, useSpring } from 'framer-motion';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 
                 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 
                 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}
```

### Texto Rotativo

```jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = ['Zona Leste', 'Tatuapé', 'Mooca', 'Vila Formosa'];

function TextRotator() {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -40, rotateX: 90 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-r from-blue-400 to-violet-400 
                     bg-clip-text text-transparent inline-block"
        >
          {words[current]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
```

---

## ✅ Checklist de Implementação

### Antes de Começar
- [ ] Instalar dependências: `framer-motion`, `lucide-react`
- [ ] Configurar Tailwind com as cores do sistema
- [ ] Preparar assets (imagens, vídeos, ícones)

### Estrutura
- [ ] Container principal com `bg-zinc-950 text-zinc-100`
- [ ] Seções com `py-20 max-w-7xl mx-auto`
- [ ] Grid system definido (5-col, 3-col, 2-col)

### Hero
- [ ] Título grande com gradiente de texto
- [ ] Vídeo/imagem de fundo com overlay gradiente escuro
- [ ] Gradient orbs decorativos
- [ ] CTAs com estilo premium (efeitos hover, ícones)
- [ ] Animação de entrada (fade + slide)

### Cards
- [ ] `rounded-3xl` ou `rounded-2xl`
- [ ] `bg-zinc-900 border-zinc-800`
- [ ] Hover effects (border, shadow, scale)
- [ ] Padding generoso (`p-8`)

### Tipografia
- [ ] Hierarquia clara (H1 > H2 > H3 > Body)
- [ ] Cores corretas (white, zinc-300, zinc-400)
- [ ] Tracking ajustado para títulos

### Animações
- [ ] Framer Motion configurado
- [ ] Variantes definidas (fadeInUp, staggerContainer)
- [ ] Animações de entrada no Hero
- [ ] Animações de scroll nas seções (`useInView`)
- [ ] Stagger em listas

### Responsividade
- [ ] Mobile-first (`md:` e `lg:` breakpoints)
- [ ] Grid adaptável
- [ ] Tipografia responsiva

### Polish Final
- [ ] Noise texture overlay global
- [ ] Gradient orbs em sections principais
- [ ] Todos os links funcionando
- [ ] Formulários estilizados
- [ ] Ícones consistentes (Lucide)
- [ ] Espaçamentos uniformes

---

## 📚 Referências

### Sites para Estudar

| Site | O que observar |
|------|----------------|
| [linear.app](https://linear.app) | Hero impactante, animações suaves, dark mode perfeito |
| [vercel.com](https://vercel.com) | Gradientes, tipografia, layout de features |
| [framer.com](https://framer.com) | Cards interativos, microanimações |
| [raycast.com](https://raycast.com) | Bento grid, glassmorphism, CTAs |
| [stripe.com](https://stripe.com) | Gradientes, profundidade, atenção a detalhes |
| [read.cv](https://read.cv) | Bento grid pessoal, elegância minimalista |

### Ferramentas Úteis

- **Cores**: [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- **Gradientes**: [uigradients.com](https://uigradients.com), [gradient.style](https://gradient.style)
- **Shadows**: [shadows.brumm.af](https://shadows.brumm.af)
- **Animações**: [Framer Motion Docs](https://www.framer.com/motion/)
- **Ícones**: [Lucide Icons](https://lucide.dev)

---

## 🚫 PROIBIDO (Nunca faça)

❌ **Usar cores `gray` em vez de `zinc`**
> Sempre use a família zinc para consistência

❌ **Cantos retos (`rounded-none`)**
> Mesmo elementos pequenos devem ter `rounded-lg` mínimo

❌ **Fundo branco ou claro**
> O dark mode é obrigatório neste design system

❌ **Sombras pretas (`shadow-black`)**
> Use sombras coloridas: `shadow-blue-500/25`

❌ **Animações muito lentas (>1s) ou rápidas demais (<0.2s)**
> Timing ideal: 300-600ms para reveals, 150-200ms para hover

❌ **Texto branco puro em parágrafos longos**
> Use `text-zinc-300` para body text (menos cansativo)

❌ **Mais de 3 cores principais**
> Mantenha a paleta restrita: zinc + gradiente blue-violet

❌ **Botões sem ícones ou sem hover effects**
> Todo CTA deve ter ícone e micro-interação

❌ **Paredes de texto sem respiro**
> Use espaçamentos generosos entre elementos

❌ **Ignorar `prefers-reduced-motion`**
> Sempre respeite as preferências de acessibilidade do usuário

---

## 🎓 Exemplo Completo: Seção Hero

```tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
      
      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Seu Título{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Destacado
          </span>
        </motion.h1>
        
        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-3xl mx-auto"
        >
          Sua descrição aqui com espaçamento confortável para leitura.
        </motion.p>
        
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-violet-600 
              hover:from-blue-500 hover:to-violet-500 text-white 
              px-8 py-6 text-lg font-semibold rounded-full 
              shadow-lg shadow-blue-500/25 transition-all duration-300 group"
          >
            <Search className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
            Começar Agora
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="bg-white/5 border-white/20 text-white 
              hover:bg-white/10 px-8 py-6 text-lg rounded-full"
          >
            Saiba Mais
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

---

## 💡 Conclusão

Este design system não é um conjunto de regras rígidas — é uma **filosofia visual**. O objetivo é criar experiências que pareçam:

1. **Intencionais** — cada elemento tem um propósito
2. **Coesas** — tudo pertence ao mesmo universo
3. **Premium** — transmitindo qualidade antes de ler uma palavra

Ao aplicar estes princípios, você pode adaptar para qualquer marca ou projeto, mantendo a essência de modernidade e profissionalismo.

---

*Documento criado para garantir consistência visual premium em qualquer projeto.*
*Última atualização: Janeiro 2026*
