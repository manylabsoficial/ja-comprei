import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash2, ChevronRight, Plus, ShoppingBag } from 'lucide-react';
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
            } catch {
                alert('Erro ao excluir lista.');
            }
        }
    };



    // Debug Render
    console.log('MyListsPage Render. Lists:', lists, 'Loading:', loading);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-surface-base text-text-primary font-sans transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border-subtle bg-surface-base/90 px-5 py-4 backdrop-blur-md">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-500">Biblioteca</p>
                    <h1 className="text-lg font-extrabold tracking-tight">Minhas listas</h1>
                </div>
                <button onClick={() => navigate('/scanner')} className="flex size-10 items-center justify-center rounded-full bg-gold-500 text-on-gold shadow-lg shadow-gold-500/20" aria-label="Criar nova lista">
                    <Plus size={21} />
                </button>
            </header>

            {/* Content */}
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 pb-28 pt-5 sm:px-7 lg:px-8 lg:pb-12 lg:pt-8 2xl:px-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-text-tertiary">Carregando listas...</p>
                    </div>
                ) : lists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
                        <div className="bg-gold-500/10 p-6 rounded-2xl mb-6">
                            <ShoppingBag size={42} className="text-gold-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Nenhuma lista salva</h2>
                        <p className="text-text-tertiary mb-8 max-w-sm">
                            Escaneie uma nota fiscal ou crie uma lista manualmente para salvá-la aqui.
                        </p>
                        <button
                            onClick={() => navigate('/scanner')}
                            className="px-8 py-3 bg-gold-500 text-on-gold rounded-full font-bold shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-colors"
                        >
                            Nova Lista
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {lists.map((list) => (
                            <div
                                key={list.id}
                                className="group relative flex items-center justify-between gap-4 rounded-[1.5rem] bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer border border-border-subtle hover:border-border-gold"
                                onClick={() => navigate(`/minhas-listas/${list.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold text-text-primary">{list.title}</h3>
                                        <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary">
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
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunken text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger z-10"
                                        title="Excluir Lista"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="text-text-tertiary">
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
