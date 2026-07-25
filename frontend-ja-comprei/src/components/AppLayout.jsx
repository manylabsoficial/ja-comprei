import { useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    ClipboardList,
    LayoutDashboard,
    Mic,
    ScanLine,
    ShoppingBag,
    Sparkles,
    User,
} from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import BottomNav from './BottomNav';

const navigation = [
    { label: 'Visão geral', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Minhas receitas', path: '/minhas-receitas', icon: BookOpen },
    { label: 'Minhas listas', path: '/minhas-listas', icon: ShoppingBag },
];

const routeMeta = [
    { match: (path) => path === '/dashboard', eyebrow: 'Início', title: 'Visão geral' },
    { match: (path) => path === '/scanner' || path === '/scanning', eyebrow: 'Criar', title: 'Escanear ingredientes' },
    { match: (path) => path === '/entrada-manual', eyebrow: 'Criar', title: 'Entrada manual' },
    { match: (path) => path === '/entrada-voz', eyebrow: 'Criar', title: 'Entrada por voz' },
    { match: (path) => path === '/lista', eyebrow: 'Preparar', title: 'Sua despensa' },
    { match: (path) => path === '/analyzing', eyebrow: 'Criar', title: 'Criando sugestões' },
    { match: (path) => path === '/sugestoes', eyebrow: 'Descobrir', title: 'Sugestões para você' },
    { match: (path) => path.startsWith('/receita/'), eyebrow: 'Receitas', title: 'Detalhes da receita' },
    { match: (path) => path === '/minhas-receitas', eyebrow: 'Biblioteca', title: 'Minhas receitas' },
    { match: (path) => path.startsWith('/minhas-listas/'), eyebrow: 'Listas', title: 'Detalhes da lista' },
    { match: (path) => path === '/minhas-listas', eyebrow: 'Biblioteca', title: 'Minhas listas' },
    { match: (path) => path === '/perfil', eyebrow: 'Conta', title: 'Meu perfil' },
];

function isNavigationActive(pathname, path) {
    if (path === '/dashboard') return pathname === path;
    if (path === '/minhas-receitas') return pathname === path || pathname.startsWith('/receita/');
    if (path === '/minhas-listas') return pathname === path || pathname.startsWith('/minhas-listas/');
    return pathname === path;
}

export default function AppLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useRecipes();
    const pathname = location.pathname;
    const isPublicRoute = [
        '/',
        '/landing-classic',
        '/index2',
        '/v2',
        '/cozinhe-o-que-comprou',
        '/login',
        '/confirmacao',
        '/auth/callback',
        '/acesso-indisponivel',
        '/redefinir-senha',
    ].includes(pathname) || pathname.startsWith('/r/');

    if (isPublicRoute) return children;

    const meta = routeMeta.find((item) => item.match(pathname)) || { eyebrow: 'Já Comprei', title: 'Sua cozinha' };
    const isFocusedMobileFlow = [
        '/scanner',
        '/scanning',
        '/analyzing',
        '/entrada-manual',
        '/entrada-voz',
        '/lista',
        '/sugestoes',
    ].includes(pathname) || pathname.startsWith('/receita/') || pathname.startsWith('/minhas-listas/');
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Chef';
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen min-w-0 max-w-full overflow-x-clip bg-surface-base text-text-primary">
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-[280px] flex-col border-r border-border-subtle bg-surface-raised/95 px-4 py-5 backdrop-blur-xl lg:flex">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2 text-left"
                    aria-label="Ir para a visão geral"
                >
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-gold-500 text-on-gold shadow-lg shadow-gold-500/20">
                        <Sparkles size={21} strokeWidth={2.4} />
                    </span>
                    <span>
                        <span className="block text-base font-extrabold tracking-[-0.03em]">Já Comprei</span>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">Cozinha inteligente</span>
                    </span>
                </button>

                <button
                    onClick={() => navigate('/scanner')}
                    className="mt-7 flex w-full items-center justify-between rounded-2xl bg-gold-500 px-4 py-3.5 text-left text-on-gold shadow-lg shadow-gold-500/15 transition hover:bg-gold-400 active:scale-[0.98]"
                >
                    <span className="flex items-center gap-3">
                        <ScanLine size={20} />
                        <span className="text-sm font-extrabold">Nova leitura</span>
                    </span>
                    <ChevronRight size={18} />
                </button>

                <nav className="mt-7" aria-label="Navegação principal">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">Seu espaço</p>
                    <div className="mt-2 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isNavigationActive(pathname, item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active
                                        ? 'bg-gold-500/10 text-gold-400 ring-1 ring-inset ring-gold-500/15'
                                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                    }`}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    <Icon size={19} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="mt-7">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">Adicionar ingredientes</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button onClick={() => navigate('/entrada-manual')} className="rounded-xl border border-border-subtle bg-surface-sunken px-3 py-3 text-left text-text-secondary transition hover:border-border-gold hover:text-text-primary">
                            <ClipboardList size={18} className="mb-2 text-gold-500" />
                            <span className="text-xs font-bold">Manual</span>
                        </button>
                        <button onClick={() => navigate('/entrada-voz')} className="rounded-xl border border-border-subtle bg-surface-sunken px-3 py-3 text-left text-text-secondary transition hover:border-border-gold hover:text-text-primary">
                            <Mic size={18} className="mb-2 text-gold-500" />
                            <span className="text-xs font-bold">Por voz</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/perfil')}
                    className={`mt-auto flex items-center gap-3 rounded-2xl border p-3 text-left transition ${pathname === '/perfil'
                        ? 'border-border-gold bg-gold-500/10'
                        : 'border-border-subtle bg-surface-sunken hover:border-border-strong'
                    }`}
                >
                    <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-xs font-extrabold text-gold-400">{initials}</span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold capitalize">{displayName}</span>
                        <span className="block truncate text-xs text-text-tertiary">Ver perfil</span>
                    </span>
                    <User size={17} className="text-text-tertiary" />
                </button>
            </aside>

            <div className="min-h-screen min-w-0 max-w-full lg:pl-[280px]">
                <header className="sticky top-0 z-40 hidden h-20 items-center justify-between border-b border-border-subtle bg-surface-base/85 px-8 backdrop-blur-xl lg:flex 2xl:px-12">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-500">{meta.eyebrow}</p>
                        <h1 className="mt-0.5 text-xl font-extrabold tracking-[-0.025em]">{meta.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/entrada-manual')} className="flex h-10 items-center gap-2 rounded-xl border border-border-default px-3 text-sm font-bold text-text-secondary transition hover:border-border-gold hover:text-text-primary">
                            <ClipboardList size={17} />
                            Adicionar manualmente
                        </button>
                        <button onClick={() => navigate('/scanner')} className="flex h-10 items-center gap-2 rounded-xl bg-gold-500 px-4 text-sm font-extrabold text-on-gold transition hover:bg-gold-400">
                            <ScanLine size={17} />
                            Escanear
                        </button>
                    </div>
                </header>

                <main className="app-page-content min-h-[calc(100vh-5rem)] min-w-0 max-w-full overflow-x-clip">{children}</main>
            </div>

            {!isFocusedMobileFlow && (
                <div className="lg:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
