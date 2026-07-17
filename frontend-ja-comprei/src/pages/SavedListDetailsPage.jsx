import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ShoppingList from '../components/ShoppingList';
import { getShoppingListById, checkCredits, deductCredit } from '../services/recipeService';
import { useRecipes } from '../context/RecipeContext';
import { api } from '../services/api';

export default function SavedListDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setRecipes, setIngredients } = useRecipes();
    const [listData, setListData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const data = await getShoppingListById(id);
                setListData(data);
            } catch (error) {
                console.error("Erro ao carregar detalhes da lista:", error);
                alert("Lista não encontrada ou erro ao carregar.");
                navigate('/minhas-listas');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchList();
        }
    }, [id, navigate]);

    const handleGenerate = async (selectedItems) => {
        // 0. Verificar Créditos
        if (user) {
            try {
                const { allowed, isAdmin, balance } = await checkCredits(user.id);
                if (!allowed) {
                    alert(`Saldo insuficiente (${balance} créditos). Assine o Pro para continuar!`);
                    return;
                }
            } catch (error) {
                console.error("Erro ao verificar créditos:", error);
                // Optional: decida se bloqueia ou permite no erro.
            }
        }

        // 1. Atualizar contexto com os ingredientes selecionados dessa lista
        setIngredients(selectedItems);

        // 2. Navegar para tela de loading
        navigate('/analyzing');

        try {
            const ingredientNames = selectedItems.map(i => i.name);
            const result = await api.sugerirReceitas(ingredientNames);

            if (result && result.receitas) {
                const recipesWithImages = result.receitas;

                setRecipes(recipesWithImages);

                // 3. Descontar Crédito
                if (user) {
                    try {
                        await deductCredit(user.id);
                    } catch (error) {
                        console.error("Erro ao descontar crédito:", error);
                    }
                }

                navigate('/sugestoes');
            } else {
                console.error("Formato de resposta inválido", result);
                alert("Erro ao gerar receitas. Tente novamente.");
                // Retorna para a lista atual se der erro
                navigate(`/minhas-listas/${id}`);
            }
        } catch (error) {
            console.error("Erro na API", error);
            alert("Falha ao conectar com o Chef. Verifique sua conexão.");
            navigate(`/minhas-listas/${id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-cream dark:bg-[#171b19]">
                <Loader2 size={40} className="animate-spin text-sage" />
            </div>
        );
    }

    if (!listData) return null;

    return (
        <ShoppingList
            ingredients={listData.items}
            onGenerate={handleGenerate}
            onAddIngredient={() => { }} // Read-onlyish or local add only
            onBack={() => navigate('/minhas-listas')}
        />
    );
}
