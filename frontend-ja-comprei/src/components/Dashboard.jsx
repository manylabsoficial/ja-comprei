import { useState, useEffect } from 'react';
import {
    ScanLine,
    ClipboardList,
    ChefHat,
    Mic,
    User,
    Sun,
    Moon,
    LogOut
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
    // Theme state (mirrors LandingPage logic for consistency)
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

    // Service Cards Data
    const services = [
        {
            id: 'scanner',
            label: 'Escanear Nota',
            description: 'Leia sua nota fiscal e extraia os itens.',
            icon: ScanLine,
            color: 'bg-terracotta',
            bgLight: 'bg-terracotta/10',
            route: 'scanner'
        },
        {
            id: 'lists',
            label: 'Minhas Listas',
            description: 'Gerencie suas listas de compras.',
            icon: ClipboardList,
            color: 'bg-sage',
            bgLight: 'bg-sage/10',
            route: 'shopping-list' // Placeholder: may show empty state
        },
        {
            id: 'recipes',
            label: 'Gerar Receitas',
            description: 'Receba sugestões do Chef IA.',
            icon: ChefHat,
            color: 'bg-amber-500',
            bgLight: 'bg-amber-500/10',
            route: 'suggestions' // Placeholder
        },
        {
            id: 'voice',
            label: 'Entrada por Voz',
            description: 'Dite sua lista ou comandos.',
            icon: Mic,
            color: 'bg-blue-500',
            bgLight: 'bg-blue-500/10',
            route: null // Not implemented yet
        }
    ];

    const handleServiceClick = (route) => {
        if (route && onNavigate) {
            onNavigate(route);
        } else {
            alert('Funcionalidade em breve!');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 font-sans antialiased transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-cream/90 dark:bg-[#171b19]/90 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
                    {/* Greeting */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sage/20 text-sage">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Bem-vindo de volta,</p>
                            <h1 className="text-lg font-bold font-serif">Chef!</h1>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Alternar tema"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Logout (Decorative for now) */}
                        <button
                            onClick={() => onNavigate && onNavigate('landing')}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400"
                            aria-label="Sair"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
                <h2 className="text-2xl font-serif font-bold mb-6">O que você quer fazer?</h2>

                {/* Services Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleServiceClick(service.route)}
                            className={`group flex flex-col items-start gap-4 p-5 rounded-2xl ${service.bgLight} dark:bg-white/5 border border-transparent hover:border-sage/30 dark:hover:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 text-left`}
                        >
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${service.color} text-white shadow-lg`}>
                                <service.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base mb-1">{service.label}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{service.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Quick Stats (Placeholder) */}
                <section className="mt-10">
                    <h3 className="text-lg font-serif font-semibold mb-4">Resumo Rápido</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border dark:border-white/5">
                            <p className="text-2xl font-bold text-sage">12</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Itens na despensa</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border dark:border-white/5">
                            <p className="text-2xl font-bold text-terracotta">3</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Receitas salvas</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border dark:border-white/5 col-span-2 md:col-span-1">
                            <p className="text-2xl font-bold text-amber-500">R$ 85</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Economia estimada</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                <p>Já Comprei © 2024</p>
                <button
                    onClick={() => onNavigate && onNavigate('debug/recipes')}
                    className="mt-4 text-[10px] opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest font-bold"
                >
                    Modo Teste (Dev)
                </button>
            </footer>
        </div>
    );
}
