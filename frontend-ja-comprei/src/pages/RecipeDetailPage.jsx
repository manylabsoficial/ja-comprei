import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import RecipeDetail from '../components/RecipeDetail';

export default function RecipeDetailPage() {
    const { index } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { getRecipeByIndex } = useRecipes();

    // Prioridade: Receita passada via state (Salva ou navegação direta)
    // Fallback: Busca pelo índice no contexto (Fluxo original de sugestão)
    const recipe = location.state?.recipe || (index ? getRecipeByIndex(parseInt(index, 10)) : null);

    // Determina para onde voltar
    const handleBack = () => {
        if (location.state?.from === 'saved' || location.pathname.includes('saved')) {
            navigate('/minhas-receitas');
        } else {
            navigate('/sugestoes');
        }
    };

    if (!recipe) {
        return (
            <div className="h-screen flex items-center justify-center bg-cream dark:bg-[#171b19] font-serif">
                <div className="text-center p-6">
                    <h1 className="text-2xl font-bold mb-4">Receita não encontrada</h1>
                    <p className="mb-6 text-gray-500">Não foi possível carregar os detalhes desta receita.</p>
                    <button
                        onClick={() => navigate('/minhas-receitas')}
                        className="px-6 py-3 bg-[#ee522b] text-white rounded-full hover:bg-orange-600 transition-colors font-sans font-bold"
                    >
                        Voltar ao Livro de Receitas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <RecipeDetail
            recipe={recipe}
            onBack={handleBack}
        />
    );
}
