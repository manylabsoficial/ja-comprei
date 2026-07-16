/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Cores/fontes reais vêm do @theme em src/index.css (Tailwind v4,
      // CSS-first) — este bloco existe só como referência/fallback, mantido
      // em sincronia manual. Ver docs/DESIGN_PROPOSAL.md.
      colors: {
        cream: '#FBF6EC',
        sage: '#e8b44a',
        terracotta: '#e8b44a',
        charcoal: '#2A2118',
        primary: '#e8b44a',
        accent: '#e8b44a',
        'text-main': '#2A2118',
        'text-muted': '#6B5F4F',
        gold: { 300: '#f2cf85', 400: '#edc063', 500: '#e8b44a', 600: '#cf9a34', 700: '#a87a24' },
      },
      fontFamily: {
        serif: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(232, 180, 74, 0.3)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 4s ease-in-out infinite',
        'tilt': 'rotate-slow 6s ease-in-out infinite',
        'steam-1': 'float 3s ease-in-out infinite',
        'steam-2': 'float 3s ease-in-out infinite 0.5s',
        'steam-3': 'float 3s ease-in-out infinite 1s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.5' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'rotate-slow': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}
