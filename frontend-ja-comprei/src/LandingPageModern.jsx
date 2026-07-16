import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useInView, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    Menu,
    ChefHat,
    Camera,
    ClipboardList,
    Sparkles,
    ArrowRight,
    Instagram,
    Music2,
    Mail,
    X,
    Brain,
    Zap,
    Leaf,
    Wallet,
    Clock,
    Heart,
    Star,
    ChevronRight,
    CheckCircle2,
    UtensilsCrossed,
    ArrowUpRight
} from 'lucide-react';
import Logo from './assets/images/Logo.png';

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
};

// Magnetic Button Component
function MagneticButton({ children, className, onClick }) {
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
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

// Text Rotator Component
function TextRotator({ words }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className="relative inline-block">
            <AnimatePresence mode="wait">
                <motion.span
                    key={current}
                    initial={{ opacity: 0, y: 40, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -40, rotateX: 90 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent inline-block"
                >
                    {words[current]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

// Scroll Progress Component
function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 origin-left z-[100]"
            style={{ scaleX }}
        />
    );
}

// Tilt Card Component
function TiltCard({ children, className }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - rect.left) / rect.width - 0.5);
                y.set((e.clientY - rect.top) / rect.height - 0.5);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function LandingPageModern({ onStart, onLogin }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPricingToast, setShowPricingToast] = useState(false);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const benefitsRef = useRef(null);
    const howItWorksRef = useRef(null);

    const isHeroInView = useInView(heroRef, { once: true });
    const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });
    const isBenefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
    const isHowItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });

    const handlePricingClick = () => {
        setShowPricingToast(true);
        setTimeout(() => setShowPricingToast(false), 3000);
    };

    const navLinks = [
        { label: "Como Funciona", ref: howItWorksRef },
        { label: "Benefícios", ref: benefitsRef },
        { label: "Preços", onClick: handlePricingClick },
        { label: "Entrar", onClick: onLogin },
    ];

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    const rotatingWords = ['receitas criativas', 'economia real', 'zero desperdício', 'pratos deliciosos'];

    const features = [
        {
            icon: Zap,
            title: "10 Segundos",
            description: "Da foto da nota à receita pronta. IA ultrarrápida.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: Wallet,
            title: "Economize R$450/mês",
            description: "Aproveite 100% das suas compras. Zero comida no lixo.",
            gradient: "from-violet-500 to-purple-500"
        },
        {
            icon: Brain,
            title: "IA que Aprende",
            description: "Quanto mais você cozinha, mais personalizado fica.",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            icon: Leaf,
            title: "Sustentável",
            description: "Cada receita é menos lixo no planeta. Cozinhe com propósito.",
            gradient: "from-emerald-500 to-teal-500"
        }
    ];

    const steps = [
        {
            number: "01",
            icon: Camera,
            title: "Escaneie",
            description: "Tire uma foto da nota fiscal ou dos ingredientes na bancada."
        },
        {
            number: "02",
            icon: ClipboardList,
            title: "Organize",
            description: "A IA identifica cada item em segundos e monta sua despensa virtual."
        },
        {
            number: "03",
            icon: ChefHat,
            title: "Cozinhe",
            description: "Receba sugestões criativas e deliciosas baseadas no que você tem."
        }
    ];

    const testimonials = [
        {
            name: "Maria Silva",
            role: "Mãe de 2 filhos",
            initials: "MS",
            text: "Economizei R$380 no primeiro mês! Não jogo mais nada fora. As receitas são incríveis!",
            rating: 5
        },
        {
            name: "João Santos",
            role: "Desenvolvedor",
            initials: "JS",
            text: "A IA realmente aprende meu gosto. Agora só recebo receitas que eu realmente adoro fazer.",
            rating: 5
        },
        {
            name: "Ana Costa",
            role: "Nutricionista",
            initials: "AC",
            text: "Recomendo para todos meus pacientes. Facilita muito a rotina de cozinhar em casa.",
            rating: 5
        }
    ];

    return (
        <div className="relative min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-x-hidden selection:bg-blue-500/30">
            {/* Scroll Progress */}
            <ScrollProgress />

            {/* Noise Texture Overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Grid Pattern Background */}
            <div
                className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <div className="flex items-center">
                            <img src={Logo} alt="Já Comprei" className="h-12 w-auto object-contain" />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.ref ? scrollToSection(link.ref) : link.onClick?.()}
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </nav>

                        {/* CTA Button */}
                        <div className="hidden md:block">
                            <MagneticButton
                                onClick={onLogin}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                            >
                                <span className="flex items-center gap-2">
                                    Começar
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </MagneticButton>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] md:hidden"
                    >
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-[300px] bg-zinc-900 border-l border-white/10 p-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-bold text-xl">Menu</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.ref ? scrollToSection(link.ref) : link.onClick?.()}
                                        className="text-lg font-medium text-zinc-400 hover:text-white transition-colors text-left py-2"
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-auto pt-8">
                                <button
                                    onClick={onLogin}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-xl"
                                >
                                    Começar Agora
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial="hidden"
                            animate={isHeroInView ? "visible" : "hidden"}
                            variants={staggerContainer}
                            className="text-center lg:text-left"
                        >
                            <motion.div variants={fadeInUp} className="mb-6">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400">
                                    <Sparkles size={14} />
                                    Cozinha Inteligente com IA
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                            >
                                Transforme suas compras em{' '}
                                <TextRotator words={rotatingWords} />
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-xl mx-auto lg:mx-0"
                            >
                                Escaneie sua nota fiscal e deixe nossa IA criar receitas deliciosas 
                                com seus ingredientes em segundos. Sem desperdício, sem estresse.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <MagneticButton
                                    onClick={onLogin}
                                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                    Experimentar Grátis
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </MagneticButton>

                                <button
                                    onClick={() => scrollToSection(howItWorksRef)}
                                    className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Ver Como Funciona
                                </button>
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                className="mt-8 flex items-center gap-4 justify-center lg:justify-start"
                            >
                                <div className="flex -space-x-3">
                                    {['MS', 'JS', 'AC', 'LB'].map((initials, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-xs font-bold"
                                        >
                                            {initials}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    <span className="text-white font-semibold">10.000+</span> pessoas economizando
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Content - Interactive Demo */}
                        <motion.div
                            initial="hidden"
                            animate={isHeroInView ? "visible" : "hidden"}
                            variants={scaleIn}
                            className="relative"
                        >
                            <TiltCard className="cursor-pointer">
                                <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    {/* Mock App Interface */}
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                                                    <Camera className="text-white" size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">Nota Fiscal</p>
                                                    <p className="text-xs text-zinc-500">Escaneando...</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        </div>

                                        {/* Receipt Preview */}
                                        <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5">
                                            <div className="space-y-2">
                                                {['Frango 1kg', 'Arroz 2kg', 'Tomate 500g', 'Cebola 300g'].map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.2 }}
                                                        className="flex items-center gap-3 py-2"
                                                    >
                                                        <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                            <CheckCircle2 size={12} className="text-blue-400" />
                                                        </div>
                                                        <span className="text-sm text-zinc-300">{item}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recipe Preview */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1 }}
                                            className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-2xl p-4 border border-blue-500/20"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                                                    <ChefHat className="text-white" size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-blue-400 font-medium mb-1">RECEITA GERADA</p>
                                                    <p className="font-semibold text-sm mb-1">Frango ao Curry com Arroz</p>
                                                    <p className="text-xs text-zinc-400">30 min • 450 kcal</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Floating Elements */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
                                    >
                                        ⚡ Em 10 segundos
                                    </motion.div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2"
                    >
                        <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Grid - Bento Style */}
            <section ref={featuresRef} className="relative py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={isFeaturesInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span
                            variants={fadeInUp}
                            className="inline-block text-sm font-medium text-blue-400 uppercase tracking-wider mb-4"
                        >
                            Por que Já Comprei
                        </motion.span>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
                        >
                            Tudo que você precisa para{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                cozinhar melhor
                            </span>
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-zinc-400 max-w-2xl mx-auto"
                        >
                            Tecnologia de ponta para transformar sua experiência na cozinha
                        </motion.p>
                    </motion.div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                animate={isFeaturesInView ? "visible" : "hidden"}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <TiltCard className="h-full">
                                    <div className="h-full bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
                                        <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon className="text-white" size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-zinc-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section ref={howItWorksRef} className="relative py-24 lg:py-32 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={isHowItWorksInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span
                            variants={fadeInUp}
                            className="inline-block text-sm font-medium text-violet-400 uppercase tracking-wider mb-4"
                        >
                            Como Funciona
                        </motion.span>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
                        >
                            Três passos para{' '}
                            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                                nunca mais desperdiçar
                            </span>
                        </motion.h2>
                    </motion.div>

                    {/* Steps */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial="hidden"
                                animate={isHowItWorksInView ? "visible" : "hidden"}
                                variants={index === 0 ? slideInLeft : index === 2 ? slideInRight : fadeInUp}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="relative group">
                                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/5 h-full">
                                        {/* Step Number */}
                                        <div className="absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                                            {step.number}
                                        </div>

                                        <div className="pt-4">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                                                <step.icon className="text-violet-400" size={28} />
                                            </div>

                                            <h3 className="text-2xl font-bold mb-4 group-hover:text-violet-400 transition-colors">
                                                {step.title}
                                            </h3>

                                            <p className="text-zinc-400 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Connector Line (desktop) */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Learning Section - Large Feature */}
            <section className="relative py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={slideInLeft}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-sm font-medium text-pink-400 mb-6">
                                <Brain size={14} />
                                Inteligência Artificial
                            </span>

                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                                Seu Chef pessoal que{' '}
                                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                                    aprende com você
                                </span>
                            </h2>

                            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                                Quanto mais você cozinha, mais personalizado fica. Nossa IA detecta suas 
                                preferências, restrições alimentares e estilo de cozinha para sugerir 
                                receitas perfeitas para você.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: Heart, text: "Aprende seus gostos e preferências" },
                                    { icon: Clock, text: "Sugere receitas no seu tempo disponível" },
                                    { icon: UtensilsCrossed, text: "Adapta receitas à sua despensa real" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
                                            <item.icon className="text-pink-400" size={18} />
                                        </div>
                                        <span className="text-zinc-300">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={slideInRight}
                        >
                            <TiltCard className="cursor-pointer">
                                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                                    <div className="space-y-6">
                                        {/* Progress Bars */}
                                        {[
                                            { label: "Proteínas Preferidas", value: 85, color: "from-blue-500 to-cyan-500" },
                                            { label: "Estilo Saudável", value: 72, color: "from-violet-500 to-purple-500" },
                                            { label: "Cozinha Rápida", value: 90, color: "from-pink-500 to-rose-500" },
                                            { label: "Receitas Salvas", value: 45, color: "from-emerald-500 to-teal-500" }
                                        ].map((item, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-zinc-400">{item.label}</span>
                                                    <span className="text-sm font-medium text-zinc-300">{item.value}%</span>
                                                </div>
                                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${item.value}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* AI Insight Card */}
                                    <div className="mt-8 p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl border border-pink-500/20">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="text-white" size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-pink-400 mb-1">Insight da IA</p>
                                                <p className="text-sm text-zinc-400">
                                                    Você costuma preferir refeições rápidas entre 30-40 minutos. 
                                                    Vou priorizar receitas neste tempo!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section ref={benefitsRef} className="relative py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={isBenefitsInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span
                            variants={fadeInUp}
                            className="inline-block text-sm font-medium text-emerald-400 uppercase tracking-wider mb-4"
                        >
                            Benefícios
                        </motion.span>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl font-bold tracking-tight"
                        >
                            Economize dinheiro,{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                ganhe tempo
                            </span>
                        </motion.h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Wallet, title: "Economia Real", desc: "Até R$450 economizados por mês sem desperdício", color: "from-emerald-500 to-teal-500" },
                            { icon: Clock, title: "Ganhe Tempo", desc: "Receitas em 10 segundos. Sem pensar no que fazer", color: "from-blue-500 to-cyan-500" },
                            { icon: Brain, title: "Zero Decisão", desc: "A IA decide o que cozinhar. Você só executa", color: "from-violet-500 to-purple-500" },
                            { icon: Heart, title: "Sua Cozinha", desc: "Receitas personalizadas para seu paladar", color: "from-pink-500 to-rose-500" },
                            { icon: Leaf, title: "Sustentável", desc: "Menos lixo, mais consciência ambiental", color: "from-green-500 to-emerald-500" },
                            { icon: ChefHat, title: "Aprenda Mais", desc: "Descubra novas receitas e técnicas", color: "from-orange-500 to-amber-500" }
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="h-full bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-zinc-900/80 transition-all duration-300">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <benefit.icon className="text-white" size={22} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-zinc-200 transition-colors">{benefit.title}</h3>
                                    <p className="text-zinc-400 text-sm">{benefit.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block text-sm font-medium text-amber-400 uppercase tracking-wider mb-4">
                            Depoimentos
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            O que dizem nossos{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                usuários
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                            >
                                <div className="h-full bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>

                                    <p className="text-zinc-300 mb-6 leading-relaxed">
                                        "{testimonial.text}"
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center font-bold text-sm">
                                            {testimonial.initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{testimonial.name}</p>
                                            <p className="text-xs text-zinc-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 lg:py-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden"
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/20 to-pink-600/20 rounded-3xl" />
                        <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl rounded-3xl" />
                        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/30 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/30 rounded-full blur-[100px]" />

                        {/* Content */}
                        <div className="relative z-10 text-center p-8 md:p-16 border border-white/10 rounded-3xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                    Pronto para transformar suas{' '}
                                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                        compras em receitas?
                                    </span>
                                </h2>

                                <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
                                    Junte-se a mais de 10.000 pessoas que já economizam e cozinham melhor 
                                    com o poder da IA.
                                </p>

                                <MagneticButton
                                    onClick={onLogin}
                                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-lg font-semibold rounded-full transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 group"
                                >
                                    <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
                                    Começar Grátis
                                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </MagneticButton>

                                <p className="mt-6 text-sm text-zinc-500">
                                    ✨ Grátis para testar • Sem cartão de crédito • Cancele quando quiser
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/5 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center mb-4">
                                <img src={Logo} alt="Já Comprei" className="h-12 w-auto object-contain" />
                            </div>
                            <p className="text-zinc-400 max-w-sm mb-6">
                                Transformando compras em receitas deliciosas com o poder da Inteligência Artificial.
                            </p>
                            <div className="flex gap-4">
                                {[
                                    { icon: Instagram, href: "#" },
                                    { icon: Music2, href: "#" },
                                    { icon: Mail, href: "#" }
                                ].map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-3">
                                {['Como Funciona', 'Benefícios', 'Preços', 'FAQ'].map((link, index) => (
                                    <li key={index}>
                                        <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-3">
                                {['Termos de Uso', 'Privacidade', 'Cookies'].map((link, index) => (
                                    <li key={index}>
                                        <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-zinc-500 text-sm">
                            © 2026 Já Comprei. Todos os direitos reservados.
                        </p>
                        <p className="text-zinc-600 text-xs">
                            Feito com 💜 no Brasil
                        </p>
                    </div>
                </div>
            </footer>

            {/* Pricing Toast */}
            <AnimatePresence>
                {showPricingToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-zinc-900 border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-blue-400" size={18} />
                            <span className="font-medium">Planos disponíveis em breve!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
