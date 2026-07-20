import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, ScanLine, ShoppingCart, User } from 'lucide-react';

const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/dashboard' },
    { id: 'recipes', label: 'Receitas', icon: BookOpen, path: '/minhas-receitas' },
    { id: 'scan', label: 'Escanear', icon: ScanLine, path: '/scanner', isMain: true },
    { id: 'lists', label: 'Listas', icon: ShoppingCart, path: '/minhas-listas' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/perfil' },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isActive = (path) => {
        if (path === '/dashboard') return pathname === path;
        if (path === '/scanner') return ['/scanner', '/scanning', '/analyzing', '/lista', '/sugestoes'].includes(pathname);
        if (path === '/minhas-receitas') return pathname === path || pathname.startsWith('/receita/');
        if (path === '/minhas-listas') return pathname.startsWith('/minhas-listas');
        return pathname === path;
    };

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 box-border w-full max-w-[100vw] overflow-x-clip border-t border-border-subtle bg-surface-overlay/95 px-1 pt-1.5 shadow-[0_-12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-2"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
            aria-label="Navegação principal mobile"
        >
            <div className="mx-auto grid h-[62px] w-full min-w-0 max-w-md grid-cols-5 items-end">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    if (item.isMain) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className="flex w-full min-w-0 max-w-full -translate-y-2 flex-col items-center gap-1 overflow-hidden text-gold-500 transition-transform active:scale-95"
                                aria-label={item.label}
                                aria-current={active ? 'page' : undefined}
                            >
                                <span className={`flex size-14 items-center justify-center rounded-full bg-gold-500 text-on-gold shadow-lg shadow-gold-500/30 ring-4 transition ${active ? 'ring-gold-500/15' : 'ring-surface-overlay'}`}>
                                    <Icon size={23} strokeWidth={2.4} />
                                </span>
                                <span className="max-w-full truncate px-0.5 text-[9px] font-extrabold leading-none min-[360px]:text-[10px]">{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`relative flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-1 overflow-hidden pb-1 text-[9px] font-bold transition-colors min-[360px]:text-[10px] ${active ? 'text-gold-500' : 'text-text-tertiary'}`}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span className={`flex h-8 min-w-10 items-center justify-center rounded-full px-2 transition-colors ${active ? 'bg-gold-500/10' : ''}`}>
                                <Icon size={21} strokeWidth={active ? 2.4 : 2} />
                            </span>
                            <span className="max-w-full truncate px-0.5 leading-none">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
