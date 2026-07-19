import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Heart, ShoppingBag, ChevronRight, Settings, Moon, Sun, Edit2, Lock, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { supabase } from '../lib/supabase';
import { getSavedRecipes, getShoppingLists, checkCredits } from '../services/recipeService';

export default function ProfilePage() {
    const { user } = useRecipes();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ recipes: 0, lists: 0, credits: 0, isPrivileged: false, role: 'user' });
    const [loading, setLoading] = useState(true);
    const [preferencesOpen, setPreferencesOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    const [recipes, lists, creditInfo] = await Promise.all([
                        getSavedRecipes(user.id),
                        getShoppingLists(user.id),
                        checkCredits(user.id)
                    ]);
                    setStats({
                        recipes: recipes?.length || 0,
                        lists: lists?.length || 0,
                        credits: creditInfo?.balance || 0,
                        isPrivileged: creditInfo?.isPrivileged || false,
                        role: creditInfo?.role || 'user'
                    });
                } catch (error) {
                    console.error("Error fetching stats:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStats();
    }, [user]);

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Tem certeza que deseja sair?");
        if (confirmLogout) {
            // Flag para evitar auto-login em desenvolvimento
            sessionStorage.setItem('manual_logout', 'true');
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    const handleEditProfile = () => {
        alert("Editar perfil: Funcionalidade em desenvolvimento.");
    };

    const handleChangePassword = () => {
        alert("Troca de senha: Funcionalidade em desenvolvimento.");
    };

    const handleChangePlan = () => {
        alert("Troca de plano: Redirecionar para stripe/gateway.");
    };

    if (!user) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-surface-base">
                <p className="text-text-tertiary">Carregando perfil...</p>
            </div>
        );
    }

    // Role labels mapping
    const roleLabels = {
        'dev': 'God Mode',
        'admin': 'Administrador',
        'founder': 'Fundador',
        'user': 'Usuário'
    };

    return (
        <div className="min-h-screen bg-surface-base text-text-primary pb-32 lg:pb-12">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-surface-base/90 backdrop-blur-md px-5 py-4 border-b border-border-subtle md:hidden">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-500">Conta</p>
                <h1 className="text-lg font-extrabold tracking-tight">Meu perfil</h1>
            </header>

            <main className="px-5 py-7 max-w-6xl mx-auto sm:px-7 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-x-8 lg:px-8 lg:pt-8">

                {/* Profile Card */}
                <div className="flex flex-col items-center gap-4 mb-10 lg:sticky lg:top-28 lg:row-span-3 lg:mb-0 lg:rounded-[28px] lg:border lg:border-border-subtle lg:bg-surface-raised lg:p-8">
                    <div className="relative">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gold-500/10 text-gold-500">
                            <User size={40} />
                        </div>
                        <div className="absolute bottom-0 right-0 p-1.5 bg-surface-overlay rounded-full shadow-md">
                            <button
                                onClick={handleEditProfile}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500 text-on-gold hover:bg-gold-400 transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif">{user.email?.split('@')[0]}</h2>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">{user.email}</p>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gold-500/10 text-gold-400 border border-border-gold">
                                {roleLabels[stats.role] || stats.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10 lg:col-start-2">
                    <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 shadow-lg shadow-gold-500/15 text-on-gold mb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-90">Créditos Disponíveis</span>
                            <User size={18} className="opacity-75" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold">{loading ? '-' : (stats.isPrivileged ? '∞' : stats.credits)}</span>
                            <span className="text-sm mb-1 opacity-90">
                                {stats.isPrivileged ? 'Ilimitado' : 'gerações'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/minhas-receitas')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-surface-raised shadow-sm border border-border-subtle hover:border-border-gold hover:scale-[1.02] transition-all"
                    >
                        <Heart size={28} className="text-gold-500" />
                        <span className="text-2xl font-bold">{loading ? '-' : stats.recipes}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Receitas</span>
                    </button>
                    <button
                        onClick={() => navigate('/minhas-listas')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-surface-raised shadow-sm border border-border-subtle hover:border-border-gold hover:scale-[1.02] transition-all"
                    >
                        <ShoppingBag size={28} className="text-gold-500" />
                        <span className="text-2xl font-bold">{loading ? '-' : stats.lists}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Listas</span>
                    </button>
                </div>

                {/* Menu Options */}
                <div className="flex flex-col gap-3 lg:col-start-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Configurações</h3>

                    {/* Preferences Accordion */}
                    <div className="rounded-2xl bg-surface-raised shadow-sm border border-border-subtle overflow-hidden">
                        <button
                            onClick={() => setPreferencesOpen(!preferencesOpen)}
                            className="flex items-center justify-between w-full p-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                    <Settings size={20} />
                                </div>
                                <span className="font-semibold">Preferências</span>
                            </div>
                            {preferencesOpen ? <ChevronUp size={20} className="text-gray-300 dark:text-gray-600" /> : <ChevronDown size={20} className="text-gray-300 dark:text-gray-600" />}
                        </button>

                        {preferencesOpen && (
                            <div className="flex flex-col border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                                <button
                                    onClick={handleChangePassword}
                                    className="flex items-center gap-4 p-4 pl-18 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-white/10 text-gray-500">
                                        <Lock size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Trocar Senha</span>
                                </button>
                                <button
                                    onClick={handleChangePlan}
                                    className="flex items-center gap-4 p-4 pl-18 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-white/10 text-gray-500">
                                        <CreditCard size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Trocar Plano</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-between p-4 rounded-2xl bg-surface-raised shadow-sm border border-border-subtle transition-colors hover:bg-danger/10 group mt-4 text-danger"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500">
                                <LogOut size={20} />
                            </div>
                            <span className="font-semibold">Sair da Conta</span>
                        </div>
                        <ChevronRight size={20} className="text-red-200 group-hover:text-red-400" />
                    </button>
                </div>

                <div className="mt-12 text-center lg:col-start-2">
                    <p className="text-xs text-gray-400">Versão 1.0.0 (Beta)</p>
                </div>
            </main>
        </div>
    );
}
