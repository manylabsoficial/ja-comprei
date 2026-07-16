import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trash2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { getShoppingLists, deleteShoppingList } from '../services/recipeService';

export default function MyListsPage() {
    const navigate = useNavigate();
    const { user } = useRecipes();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLists = async () => {
            if (!user) return;
            try {
                const data = await getShoppingLists(user.id);
                setLists(data || []);
            } catch (error) {
                console.error("Erro ao carregar listas:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchLists();
        } else {
            // Fallback para evitar loading infinito se user demorar a carregar
            const timer = setTimeout(() => {
                if (!user) setLoading(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir esta lista?')) {
            try {
                await deleteShoppingList(id);
                setLists(lists.filter(l => l.id !== id));
            } catch (error) {
                alert('Erro ao excluir lista.');
            }
        }
    };



    // Debug Render
    console.log('MyListsPage Render. Lists:', lists, 'Loading:', loading);

    return (
        <div className="relative flex min-h-screen w-full flex-col mx-auto bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 font-sans md:max-w-7xl transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-cream/90 backdrop-blur-md px-6 py-4 dark:bg-[#171b19]/95 border-b border-gray-100 dark:border-white/5">
                <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold tracking-tight">Minhas Listas</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            {/* Content */}
            <main className="flex-1 px-6 pb-24 pt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">Carregando listas...</p>
                    </div>
                ) : lists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
                        <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-full mb-6">
                            <ShoppingBag size={48} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h2 className="text-xl font-serif font-bold mb-2">Nenhuma lista salva</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
                            Escaneie uma nota fiscal ou crie uma lista manualmente para salvá-la aqui.
                        </p>
                        <button
                            onClick={() => navigate('/scanner')}
                            className="px-8 py-3 bg-sage text-white rounded-full font-bold shadow-lg hover:bg-oslo-gray transition-colors"
                        >
                            Nova Lista
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {lists.map((list) => (
                            <div
                                key={list.id}
                                className="group relative flex items-center justify-between gap-4 rounded-[1.5rem] bg-white dark:bg-[#1A2C22] p-6 shadow-sm transition-all hover:shadow-md cursor-pointer border border-transparent hover:border-sage/20"
                                onClick={() => navigate(`/minhas-listas/${list.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-sage dark:bg-sage/10">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold text-charcoal dark:text-white">{list.title}</h3>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <Calendar size={12} />
                                            <span>{new Date(list.created_at).toLocaleDateString('pt-BR')}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>{list.items?.length || 0} itens</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleDelete(e, list.id)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 z-10"
                                        title="Excluir Lista"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="text-gray-300 dark:text-gray-600">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
