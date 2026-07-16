
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Clock, Heart, Search, Loader2 } from 'lucide-react';
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
        <div className="relative flex min-h-screen w-full flex-col bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 font-serif transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-cream/90 backdrop-blur-md px-6 py-4 dark:bg-[#171b19]/95 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen size={24} className="text-sage" />
                        Livro de Receitas
                    </h1>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                        <Loader2 size={40} className="animate-spin text-[#ee522b]" />
                        <p className="text-gray-500 font-sans">Carregando suas criações...</p>
                    </div>
                ) : savedRecipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                            <BookOpen size={40} />
                        </div>
                        <div className="max-w-xs space-y-2">
                            <h3 className="text-xl font-bold">Nenhuma receita salva</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">
                                Explore seus ingredientes e salve suas receitas favoritas para vê-las aqui.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/scanner')}
                            className="bg-[#ee522b] hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#ee522b]/20 transition-all active:scale-95 font-sans"
                        >
                            Criar Nova Receita
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedRecipes.map((recipe) => (
                            <article
                                key={recipe.id}
                                onClick={() => handleSelectRecipe(recipe)}
                                className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white dark:bg-[#232a26] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-white/5"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${recipe.image_url}')` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                                    {/* Tag */}
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#81B29A] font-sans shadow-sm">
                                        Salva
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col gap-3">
                                    <h3 className="text-xl font-bold leading-tight group-hover:text-[#ee522b] transition-colors line-clamp-2">
                                        {recipe.title}
                                    </h3>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 font-sans">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-[#E07A5F]" />
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
