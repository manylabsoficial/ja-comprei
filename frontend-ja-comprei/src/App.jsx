import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useRecipes } from './context/RecipeContext';
import LandingPage from './LandingPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Analyzing from './components/Analyzing';
import Scanning from './components/Scanning';
import ShoppingList from './components/ShoppingList';
import Suggestions from './components/Suggestions';
import RecipeDetailPage from './pages/RecipeDetailPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import MyListsPage from './pages/MyListsPage';
import SavedListDetailsPage from './pages/SavedListDetailsPage';
import ProfilePage from './pages/ProfilePage';
import SavedRecipeDetailPage from './pages/SavedRecipeDetailPage';
import RecipeTestPage from './pages/RecipeTestPage';
import LoginPage from './pages/LoginPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ManualEntryPage from './pages/ManualEntryPage';
import { api } from './services/api';
import { checkCredits, deductCredit } from './services/recipeService';
import AppLayout from './components/AppLayout';

// Mock data as fallback for scanning
const mockIngredients = [
  { id: 1, name: 'Pão Francês', quantity: '4 unidades', checked: true },
  { id: 2, name: 'Mortadela', quantity: '200g', checked: true },
  { id: 3, name: 'Queijo Mussarela', quantity: '150g', checked: true },
  { id: 4, name: 'Tomate', quantity: '2 unidades', checked: true },
  { id: 5, name: 'Alface', quantity: '1 maço', checked: true },
];

