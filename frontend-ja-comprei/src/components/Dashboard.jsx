import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    ClipboardList,
    Coins,
    History,
    Mic,
    ScanLine,
    ShoppingBag,
    Sparkles,
    User,
} from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { checkCredits, getSavedRecipes, getShoppingLists } from '../services/recipeService';

const quickMethods = [
    { id: 'voice', label: 'Ditar ingredientes', description: 'Fale naturalmente; a gente organiza.', icon: Mic, route: 'entrada-voz' },
    { id: 'manual', label: 'Digitar manualmente', description: 'Ideal para poucos itens ou ajustes rápidos.', icon: ClipboardList, route: 'entrada-manual' },
];

export default function Dashboard({ onNavigate }) {
    const { user } = useRecipes();
    const [overview, setOverview] = useState({ recipes: [], lists: [], credits: null, privileged: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadOverview() {
            if (!user?.id) return;
            try {
                const [recipes, lists, creditInfo] = await Promise.all([
                    getSavedRecipes(user.id),
                    getShoppingLists(user.id),
                    checkCredits(user.id),
                ]);
                if (active) {
                    setOverview({
                        recipes: recipes || [],
                        lists: lists || [],
                        credits: creditInfo?.balance ?? 0,
                        privileged: Boolean(creditInfo?.isPrivileged),
                    });
                }
            } catch (error) {
                console.error('Não foi possível carregar a visão geral:', error);
            } finally {
                if (active) setLoading(false);
            }
        }

        if (user?.id) loadOverview();
        else setLoading(false);

        return () => { active = false; };
    }, [user]);

    const recentItems = useMemo(() => {
        const recipes = overview.recipes.map((item) => ({ ...item, kind: 'recipe', date: item.created_at }));
        const lists = overview.lists.map((item) => ({ ...item, kind: 'list', date: item.created_at }));
        return [...recipes, ...lists]
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 4);
    }, [overview]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Chef';
    const firstName = displayName.split(' ')[0];
    const handleNavigate = (route) => onNavigate?.(route);

    return (
        <div className="min-h-screen bg-surface-base text-text-primary lg:min-h-0">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border-subtle bg-surface-base/90 px-5 py-4 backdrop-blur-xl lg:hidden">
                <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-500"><User size={19} /></span>
                <div>
                    <p className="text-xs text-text-tertiary">Bem-vindo de volta</p>
                    <h1 className="text-sm font-extrabold capitalize">{firstName}</h1>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1480px] px-4 pb-28 pt-6 sm:px-7 lg:px-8 lg:pb-12 lg:pt-8 2xl:px-12">
                <div className="mb-6 lg:mb-9">
                    <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-gold-500">
                        <Sparkles size={15} /> Sua cozinha, mais inteligente
                    </p>
                    <h2 className="max-w-3xl text-[29px] font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-4xl lg:text-[42px] lg:leading-[1.08]">
                        Olá, <span className="capitalize">{firstName}</span>. O que vamos aproveitar hoje?
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                        Transforme o que você já comprou em refeições possíveis — começando por uma nota, uma foto ou uma lista.
                    </p>
                </div>

                <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
                    <section className="relative overflow-hidden rounded-[26px] border border-border-gold bg-[radial-gradient(circle_at_90%_10%,rgba(232,180,74,0.22),transparent_42%),linear-gradient(135deg,var(--color-surface-overlay),var(--color-surface-raised))] p-5 shadow-2xl shadow-black/20 sm:p-8 xl:col-span-8 xl:min-h-[350px]">
                        <div className="relative z-10 flex h-full max-w-2xl flex-col items-start">
                            <span className="mb-6 flex size-13 items-center justify-center rounded-2xl bg-gold-500 text-on-gold shadow-xl shadow-gold-500/20 sm:mb-8 sm:size-16">
                                <ScanLine size={30} />
                            </span>
                            <span className="rounded-full border border-border-gold bg-gold-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gold-300">Caminho mais rápido</span>
                            <h3 className="mt-4 text-[23px] font-extrabold leading-tight tracking-[-0.035em] sm:text-3xl">Escaneie e descubra o que cozinhar</h3>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">Envie uma nota fiscal ou fotografe seus ingredientes. A leitura organiza tudo antes de sugerir receitas.</p>
                            <button
                                onClick={() => handleNavigate('scanner')}
                                className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-gold-500 px-6 text-sm font-extrabold text-on-gold shadow-lg shadow-gold-500/20 transition hover:-translate-y-0.5 hover:bg-gold-400 active:translate-y-0 sm:mt-7 sm:w-auto"
                            >
                                Começar uma leitura <ArrowRight size={18} />
                            </button>
                        </div>
                        <div className="pointer-events-none absolute -bottom-16 -right-12 size-64 rounded-full border border-gold-500/15" />
                        <div className="pointer-events-none absolute -bottom-4 right-8 size-36 rounded-full border border-gold-500/10" />
                    </section>

                    <aside className="grid grid-cols-3 gap-2 sm:gap-4 xl:col-span-4 xl:grid-cols-1 xl:grid-rows-[auto_1fr]">
                        <div className="rounded-[20px] border border-border-subtle bg-surface-raised p-4 sm:rounded-[24px] sm:p-5 xl:col-span-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">Seu saldo</p>
                                    <div className="mt-2 flex items-end gap-2">
                                        <strong className="text-3xl font-extrabold tracking-[-0.04em] text-gold-400">
                                            {loading ? '—' : overview.privileged ? '∞' : overview.credits ?? '—'}
                                        </strong>
                                        <span className="mb-1 text-xs text-text-tertiary">gerações</span>
                                    </div>
                                </div>
                                <span className="hidden size-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500 sm:flex"><Coins size={20} /></span>
                            </div>
                        </div>

                        <button onClick={() => handleNavigate('minhas-receitas')} className="group rounded-[20px] border border-border-subtle bg-surface-raised p-4 text-left transition hover:border-border-gold hover:bg-surface-hover sm:rounded-[24px] sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-surface-sunken text-gold-500"><BookOpen size={20} /></span>
                                <ArrowRight size={17} className="text-text-tertiary transition group-hover:translate-x-1 group-hover:text-gold-400" />
                            </div>
                            <strong className="mt-3 block text-2xl font-extrabold sm:mt-5">{loading ? '—' : overview.recipes.length}</strong>
                            <span className="mt-1 block text-xs text-text-tertiary">receitas salvas</span>
                        </button>

                        <button onClick={() => handleNavigate('minhas-listas')} className="group rounded-[20px] border border-border-subtle bg-surface-raised p-4 text-left transition hover:border-border-gold hover:bg-surface-hover sm:rounded-[24px] sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-surface-sunken text-gold-500"><ShoppingBag size={20} /></span>
                                <ArrowRight size={17} className="text-text-tertiary transition group-hover:translate-x-1 group-hover:text-gold-400" />
                            </div>
                            <strong className="mt-3 block text-2xl font-extrabold sm:mt-5">{loading ? '—' : overview.lists.length}</strong>
                            <span className="mt-1 block text-xs text-text-tertiary">listas salvas</span>
                        </button>
                    </aside>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-12">
                    <section className="xl:col-span-5">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">Outros caminhos</p>
                                <h3 className="mt-1 text-xl font-extrabold tracking-[-0.025em]">Adicione do seu jeito</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1 2xl:grid-cols-2">
                            {quickMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button key={method.id} onClick={() => handleNavigate(method.route)} className="group rounded-[20px] border border-border-subtle bg-surface-raised p-4 text-left transition hover:-translate-y-0.5 hover:border-border-gold hover:bg-surface-hover sm:rounded-[22px] sm:p-5">
                                        <span className="flex size-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500"><Icon size={21} /></span>
                                        <h4 className="mt-4 text-sm font-extrabold">{method.label}</h4>
                                        <p className="mt-1 text-xs leading-5 text-text-tertiary">{method.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="xl:col-span-7">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">Retome de onde parou</p>
                                <h3 className="mt-1 text-xl font-extrabold tracking-[-0.025em]">Atividade recente</h3>
                            </div>
                            <History size={20} className="text-text-tertiary" />
                        </div>
                        <div className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-raised">
                            {loading ? (
                                <div className="space-y-3 p-5" aria-label="Carregando atividade">
                                    {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-surface-hover" />)}
                                </div>
                            ) : recentItems.length === 0 ? (
                                <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                                    <span className="flex size-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500"><Sparkles size={21} /></span>
                                    <h4 className="mt-4 text-sm font-extrabold">Sua próxima criação aparece aqui</h4>
                                    <p className="mt-1 max-w-sm text-xs leading-5 text-text-tertiary">Comece uma leitura para montar sua primeira lista e descobrir receitas.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {recentItems.map((item) => (
                                        <button
                                            key={`${item.kind}-${item.id}`}
                                            onClick={() => handleNavigate(item.kind === 'list' ? `minhas-listas/${item.id}` : 'minhas-receitas')}
                                            className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-hover"
                                        >
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-gold-500">
                                                {item.kind === 'recipe' ? <BookOpen size={18} /> : <ShoppingBag size={18} />}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-bold">{item.title || 'Sem título'}</span>
                                                <span className="mt-0.5 block text-xs text-text-tertiary">{item.kind === 'recipe' ? 'Receita' : `${item.items?.length || 0} itens`} · {new Date(item.date).toLocaleDateString('pt-BR')}</span>
                                            </span>
                                            <ArrowRight size={17} className="text-text-tertiary transition group-hover:translate-x-1 group-hover:text-gold-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
