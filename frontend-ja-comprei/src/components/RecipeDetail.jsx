import { ArrowLeft, Clock, BarChart2, Users, Play, Heart, Check, ChevronLeft, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRecipes } from '../context/RecipeContext';
import { saveRecipeToSupabase } from '../services/recipeService';

export default function RecipeDetail({ recipe, onBack, isSavedView = false }) {
    const { user } = useRecipes();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [imageSource, setImageSource] = useState(recipe?.image_url || recipe?.image || null);

    const handleSave = async () => {
        if (!user) {
            alert('Você precisa estar logado para salvar receitas.');
            return;
        }
        setSaving(true);
        try {
            const result = await saveRecipeToSupabase(recipe, user.id);
            setSaved(true);
            // Redireciona para URL permanente após salvar
            navigate(`/r/${result.slug}`);
        } catch (error) {
            alert('Erro ao salvar receita: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };
    if (!recipe) return null;

    // Normalize data fields (AI might return Portuguese keys)
    const title = recipe.title || recipe.nome_do_prato;
    const time = recipe.time || recipe.tempo_preparo;

    // Ensure ingredients and steps are arrays
    let ingredients = recipe.ingredients || recipe.ingredientes_usados || [];
    if (!Array.isArray(ingredients)) ingredients = [];

    let steps = recipe.steps || recipe.modo_de_preparo || [];

    // Handle string format (e.g. "1. Mix content.\n2. Cook it.")
    if (typeof steps === 'string') {
        // First try splitting by newline if it looks formatted
        if (steps.includes('\n')) {
            steps = steps.split(/\n/).filter(step => step.trim().length > 0);
        } else {
            // If no newlines, try splitting by numbered lists "1.", "2."
            // Regex looks for "number dot space" and splits, keeping the delimiters slightly complex to reconstruct or just plain split
            // Simpler approach: Split by regex and filter
            const splitByNumbers = steps.split(/\d+\.\s+/).filter(Boolean);
            if (splitByNumbers.length > 1) {
                steps = splitByNumbers;
            } else {
                // Fallback: just array of one string
                steps = [steps];
            }
        }
    }

    if (!Array.isArray(steps)) steps = [];

    // Tags logic
    const tags = recipe.tags || ['Popular', 'Spicy'];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden group/design-root bg-surface-base text-text-primary font-sans transition-colors duration-300 lg:grid lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(360px,0.9fr)_minmax(500px,1.1fr)]">

            {/* Hero Section — full-bleed, funde no fundo escuro */}
            <div className="relative w-full h-[40vh] min-h-[320px] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:min-h-0">
                {/* Nav Overlay */}
                <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between p-4 pt-12 bg-gradient-to-b from-black/40 to-transparent">
                    <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors group">
                        <Heart size={24} className="group-hover:text-gold-500 group-active:scale-90 transition-transform" />
                    </button>
                </div>

                {/* Hero Image */}
                <div className="absolute inset-0 w-full h-full bg-surface-sunken">
                    {imageSource ? (
                        <img
                            src={imageSource}
                            alt={title || 'Receita sugerida'}
                            className="w-full h-full object-cover"
                            onError={() => setImageSource(null)}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3a2d1a] via-[#1d1811] to-surface-base text-text-secondary">
                            <ChefHat size={42} className="text-gold-500/80" />
                            <span className="text-sm font-medium">Imagem da receita indisponível</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface-base to-transparent lg:hidden"></div>
                </div>
            </div>

            {/* Right Column Wrapper (Desktop) */}
            <div className="relative flex min-w-0 flex-col bg-surface-base">

                {/* Desktop Floating Save Button */}
                {!isSavedView && !saved && (
                    <div className="absolute top-8 right-8 z-30 hidden lg:block">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-on-gold px-6 py-3 rounded-full shadow-lg shadow-gold-500/30 transition-all active:scale-95 hover:scale-105"
                        >
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="fill-current" />}
                            <span className="font-bold text-sm tracking-wide">
                                {saving ? 'Sal...' : 'Salvar'}
                            </span>
                        </button>
                    </div>
                )}

                {/* Main Content (Scrollable on Desktop) */}
                <div className="relative px-6 -mt-8 z-10 flex flex-col gap-8 pb-32 lg:mt-0 lg:px-10 lg:pt-10 lg:pb-16 xl:px-12">
                    {/* Title Header */}
                    <div className="flex flex-col gap-2 lg:pr-32"> {/* Added padding-right to avoid overlap with floating button */}
                        <div className="flex items-center gap-2 mb-1">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 text-sm font-bold rounded-full border bg-gold-500/10 text-gold-500 border-gold-500/30">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-[36px] leading-[1.1] font-bold">
                            {title}
                        </h1>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm border border-border-subtle">
                            <Clock size={28} className="text-gold-500" />
                            <div className="text-center">
                                <p className="text-xs text-text-tertiary uppercase tracking-wider">Tempo</p>
                                <p className="text-base font-bold">{time}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm border border-border-subtle">
                            <BarChart2 size={28} className="text-gold-500" />
                            <div className="text-center">
                                <p className="text-xs text-text-tertiary uppercase tracking-wider">Dificuldade</p>
                                <p className="text-base font-bold">{recipe.difficulty || 'Média'}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm border border-border-subtle">
                            <Users size={28} className="text-gold-500" />
                            <div className="text-center">
                                <p className="text-xs text-text-tertiary uppercase tracking-wider">Porções</p>
                                <p className="text-base font-bold">4</p>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[22px] font-bold">Ingredientes</h2>
                            <span className="text-sm text-text-tertiary">{ingredients.length} itens</span>
                        </div>
                        <div className="flex flex-col gap-3 rounded-2xl bg-surface-raised p-5 shadow-sm border border-border-subtle">
                            {ingredients.map((ing, idx) => (
                                <div key={idx}>
                                    <label className="flex items-start gap-3 cursor-default group">
                                        <div className="relative flex items-center justify-center size-6 shrink-0 mt-0.5">
                                            <input className="peer appearance-none size-5 rounded-md border-2 border-gold-500/50 checked:bg-gold-500 checked:border-gold-500 transition-all" type="checkbox" checked readOnly />
                                            <Check size={14} className="absolute text-on-gold opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                        </div>
                                        <span className="text-lg text-text-secondary">
                                            {typeof ing === 'string' ? ing : `${ing.quantidade || ''} ${ing.item || ''}`}
                                        </span>
                                    </label>
                                    {idx < ingredients.length - 1 && <div className="h-px w-full bg-border-subtle my-3"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preparation Section */}
                    <div className="flex flex-col gap-5">
                        <h2 className="text-[22px] font-bold">Modo de Preparo</h2>
                        <div className="flex flex-col gap-6">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center justify-center size-8 rounded-full bg-gold-500 text-on-gold font-bold text-sm shadow-md">
                                            {idx + 1}
                                        </div>
                                        {idx < steps.length - 1 && <div className="w-0.5 h-full bg-border-default my-2 rounded-full"></div>}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="bg-surface-raised p-5 rounded-2xl shadow-sm border border-border-subtle">
                                            <p className="text-lg leading-relaxed text-text-secondary">
                                                {step}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Save Action Button (Hidden on Desktop) */}
                    {!isSavedView && !saved && (
                        <div className="mt-6 flex justify-center w-full lg:hidden">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex w-full items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-on-gold px-8 py-4 rounded-full shadow-lg shadow-gold-500/30 transition-all active:scale-95"
                            >
                                {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} className="fill-current" />}
                                <span className="font-bold text-base tracking-wide">
                                    {saving ? 'Salvando...' : 'Salvar Receita'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
