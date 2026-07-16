import {
    Menu,
    ChefHat,
    Search,
    Camera,
    ClipboardList,
    Utensils,
    Sparkles,
    Download,
    Instagram,
    Music2,
    Mail,
    ArrowRight,
    Sun,
    Moon,
    X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ResponsiveImage from './components/ResponsiveImage';
import kitchenDesktop from './assets/images/kitchen_desktop.png';
import kitchenQuadrado from './assets/images/kitchen_quadrado.png';
import Logo from './assets/images/Logo.png';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

// Animated Section Component
function AnimatedSection({ children, className, delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function LandingPage({ onStart, onLogin }) {
    const [activeStep, setActiveStep] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Refs for scroll animations
    const heroRef = useRef(null);
    const howItWorksRef = useRef(null);
    const benefitsRef = useRef(null);
    const ctaRef = useRef(null);
    
    const isHeroInView = useInView(heroRef, { once: true });
    const isHowItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
    const isBenefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
    const isCtaInView = useInView(ctaRef, { once: true, margin: "-50px" });
    
    // Initialize theme from localStorage or system preference
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    // Apply theme changes
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

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 font-sans antialiased selection:bg-sage/30 transition-colors duration-300">
            {/* TopAppBar */}
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="sticky top-0 z-50 w-full backdrop-blur-md bg-cream/90 dark:bg-[#171b19]/90 border-b border-gray-100 dark:border-white/10"
            >
                <div className="flex items-center justify-between px-6 py-2 max-w-5xl mx-auto w-full">
                    {/* Logo */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center"
                    >
                        <img src={Logo} alt="Já Comprei" className="w-16 h-16 object-contain" />
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, index) => (
                            link.isLogin ? (
                                <motion.button
                                    key={link.label}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                    onClick={onLogin}
                                    className="text-sm font-bold text-charcoal/80 dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                >
                                    {link.label}
                                </motion.button>
                            ) : link.isPricing ? (
                                <motion.button
                                    key={link.label}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                    onClick={handlePricingClick}
                                    className="text-sm font-bold text-charcoal/80 dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                >
                                    {link.label}
                                </motion.button>
                            ) : (
                                <motion.a
                                    key={link.label}
                                    href={link.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                    className="text-sm font-bold text-charcoal/80 dark:text-gray-300 hover:text-sage dark:hover:text-sage transition-colors"
                                >
                                    {link.label}
                                </motion.a>
                            )
                        ))}
                    </nav>

                    {/* Right Side Controls */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-4"
                    >
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal dark:text-[#FDFBF7]"
                            aria-label="Alternar tema"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="text-charcoal dark:text-white hover:text-sage transition-colors md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                    </motion.div>
                </div>
            </motion.header>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    ></motion.div>

                    {/* Drawer Content */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 h-full w-[280px] bg-cream dark:bg-[#1c221f] shadow-2xl p-6 flex flex-col gap-8 border-l dark:border-white/5"
                    >
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
                            {navLinks.map((link, index) => (
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
                    </motion.div>
                </div>
            )}

            {/* HeroSection */}
            <section ref={heroRef} className="flex flex-col items-center px-6 pt-10 pb-6 w-full max-w-5xl mx-auto lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                <motion.div 
                    initial="hidden"
                    animate={isHeroInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                    className="flex flex-col gap-6 text-center mb-10 lg:text-left lg:mb-0"
                >
                    <motion.div 
                        variants={fadeInUp}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-terracotta/10 rounded-full w-fit mx-auto lg:mx-0 border border-terracotta/20"
                    >
                        <Utensils size={16} className="text-terracotta" />
                        <span className="text-terracotta text-xs font-bold uppercase tracking-wider">Cozinha com IA</span>
                    </motion.div>

                    <motion.h1 
                        variants={fadeInUp}
                        className="text-charcoal dark:text-[#FDFBF7] text-[2.75rem] leading-[1.1] font-serif font-medium tracking-tight"
                    >
                        Voltou do mercado e não sabe o que <span className="italic text-sage font-semibold relative inline-block">
                            fazer
                            <svg className="absolute w-full h-2 bottom-1 left-0 text-sage/20 -z-10" preserveAspectRatio="none" viewBox="0 0 100 10">
                                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                            </svg>
                        </span> com tudo isso?
                    </motion.h1>

                    <motion.p 
                        variants={fadeInUp}
                        className="text-[#687d73] dark:text-[#97a09c] text-lg font-normal leading-relaxed px-2 lg:px-0"
                    >
                        Escaneie sua nota fiscal e deixe a IA criar receitas deliciosas com suas compras em segundos.
                    </motion.p>

                    <motion.div 
                        variants={fadeInUp}
                        className="flex flex-col w-full gap-3 pt-2 lg:max-w-xs"
                    >
                        <button
                            onClick={onLogin}
                            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl h-14 px-6 bg-sage hover:bg-[#6a9480] transition-all shadow-glow hover:shadow-lg text-white text-base font-bold tracking-wide group"
                        >
                            <Sparkles className="group-hover:animate-pulse" size={20} />
                            <span>Experimentar Agora</span>
                        </button>
                        <p className="text-xs text-[#687d73] font-medium lg:text-center">✨ Grátis para testar • Sem cartão de crédito</p>
                    </motion.div>
                </motion.div>

                {/* Phone Mockup - CSS Only */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-[320px] mx-auto perspective-1000 lg:mr-0"
                >
                    <div className="relative bg-[#171b19] rounded-[2.5rem] p-3 shadow-2xl border-[6px] border-[#29302c] ring-1 ring-white/20 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ease-out">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-b-xl z-20"></div>

                        {/* Screen Content */}
                        <div className="relative h-[580px] w-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
                            {/* App Header inside phone */}
                            <div className="h-14 bg-cream flex items-end justify-between px-5 pb-3">
                                <ArrowRight className="text-gray-400 rotate-180" size={16} />
                                <span className="font-serif font-bold text-gray-800">Resultado</span>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </div>

                            {/* Recipe Image with overlay */}
                            <div
                                className="h-48 w-full bg-cover bg-center relative"
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80')" }}
                            >
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-3 left-4 text-white">
                                    <span className="bg-terracotta/90 text-[10px] font-bold px-2 py-0.5 rounded text-white mb-1 inline-block">Spicy</span>
                                    <h3 className="font-bold text-lg font-serif">Salada proteica verde</h3>
                                </div>
                            </div>

                            {/* Ingredients List */}
                            <div className="flex-1 p-5 flex flex-col gap-4 bg-white">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase font-bold">Tempo</span>
                                        <span className="font-bold text-gray-800">15 min</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs text-gray-400 uppercase font-bold">Calorias</span>
                                        <span className="font-bold text-terracotta">320 kcal</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-800">Ingredientes Usados</span>
                                    {[
                                        { name: '1/2 Abacate', used: true },
                                        { name: 'Sobras de Arroz', used: true },
                                        { name: 'Tomates Cereja', used: true }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                            <div className="text-sage">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                            </div>
                                            <span className="text-sm text-gray-600">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* App CTA inside phone */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="w-full bg-sage h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                    Ver Receita Completa
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="absolute top-20 -right-4 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3"
                            style={{ animation: isHeroInView ? 'bounce 3s infinite' : 'none' }}
                        >
                            <div className="bg-green-100 p-2 rounded-full">
                                <div className="text-green-600 font-bold text-xl">$</div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold">Economia estimada</p>
                                <p className="text-sm font-black text-gray-800">R$ 450/mês</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* FeatureSection (How it Works) */}
            <section id="how-it-works" ref={howItWorksRef} className="flex flex-col gap-10 px-6 py-16 max-w-5xl mx-auto w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center"
                >
                    <h2 className="text-charcoal dark:text-[#FDFBF7] font-serif text-3xl font-bold mb-3">Como Funciona</h2>
                    <p className="text-[#687d73] dark:text-[#97a09c]">Três passos simples para parar de desperdiçar.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex items-start gap-5 p-5 rounded-2xl bg-white dark:bg-[#1c221f] border border-transparent dark:border-white/5 hover:border-sage/20 dark:hover:border-sage/20 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 cursor-default"
                        onMouseEnter={() => setActiveStep(0)}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300 ${activeStep === 0 ? 'bg-sage text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                            <Camera size={24} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-charcoal dark:text-[#FDFBF7] text-lg font-bold">1. Escaneie</h3>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Tire uma foto da nota fiscal ou dos ingredientes que você tem na bancada.</p>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex items-start gap-5 p-5 rounded-2xl bg-white dark:bg-[#1c221f] border border-transparent dark:border-white/5 hover:border-sage/20 dark:hover:border-sage/20 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 cursor-default"
                        onMouseEnter={() => setActiveStep(1)}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300 ${activeStep === 1 ? 'bg-sage text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                            <ClipboardList size={24} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-charcoal dark:text-[#FDFBF7] text-lg font-bold">2. Confira</h3>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">A Inteligência Artificial identifica cada item em segundos e organiza sua despensa virtual.</p>
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex items-start gap-5 p-5 rounded-2xl bg-white dark:bg-[#1c221f] border border-transparent dark:border-white/5 hover:border-sage/20 dark:hover:border-sage/20 hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 cursor-default"
                        onMouseEnter={() => setActiveStep(2)}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300 ${activeStep === 2 ? 'bg-sage text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                            <ChefHat size={24} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-charcoal dark:text-[#FDFBF7] text-lg font-bold">3. Cozinhe</h3>
                            <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Receba receitas criativas e deliciosas na hora, baseadas exatamente no que você tem.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" ref={benefitsRef} className="px-6 py-16 max-w-5xl mx-auto w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-12"
                >
                    <h2 className="text-charcoal dark:text-[#FDFBF7] font-serif text-3xl font-bold mb-3">Por que usar o Já Comprei?</h2>
                    <p className="text-[#687d73] dark:text-[#97a09c]">Benefícios reais que transformam sua rotina.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Benefit 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">💸</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Economize até R$450/mês</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Pare de jogar comida fora. Use tudo que você comprou de forma inteligente.</p>
                    </motion.div>

                    {/* Benefit 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Receitas em 10 segundos</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Escaneou a nota? Pronto. A IA gera sugestões deliciosas instantaneamente.</p>
                    </motion.div>

                    {/* Benefit 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">🧠</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Zero decisão, zero estresse</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Chega de ficar pensando "o que fazer?". A IA decide e você só executa.</p>
                    </motion.div>

                    {/* Benefit 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Suas listas organizadas</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Salve ingredientes, receitas favoritas e acesse de qualquer dispositivo.</p>
                    </motion.div>

                    {/* Benefit 5 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-[#1c221f] rounded-2xl p-6 border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">🌍</span>
                        </div>
                        <h3 className="text-charcoal dark:text-[#FDFBF7] font-bold text-lg mb-2">Impacto sustentável</h3>
                        <p className="text-[#687d73] dark:text-[#97a09c] text-sm leading-relaxed">Cada receita feita com suas compras é menos lixo no planeta. Cozinhe com propósito.</p>
                    </motion.div>
                </div>
            </section>

            {/* Appetite Appeal Card */}
            <section className="w-full px-4 pb-16 max-w-5xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-3xl h-[400px] shadow-lg group"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <ResponsiveImage
                            mobileSrc={kitchenQuadrado}
                            desktopSrc={kitchenDesktop}
                            alt="Cozinha organizada com ingredientes frescos"
                            className="w-full h-full"
                        />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="absolute bottom-0 left-0 w-full p-8 flex flex-col gap-4"
                    >
                        <div className="w-12 h-1 bg-terracotta rounded-full"></div>
                        <h2 className="text-white font-serif text-3xl font-medium leading-tight">
                            Chega de desperdício. <br />
                            <span className="font-bold text-green-200">Cozinhe com propósito.</span>
                        </h2>
                        <p className="text-gray-200 text-sm max-w-xs">
                            Economize dinheiro e ajude o planeta aproveitando 100% dos seus alimentos.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* CTA Section Bottom */}
            <section ref={ctaRef} className="px-6 pb-10 text-center max-w-5xl mx-auto w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-sage/5 dark:bg-sage/10 rounded-2xl p-8 border border-sage/10 dark:border-sage/5"
                >
                    <h3 className="text-xl font-bold font-serif mb-2 text-charcoal dark:text-[#FDFBF7]">Pronto para começar?</h3>
                    <p className="text-[#687d73] dark:text-[#97a09c] text-sm mb-6">Junte-se a mais de 10.000 cozinheiros conscientes.</p>
                    <button
                        onClick={onLogin}
                        className="flex w-full md:w-auto md:mx-auto cursor-pointer items-center justify-center gap-2 rounded-xl h-12 px-6 bg-charcoal hover:bg-black dark:bg-[#FDFBF7] dark:text-charcoal dark:hover:bg-white transition-all text-white text-sm font-bold tracking-wide"
                    >
                        <span>Experimentar Agora</span>
                        <Download size={18} />
                    </button>
                </motion.div>
            </section>

            {/* Footer */}
            <motion.footer 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-auto border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#171b19]"
            >
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
            </motion.footer>

            {/* Pricing Toast */}
            {showPricingToast && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] bg-charcoal dark:bg-white text-white dark:text-charcoal px-6 py-3 rounded-xl shadow-xl font-bold text-sm"
                >
                    ✨ Planos serão disponibilizados em breve!
                </motion.div>
            )}
        </div>
    );
}
