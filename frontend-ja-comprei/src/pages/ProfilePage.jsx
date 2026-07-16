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
            <div className="flex h-screen items-center justify-center bg-cream dark:bg-[#171b19]">
                <p className="text-gray-500">Carregando perfil...</p>
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
        <div className="min-h-screen bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-cream/90 dark:bg-[#171b19]/90 backdrop-blur-md px-6 py-5 border-b border-gray-100 dark:border-white/5 md:hidden">
                <h1 className="text-xl font-bold tracking-tight text-center">Meu Perfil</h1>
            </header>

            <main className="px-6 py-8 max-w-2xl mx-auto md:pt-12">

                {/* Profile Card */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="relative">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-terracotta/10 dark:bg-terracotta/20 text-terracotta">
                            <User size={40} />
                        </div>
                        <div className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-[#232a26] rounded-full shadow-md">
                            <button
                                onClick={handleEditProfile}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E07A5F] text-white hover:bg-[#d06045] transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif">{user.email?.split('@')[0]}</h2>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">{user.email}</p>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-sage/20 text-sage border border-sage/30">
                                {roleLabels[stats.role] || stats.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-terracotta to-orange-600 shadow-lg text-white mb-2">
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
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-white dark:bg-[#232a26] shadow-sm border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-transform"
                    >
                        <Heart size={28} className="text-[#E07A5F]" />
                        <span className="text-2xl font-bold">{loading ? '-' : stats.recipes}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Receitas</span>
                    </button>
                    <button
                        onClick={() => navigate('/minhas-listas')}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-white dark:bg-[#232a26] shadow-sm border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-transform"
                    >
                        <ShoppingBag size={28} className="text-[#81B29A]" />
                        <span className="text-2xl font-bold">{loading ? '-' : stats.lists}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Listas</span>
                    </button>
                </div>

                {/* Menu Options */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Configurações</h3>

                    {/* Preferences Accordion */}
                    <div className="rounded-2xl bg-white dark:bg-[#232a26] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
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
                        className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#232a26] shadow-sm border border-gray-100 dark:border-white/5 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 group mt-4 text-red-500"
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

                <div className="mt-12 text-center">
                    <p className="text-xs text-gray-400">Versão 1.0.0 (Beta)</p>
                </div>
            </main>
        </div>
    );
}