export default function App() {
  const navigate = useNavigate();
  const { recipes, setRecipes, ingredients, setIngredients, user } = useRecipes();

  // Handle version/build check to clear cache on new deployments
  useEffect(() => {
    const currentBuildId = import.meta.env.VITE_BUILD_ID;
    const savedBuildId = localStorage.getItem('app_build_id');

    if (savedBuildId && savedBuildId !== currentBuildId) {
      console.log('Nova versão detectada. Limpando cache e recarregando...');
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('app_build_id', currentBuildId);
      window.location.reload();
    } else if (!savedBuildId) {
      localStorage.setItem('app_build_id', currentBuildId);
    }
  }, []);

  // Handle scan completion
  const handleScan = async (file) => {
    navigate('/scanning');

    try {
      if (file) {
        const result = await api.parseNota(file);

        // Backend returns: { ingredientes: [ {item, quantidade}, ... ] }
        if (result && result.ingredientes) {
          const formattedIngredients = result.ingredientes.map((ing, idx) => ({
            id: Date.now() + idx, // Unique ID
            name: ing.item,
            quantity: ing.quantidade || '1 uni',
            // Default check ONLY food items (safety filter)
            checked: !ing.categoria || ing.categoria === 'alimento',
            categoria: ing.categoria
          }));
          setIngredients(formattedIngredients);
        } else {
          console.warn("Nenhum ingrediente encontrado ou formato inválido");
        }
        navigate('/lista');
      } else {
        // Fallback for simulation (should not be reached with current UI)
        setIngredients(mockIngredients);
        navigate('/lista');
      }
    } catch (error) {
      console.error("Erro OCR:", error);
      alert("Houve um erro ao ler a nota. Tente novamente com uma imagem mais clara.");
      navigate('/scanner');
    }
  };

  // Handle manual entry
  const handleManualEntry = (items) => {
    if (!items || items.length === 0) return;

    // Convert to ingredient objects
    const newIngredients = items.map((item, idx) => ({
      id: Date.now() + idx,
      name: item.name,
      quantity: item.quantity || '1 un', // Use provided quantity or default
      unit: 'un', // Generic unit, as quantity field might have it mixed
      checked: true,
      categoria: 'alimento' // Assume food by default
    }));

    setIngredients(newIngredients);
    navigate('/lista');
  };

  // Handle recipe generation
  const handleGenerate = async (selectedIngredients) => {
    // 1. Check Credits
    if (user) {
      try {
        const { allowed, isAdmin, balance } = await checkCredits(user.id);
        if (!allowed) {
          alert(`Saldo insuficiente (${balance} créditos). Assine o Pro para continuar!`);
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar créditos:", error);
        // Optional: Block or allow on error. Let's allow for now but log.
      }
    }

    navigate('/analyzing');

    try {
      const ingredientNames = selectedIngredients.map(i => i.name);
      const result = await api.sugerirReceitas(ingredientNames);

      if (result && result.receitas) {
        const recipesWithImages = result.receitas;

        // Preload images with timeout (prevent eternal hanging)
        await Promise.all(recipesWithImages.map(recipe => {
          return new Promise((resolve) => {
            if (!recipe.image_url) {
              resolve();
              return;
            }
            const img = new Image();
            img.src = recipe.image_url;
            img.onload = resolve;
            img.onerror = resolve;

            // Force resolve after 8 seconds if image is stuck
            setTimeout(() => {
              resolve();
            }, 8000);
          });
        }));

        setRecipes(recipesWithImages);

        // 2. Deduct Credit (if user is logged in)
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
        navigate('/lista');
      }
    } catch (error) {
      console.error("Erro na API", error);
      alert("Falha ao conectar com o Chef. Verifique sua conexão.");
      navigate('/lista');
    }
  };

  // Handle recipe selection
  const handleSelectRecipe = (recipe, index) => {
    navigate(`/receita/${index}`);
  };

  // Handle manual ingredient addition (single item from ShoppingList)
  const handleAddIngredient = (newItem) => {
    setIngredients(prev => [...prev, newItem]);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-[#102217] text-charcoal dark:text-cream font-sans transition-colors duration-200">
      <AppLayout>
        <Routes>
          <Route path="/" element={
            <LandingPage
              onStart={() => navigate('/scanner')}
              onLogin={() => navigate('/login')}
            />
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard onNavigate={(screen) => navigate(`/${screen === 'scanner' ? 'scanner' : screen === 'shopping-list' ? 'lista' : screen}`)} />
            </ProtectedRoute>
          } />

          <Route path="/entrada-manual" element={
            <ProtectedRoute>
              <ManualEntryPage onConfirm={handleManualEntry} />
            </ProtectedRoute>
          } />

          <Route path="/scanner" element={
            <ProtectedRoute>
              <Scanner
                onScan={handleScan}
                onBack={() => navigate('/dashboard')}
              />
            </ProtectedRoute>
          } />

          <Route path="/scanning" element={
            <ProtectedRoute>
              <Scanning />
            </ProtectedRoute>
          } />

          <Route path="/analyzing" element={
            <ProtectedRoute>
              <Analyzing />
            </ProtectedRoute>
          } />

          <Route path="/lista" element={
            <ProtectedRoute>
              <ShoppingList
                ingredients={ingredients}
                onGenerate={handleGenerate}
                onAddIngredient={handleAddIngredient}
                onBack={() => navigate('/scanner')}
              />
            </ProtectedRoute>
          } />

          <Route path="/sugestoes" element={
            <ProtectedRoute>
              <Suggestions
                recipes={recipes}
                onSelectRecipe={handleSelectRecipe}
                onBack={() => navigate('/lista')}
              />
            </ProtectedRoute>
          } />

          <Route path="/minhas-receitas" element={
            <ProtectedRoute>
              <SavedRecipesPage />
            </ProtectedRoute>
          } />

          <Route path="/minhas-listas" element={
            <ProtectedRoute>
              <MyListsPage />
            </ProtectedRoute>
          } />

          <Route path="/minhas-listas/:id" element={
            <ProtectedRoute>
              <SavedListDetailsPage />
            </ProtectedRoute>
          } />

          <Route path="/perfil" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Public: Shared Recipe */}
          <Route path="/r/:slug" element={<SavedRecipeDetailPage />} />

          {/* Protected: Temporary Recipe (Memory) */}
          <Route path="/receita/:index" element={
            <ProtectedRoute>
              <RecipeDetailPage />
            </ProtectedRoute>
          } />

          {/* Protected: Debug */}
          <Route path="/debug/recipes" element={
            <ProtectedRoute>
              <RecipeTestPage />
            </ProtectedRoute>
          } />

          {/* Public: Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confirmacao" element={<ConfirmationPage />} />
        </Routes>
      </AppLayout>
    </div>
  );
}
