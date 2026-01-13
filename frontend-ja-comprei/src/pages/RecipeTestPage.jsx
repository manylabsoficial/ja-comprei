import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { MOCK_LISTS } from '../data/mockLists';
import { useRecipes } from '../context/RecipeContext';

export default function RecipeTestPage() {
    const navigate = useNavigate();
    const { setIngredients } = useRecipes();

    const handleSelectMock = (mock) => {
        // Formatar para o padrão do app
        const formattedIngredients = mock.ingredientes.map((ing, idx) => ({
            id: Date.now() + idx,
            name: ing.item,
            quantity: ing.quantidade,
            // Simulate Scanner Logic: Only check food items by default
            checked: !ing.categoria || ing.categoria === 'alimento',
            categoria: ing.categoria
        }));

        setIngredients(formattedIngredients);
        navigate('/lista');
    };

    return (
        <div className="min-h-screen bg-cream dark:bg-[#102217] text-charcoal dark:text-cream font-sans p-6 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-sage">Modo Teste</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Selecione uma lista para simular</p>
                </div>
            </div>

            {/* Grid de Mocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {MOCK_LISTS.map((list) => (
                    <button
                        key={list.id}
                        onClick={() => handleSelectMock(list)}
                        className="group flex flex-col items-start gap-4 p-6 rounded-2xl bg-white dark:bg-white/5 border border-transparent hover:border-sage dark:hover:border-sage/50 shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                {list.emoji}
                            </span>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-gray-500">
                                {list.ingredientes.length} itens
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-1 group-hover:text-sage transition-colors">
                                {list.label}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {list.description}
                            </p>
                        </div>

                        {/* Preview de alguns itens */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {list.ingredientes.slice(0, 3).map((ing, i) => (
                                <span key={i} className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full">
                                    {ing.item}
                                </span>
                            ))}
                            {list.ingredientes.length > 3 && (
                                <span className="text-[10px] text-gray-400 px-1">
                                    +{list.ingredientes.length - 3}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-12 text-center text-xs text-gray-400">
                <p>Estes dados não consomem créditos de OCR.</p>
            </div>
        </div>
    );
}
