import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { getRecipeBySlug } from '../services/recipeService';
import RecipeDetail from '../components/RecipeDetail';

export default function SavedRecipeDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await getRecipeBySlug(slug);
                // Mapear campos do Supabase para o formato esperado pelo RecipeDetail
                setRecipe({
                    nome_do_prato: data.title,
                    ingredientes_usados: data.ingredients,
                    modo_de_preparo: data.instructions,
                    visual_tag: data.visual_tag,
                    image_url: data.image_url,
                    // Marcar como já salva para ocultar botão de salvar
                    _isSaved: true,
                    _slug: data.slug
                });
            } catch (err) {
                console.error("Erro ao carregar receita:", err);
                setError("Receita não encontrada.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchRecipe();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-cream dark:bg-[#171b19]">
                <Loader2 size={40} className="animate-spin text-terracotta" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-cream dark:bg-[#171b19] gap-4 px-6">
                <AlertCircle size={48} className="text-red-400" />
                <p className="text-lg text-gray-600 dark:text-gray-400">{error}</p>
                <button
                    onClick={() => navigate('/minhas-receitas')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E07A5F] text-white rounded-full hover:bg-[#d06045] transition-colors"
                >
                    <ArrowLeft size={18} />
                    Voltar para Minhas Receitas
                </button>
            </div>
        );
    }

    return (
        <RecipeDetail
            recipe={recipe}
            onBack={() => navigate('/minhas-receitas')}
            isSavedView={true}
        />
    );
}
