
import { useState, useEffect } from 'react';
import { BookOpen, Clock, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import { getSavedRecipes } from '../services/recipeService';

export default function SavedRecipesPage() {
    const navigate = useNavigate();
    const { user } = useRecipes();
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!user) return;
            try {
                const data = await getSavedRecipes(user.id);
                setSavedRecipes(data || []);
            } catch (error) {
                console.error("Erro ao carregar receitas:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRecipes();
        } else {
            // Se usuário demorar a autenticar (ex: refresh), espera um pouco ou mostra loading
            // O próprio layout deve lidar se user for null persistentemente
            const timer = setTimeout(() => {
                if (!user) setLoading(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleSelectRecipe = (recipe) => {
        // Mock navigate to detail - we need stored recipes to follow same structure as AI recipes for Detail page
        // Detail page expects { title, time, ingredients, steps, image_url... }
        // Our DB schema matches this loosely but keys might differ slightly (snake_case vs camelCase or original AI keys)
        // Let's normalize before sending or let RecipeDetail handle it (it already handles normalization!)
        navigate(`/receita/saved`, { state: { recipe } });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-surface-base text-text-primary font-sans transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-surface-base/90 backdrop-blur-md px-5 py-4 border-b border-border-subtle">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-500">Biblioteca</p>
                    <h1 className="text-lg font-extrabold tracking-tight">Minhas receitas</h1>
                </div>
                <button onClick={() => navigate('/scanner')} className="flex size-10 items-center justify-center rounded-full bg-gold-500 text-on-gold shadow-lg shadow-gold-500/20" aria-label="Criar nova receita">
                    <Plus size={21} />
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 pb-28 pt-5 sm:px-7 lg:px-8 lg:pb-12 lg:pt-8 max-w-[1400px] mx-auto w-full 2xl:px-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                        <Loader2 size={40} className="animate-spin text-gold-500" />
                        <p className="text-gray-500 font-sans">Carregando suas criações...</p>
                    </div>
                ) : savedRecipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center">
                        <div className="w-20 h-20 bg-gold-500/10 rounded-2xl flex items-center justify-center text-gold-500">
                            <BookOpen size={40} />
                        </div>
                        <div className="max-w-xs space-y-2">
                            <h3 className="text-xl font-bold">Nenhuma receita salva</h3>
                            <p className="text-text-tertiary font-sans text-sm">
                                Explore seus ingredientes e salve suas receitas favoritas para vê-las aqui.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/scanner')}
                            className="bg-gold-500 hover:bg-gold-400 text-on-gold px-6 py-3 rounded-full font-bold shadow-lg shadow-gold-500/20 transition-all active:scale-95 font-sans"
                        >
                            Criar Nova Receita
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                        {savedRecipes.map((recipe) => (
                            <article
                                key={recipe.id}
                                onClick={() => handleSelectRecipe(recipe)}
                                className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-surface-raised shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer border border-border-subtle hover:border-border-gold"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${recipe.image_url}')` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                                    {/* Tag */}
                                    <div className="absolute top-4 right-4 bg-surface-overlay/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gold-400 font-sans shadow-sm border border-border-subtle">
                                        Salva
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col gap-3">
                                    <h3 className="text-xl font-bold leading-tight group-hover:text-gold-400 transition-colors line-clamp-2">
                                        {recipe.title}
                                    </h3>

                                    <div className="flex items-center gap-4 text-xs font-medium text-text-tertiary font-sans">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-gold-500" />
                                            <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
