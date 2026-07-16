import {
    ScanLine,
    Mic,
    ClipboardList,
    User,
    LogOut
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
    // Métodos secundários de entrada — neutros, ícone dourado (sem arco-íris).
    const secondaryMethods = [
        {
            id: 'voice',
            label: 'Voz',
            icon: Mic,
            route: 'entrada-voz'
        },
        {
            id: 'manual-entry',
            label: 'Manual',
            icon: ClipboardList,
            route: 'entrada-manual'
        }
    ];

    const handleNavigate = (route) => {
        if (route && onNavigate) {
            onNavigate(route);
        } else {
            alert('Funcionalidade em breve!');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-surface-base text-text-primary font-sans antialiased">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface-base/90 border-b border-border-subtle">
                <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
                    {/* Greeting */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold-500/15 text-gold-500">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Bem-vindo de volta,</p>
                            <h1 className="text-lg font-bold">Chef!</h1>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => onNavigate && onNavigate('landing')}
                        className="p-2 rounded-full hover:bg-surface-hover transition-colors text-text-tertiary"
                        aria-label="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
                <h2 className="text-2xl font-bold mb-6">O que vamos cozinhar hoje?</h2>

                {/* Hero — ação nº1 do produto */}
                <button
                    onClick={() => handleNavigate('scanner')}
                    className="group w-full flex items-center gap-4 p-6 rounded-2xl bg-gold-500 text-on-gold shadow-lg shadow-gold-500/30 transition-transform hover:-translate-y-0.5 active:scale-[0.99] text-left"
                >
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-on-gold/10 shrink-0">
                        <ScanLine size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Escanear nota / geladeira</h3>
                        <p className="text-sm opacity-80">A partir do que você tem</p>
                    </div>
                </button>

                {/* Métodos secundários */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {secondaryMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => handleNavigate(method.route)}
                            className="group flex flex-col items-start gap-3 p-5 rounded-2xl bg-surface-raised border border-border-subtle hover:border-border-gold shadow-sm transition-all text-left"
                        >
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold-500/10 text-gold-500">
                                <method.icon size={22} />
                            </div>
                            <h3 className="font-bold text-base">{method.label}</h3>
                        </button>
                    ))}
                </div>

                {/* Resumo Rápido */}
                <section className="mt-10">
                    <h3 className="text-lg font-semibold mb-4">Resumo Rápido</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle">
                            <p className="text-2xl font-bold text-gold-500">12</p>
                            <p className="text-xs text-text-tertiary">Itens na despensa</p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle">
                            <p className="text-2xl font-bold text-gold-500">3</p>
                            <p className="text-xs text-text-tertiary">Receitas salvas</p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle col-span-2 md:col-span-1">
                            <p className="text-2xl font-bold text-gold-500">R$ 85</p>
                            <p className="text-xs text-text-tertiary">Economia estimada</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-text-tertiary">
                <p>Já Comprei</p>
            </footer>
        </div>
    );
}
