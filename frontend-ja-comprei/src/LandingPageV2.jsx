import {
    Menu,
    ChefHat,
    Camera,
    ClipboardList,
    Sparkles,
    Download,
    Instagram,
    Music2,
    Mail,
    ArrowRight,
    Sun,
    Moon,
    X,
    Brain,
    TrendingUp,
    Heart,
    Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from './assets/images/Logo.png';

export default function LandingPageV2({ onStart, onLogin }) {
    const [activeStep, setActiveStep] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeEvolutionCard, setActiveEvolutionCard] = useState(0);

    // Theme management
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Auto-rotate evolution cards
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveEvolutionCard(prev => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Toast state for pricing
    const [showPricingToast, setShowPricingToast] = useState(false);
    const handlePricingClick = () => {
        setShowPricingToast(true);
        setTimeout(() => setShowPricingToast(false), 3000);
    };

    const navLinks = [
        { label: "Como Funciona", href: "#how-it-works" },
        { label: "Benefícios", href: "#benefits" },
        { label: "Preços", href: "#pricing", isPricing: true },
        { label: "Entrar", href: "#login", isLogin: true },
    ];

    const evolutionStages = [
        {
            title: "Primeira Receita",
            description: "A IA sugere receitas genéricas baseadas nos seus ingredientes",
            icon: ChefHat,
            color: "from-gray-400 to-gray-500"
        },
        {
            title: "Aprendendo...",
            description: "Após 5 receitas, detecta suas proteínas favoritas e restrições",
            icon: TrendingUp,
            color: "from-sage/70 to-sage"
        },
        {
            title: "Totalmente Personalizado",
            description: "Receitas sob medida para seu gosto, sem perder a criatividade",
            icon: Heart,
            color: "from-terracotta to-sage"
        }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 font-sans antialiased selection:bg-sage/30 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-cream/90 dark:bg-[#171b19]/90 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between px-6 py-2 max-w-5xl mx-auto w-full">
                    <div className="flex items-center">
                        <img src={Logo} alt="Já Comprei" className="w-16 h-16 object-contain" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            link.isLogin ? (
                                <button
                                    key={link.label}
                                    onClick={onLogin}
                                    className="text-sm font-bold text-charcoal/80 dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                >
                                    {link.label}
                                </button>
                            ) : link.isPricing ? (
                                <button
                                    key={link.label}
                                    onClick={handlePricingClick}
                                    className="text-sm font-bold text-charcoal/80 dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                >
                                    {link.label}
                                </button>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm font-bold text-charcoal/80 dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                    </nav>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal dark:text-[#FDFBF7]"
                            aria-label="Alternar tema"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="text-charcoal dark:text-white hover:text-sage transition-colors md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="absolute right-0 top-0 h-full w-[280px] bg-cream dark:bg-[#1c221f] shadow-2xl p-6 flex flex-col gap-8 transition-transform animate-in slide-in-from-right duration-300 border-l dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-xl text-charcoal dark:text-[#FDFBF7]">Menu</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal dark:text-[#FDFBF7]"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                link.isLogin ? (
                                    <button
                                        key={link.label}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            onLogin && onLogin();
                                        }}
                                        className="text-lg font-medium text-charcoal dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors text-left"
                                    >
                                        {link.label}
                                    </button>
                                ) : link.isPricing ? (
                                    <button
                                        key={link.label}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handlePricingClick();
                                        }}
                                        className="text-lg font-medium text-charcoal dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors text-left"
                                    >
                                        {link.label}
                                    </button>
                                ) : (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-medium text-charcoal dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                )
                            ))}
                        </nav>

                        <div className="mt-auto">
                            <button
                                onClick={onStart}
                                className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-sage hover:bg-[#6a9480] text-white font-bold transition-colors shadow-lg"
                            >
                                <Sparkles size={18} />
                                <span>Começar Agora</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - CORE DO APP */}
            <section className="flex flex-col items-center px-6 pt-12 pb-8 w-full max-w-5xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:pt-20">
                <div className="flex flex-col gap-6 text-center mb-10 lg:text-left lg:mb-0">
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-sage/10 rounded-full w-fit mx-auto lg:mx-0 border border-sage/20">
                        <Camera size={16} className="text-sage" />
                        <span className="text-sage text-xs font-bold uppercase tracking-wider">Receitas com IA</span>
                    </div>

                    <h1 className="text-charcoal dark:text-[#FDFBF7] text-[2.5rem] sm:text-[3rem] leading-[1.1] font-serif font-medium tracking-tight">
                        Escaneou a nota? <br />
                        <span className="italic text-sage font-semibold relative inline-block">
                            Receitas na hora
                            <svg className="absolute w-full h-2 bottom-1 left-0 text-sage/20 -z-10" preserveAspectRatio="none" viewBox="0 0 100 10">
                                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                            </svg>
                        </span>
                    </h1>

                    <p className="text-[#687d73] dark:text-[#97a09c] text-lg font-normal leading-relaxed px-2 lg:px-0">
                        A IA transforma suas compras em pratos deliciosos em segundos. Sem desperdício, sem estresse.
                    </p>

                    <div className="flex flex-col w-full gap-3 pt-2 lg:max-w-sm">
                        <button
                            onClick={onLogin}
                            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl h-14 px-6 bg-sage hover:bg-[#6a9480] transition-all shadow-glow hover:shadow-lg text-white text-base font-bold tracking-wide group"
                        >
                            <Sparkles className="group-hover:animate-pulse" size={20} />
                            <span>Experimentar Agora</span>
                        </button>
                        <p className="text-xs text-[#687d73] dark:text-[#97a09c] font-medium text-center lg:text-left">✨ Grátis para testar • Sem cartão de crédito</p>
                    </div>
                </div>

                {/* Visual - Flow Mockup */}
                <div className="relative w-full max-w-[400px] mx-auto lg:mr-0">
                    <div className="relative bg-gradient-to-br from-sage/10 to-terracotta/10 dark:from-sage/5 dark:to-terracotta/5 rounded-3xl p-8 border border-sage/20 dark:border-sage/10">
                        {/* Flow Steps */}
                        <div className="flex flex-col gap-6">
                            {/* Step 1: Nota */}
                            <div className="bg-white dark:bg-[#1c221f] rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-white/5 transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center">
                                        <Camera className="text-sage" size={20} />
                                    </div>
                                    <span className="font-bold text-sm text-charcoal dark:text-[#FDFBF7]">Nota Fiscal</span>
                                </div>
                                <div className="h-16 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-400">📄 Escaneando...</span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                                <ArrowRight className="text-sage rotate-90" size={24} />
                            </div>

                            {/* Step 2: Ingredientes */}
                            <div className="bg-white dark:bg-[#1c221f] rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-white/5 transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center">
                                        <ClipboardList className="text-sage" size={20} />
                                    </div>
                                    <span className="font-bold text-sm text-charcoal dark:text-[#FDFBF7]">Ingredientes</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {['Frango 1kg', 'Arroz 2kg', 'Tomate 500g'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <div className="w-1.5 h-1.5 bg-sage rounded-full"></div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                                <ArrowRight className="text-sage rotate-90" size={24} />
                            </div>

                            {/* Step 3: Receita */}
                            <div className="bg-gradient-to-br from-sage to-terracotta rounded-2xl p-4 shadow-xl transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <ChefHat className="text-white" size={20} />
                                    </div>
                                    <span className="font-bold text-sm text-white">Receita Pronta!</span>
                                </div>
                                <p className="text-white/90 text-xs">Frango ao Curry com Arroz Aromático 🍛</p>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-4 -right-4 bg-terracotta text-white px-4 py-2 rounded-full shadow-xl text-xs font-bold animate-bounce" style={{ animationDuration: '3s' }}>
                            ⚡ 10 segundos
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - 3 Passos Core */}
            <section id="how-it-works" className="flex flex-col gap-10 px-6 py-16 max-w-5xl mx-auto w-full bg-white dark:bg-[#1c221f] rounded-3xl my-8">
                <div className="text-center">
                    <h2 className="text-charcoal dark:text-[#FDFBF7] font-serif text-3xl font-bold mb-3">Como Funciona</h2>
                    <p className="text-[#687d73] dark:text-[#97a09c]">Três passos simples para nunca mais desperdiçar comida.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div
                        className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-cream dark:bg-[#171b19] border border-transparent dark:border-white/5 hover:border-sage/20 dark:hover:border-sage/20 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 cursor-default"
                        onMouseEnter={() => setActiveStep(0)}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-16 h-16 rounded-xl transition-colors duration-300 ${activeStep === 0 ? 'bg-sage text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                            <Camera size={28} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-charcoal dark:text-[#FDFBF7] text-xl font-bold">1. Escaneie</h3>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Tire uma foto da nota fiscal ou dos ingredientes na bancada.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div
                        className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-cream dark:bg-[#171b19] border border-transparent dark:border-white/5 hover:border-sage/20 dark:hover:border-sage/20 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 cursor-default"
                        onMouseEnter={() => setActiveStep(1)}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-16 h-16 rounded-xl transition-colors duration-300 ${activeStep === 1 ? 'bg-sage text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                            <ClipboardList size={28} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-charcoal dark:text-[#FDFBF7] text-xl font-bold">2. Confira</h3>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">A IA identifica cada item em segundos e organiza sua despensa virtual.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div
                        className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-cream dark:bg-[#171b19] border border-transparent dark:border-white/5 hover:border-sage/20 dark:hover:border-sage/20 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 cursor-default sm:col-span-2 lg:col-span-1"
                        onMouseEnter={() => setActiveStep(2)}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-16 h-16 rounded-xl transition-colors duration-300 ${activeStep === 2 ? 'bg-sage text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                            <ChefHat size={28} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-charcoal dark:text-[#FDFBF7] text-xl font-bold">3. Receba Receitas</h3>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Sugestões criativas e deliciosas baseadas exatamente no que você tem.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Learning Section - DIFERENCIAL */}
            <section className="px-6 py-16 max-w-5xl mx-auto w-full">
                <div className="bg-gradient-to-br from-sage/5 to-terracotta/5 dark:from-sage/10 dark:to-terracotta/10 rounded-3xl p-8 lg:p-12 border border-sage/20 dark:border-sage/10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-terracotta/10 rounded-full w-fit mx-auto mb-4 border border-terracotta/20">
                            <Brain size={16} className="text-terracotta" />
                            <span className="text-terracotta text-xs font-bold uppercase tracking-wider">Diferencial</span>
                        </div>
                        <h2 className="text-charcoal dark:text-[#FDFBF7] font-serif text-3xl font-bold mb-3">E tem mais: seu Chef aprende com você</h2>
                        <p className="text-[#687d73] dark:text-[#97a09c] max-w-2xl mx-auto">Quanto mais você cozinha, mais personalizado fica. A IA detecta suas preferências sem perder a criatividade.</p>
                    </div>

                    {/* Evolution Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {evolutionStages.map((stage, index) => {
                            const Icon = stage.icon;
                            const isActive = activeEvolutionCard === index;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setActiveEvolutionCard(index)}
                                    className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-500 ${isActive
                                            ? 'bg-white dark:bg-[#1c221f] shadow-xl scale-105 border-2 border-sage'
                                            : 'bg-white/50 dark:bg-[#1c221f]/50 shadow-md hover:shadow-lg border border-gray-100 dark:border-white/5'
                                        }`}
                                >
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-${isActive ? '10' : '5'} transition-opacity duration-500`}></div>

                                    <div className="relative z-10 flex flex-col gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-sage text-white' : 'bg-sage/10 text-sage'
                                            }`}>
                                            <Icon size={24} />
                                        </div>

                                        <div>
                                            <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">{stage.title}</h3>
                                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">{stage.description}</p>
                                        </div>

                                        {/* Progress Indicator */}
                                        <div className="flex gap-1 mt-2">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= index ? 'bg-sage' : 'bg-gray-200 dark:bg-white/10'
                                                        }`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="px-6 py-16 max-w-5xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-charcoal dark:text-[#FDFBF7] font-serif text-3xl font-bold mb-3">Por que usar o Já Comprei?</h2>
                    <p className="text-[#687d73] dark:text-[#97a09c]">Benefícios reais que transformam sua rotina.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Benefit 1 */}
                    <div className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg hover:border-sage/20 dark:hover:border-sage/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">💸</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Economize até R$450/mês</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Aproveite 100% das suas compras. Zero desperdício.</p>
                    </div>

                    {/* Benefit 2 */}
                    <div className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg hover:border-sage/20 dark:hover:border-sage/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Receitas em 10 segundos</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Escaneou? Pronto. A IA gera sugestões instantaneamente.</p>
                    </div>

                    {/* Benefit 3 */}
                    <div className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg hover:border-sage/20 dark:hover:border-sage/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">📚</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Livro de Receitas na Nuvem</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Salve favoritas e acesse de qualquer dispositivo.</p>
                    </div>

                    {/* Benefit 4 */}
                    <div className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg hover:border-sage/20 dark:hover:border-sage/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">🌍</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Impacto Sustentável</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Menos lixo no planeta. Cozinhe com propósito.</p>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="px-6 py-16 max-w-5xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-charcoal dark:text-[#FDFBF7] font-serif text-3xl font-bold mb-3">O que dizem nossos usuários</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { name: "Maria Silva", initials: "MS", text: "Economizei R$380 no primeiro mês! Não jogo mais nada fora." },
                        { name: "João Santos", initials: "JS", text: "A IA realmente aprende. Agora só recebo receitas que eu adoro." },
                        { name: "Ana Costa", initials: "AC", text: "Nunca mais fiquei sem ideia do que fazer. Melhor app de cozinha!" }
                    ].map((testimonial, i) => (
                        <div key={i} className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center">
                                    <span className="text-sage font-bold text-sm">{testimonial.initials}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal dark:text-[#FDFBF7] text-sm">{testimonial.name}</p>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">⭐</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm italic">"{testimonial.text}"</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="px-6 pb-16 text-center max-w-5xl mx-auto w-full">
                <div className="bg-gradient-to-br from-sage/10 to-terracotta/10 dark:from-sage/5 dark:to-terracotta/5 rounded-3xl p-10 border border-sage/20 dark:border-sage/10">
                    <h3 className="text-2xl lg:text-3xl font-bold font-serif mb-3 text-charcoal dark:text-[#FDFBF7]">Pronto para transformar suas compras em receitas?</h3>
                    <p className="text-[#687d73] dark:text-[#97a09c] text-sm mb-8 max-w-xl mx-auto">Junte-se a mais de 10.000 pessoas que já economizam e cozinham melhor.</p>
                    <button
                        onClick={onLogin}
                        className="flex w-full md:w-auto md:mx-auto cursor-pointer items-center justify-center gap-3 rounded-xl h-14 px-8 bg-sage hover:bg-[#6a9480] transition-all text-white text-base font-bold tracking-wide shadow-lg hover:shadow-xl group"
                    >
                        <span>Começar Agora</span>
                        <Download className="group-hover:translate-y-1 transition-transform" size={20} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#171b19]">
                <div className="flex flex-col items-center gap-6 px-5 py-10 text-center max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 opacity-80">
                        <img src={Logo} alt="Já Comprei" className="w-6 h-6 object-contain" />
                        <span className="font-serif font-bold text-lg text-charcoal dark:text-[#FDFBF7]">Já Comprei</span>
                    </div>

                    <div className="flex gap-6">
                        <a className="group bg-gray-50 dark:bg-white/5 p-3 rounded-full hover:bg-sage/10 transition-colors" href="#">
                            <Instagram className="text-[#687d73] dark:text-[#97a09c] group-hover:text-sage transition-colors" size={20} />
                        </a>
                        <a className="group bg-gray-50 dark:bg-white/5 p-3 rounded-full hover:bg-sage/10 transition-colors" href="#">
                            <Music2 className="text-[#687d73] dark:text-[#97a09c] group-hover:text-sage transition-colors" size={20} />
                        </a>
                        <a className="group bg-gray-50 dark:bg-white/5 p-3 rounded-full hover:bg-sage/10 transition-colors" href="#">
                            <Mail className="text-[#687d73] dark:text-[#97a09c] group-hover:text-sage transition-colors" size={20} />
                        </a>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-center gap-4 text-xs text-[#687d73] dark:text-[#97a09c]">
                            <a className="hover:underline" href="#">Termos</a>
                            <span>•</span>
                            <a className="hover:underline" href="#">Privacidade</a>
                        </div>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-xs font-normal">© 2026 Já Comprei. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Pricing Toast */}
            {showPricingToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] bg-charcoal dark:bg-white text-white dark:text-charcoal px-6 py-3 rounded-xl shadow-xl font-bold text-sm animate-in slide-in-from-bottom duration-300">
                    ✨ Planos serão disponibilizados em breve!
                </div>
            )}
        </div>
    );
}
