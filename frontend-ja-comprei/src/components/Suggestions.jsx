import { useState } from 'react';
import { Search, Clock, ChefHat, User, QrCode, BookOpen, Flame, Leaf, Eye, X } from 'lucide-react';

export default function Suggestions({ recipes, onSelectRecipe, onBack }) {
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    return (
        <div className="relative flex min-h-screen w-full flex-col mx-auto bg-surface-base shadow-2xl overflow-hidden font-sans antialiased text-text-primary md:max-w-7xl md:px-0 transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-surface-base/90 backdrop-blur-md px-6 py-4 border-b border-border-subtle md:rounded-t-3xl md:border-x md:border-t">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
                        <UtensilsIcon size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Sugestões do Chef</h1>
                </div>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent hover:bg-surface-hover transition-colors">
                    <Search size={24} />
                </button>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-28 pt-6 no-scrollbar md:px-8 md:border-x md:border-border-subtle">
                {/* Context Message */}
                <div className="px-1 mb-8">
                    <p className="text-sm font-medium text-text-tertiary">
                        Com base no seu recibo/ingredientes, aqui estão {recipes.length} receitas deliciosas que você pode preparar agora.
                    </p>
                </div>

                <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
                    {recipes.map((recipe, index) => (
                        <article
                            key={recipe.id || index}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectRecipe(recipe, index)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRecipe(recipe, index); }}
                            className="group relative flex flex-col aspect-[4/5] overflow-hidden rounded-[2rem] shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer"
                        >
                            {/* Imagem grande — a comida ocupa o card inteiro */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url('${recipe.image_url || recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}')` }}
                            ></div>
                            {/* Gradiente escuro subindo — o chrome some, a comida fala */}
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/30 to-transparent"></div>

                            {/* Prompt Debug Button — apenas em dev */}
                            {import.meta.env.DEV && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPrompt(recipe.descricao_imagem || "Prompt indisponível");
                                    }}
                                    className="absolute top-4 left-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60 hover:text-white transition-all z-20"
                                    title="Ver Prompt da Imagem"
                                >
                                    <Eye size={16} />
                                </button>
                            )}

                            {/* Badge dourado */}
                            {recipe.tag && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-bold text-on-gold shadow-sm">
                                    {recipe.tag === 'Saudável' ? <Leaf size={14} className="fill-current" /> : <Flame size={14} className="fill-current" />}
                                    {recipe.tag}
                                </div>
                            )}

                            {/* Título + meta sobre a foto */}
                            <div className="relative mt-auto flex flex-col gap-2 p-6 text-text-primary">
                                <h3 className="text-2xl font-bold leading-tight">
                                    {recipe.title || recipe.nome_do_prato}
                                </h3>
                                <div className="flex items-center gap-5 text-sm font-medium text-text-secondary">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={18} className="text-gold-500" />
                                        <span>{recipe.time || recipe.tempo_preparo}</span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-text-tertiary"></div>
                                    <div className="flex items-center gap-1.5">
                                        <ChefIcon size={18} className="text-gold-500" />
                                        <span>{recipe.difficulty || 'Fácil'}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            {/* Prompt Debug Modal — apenas em dev */}
            {selectedPrompt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-200">
                    <div className="bg-surface-overlay w-full max-w-lg rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                            <h3 className="text-lg font-bold">Image Prompt Debug</h3>
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="p-2 rounded-full hover:bg-surface-hover"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-surface-sunken p-4 rounded-xl border border-dashed border-border-default">
                            <p className="font-mono text-xs text-text-secondary leading-relaxed max-h-[60vh] overflow-y-auto">
                                {selectedPrompt}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedPrompt);
                                    alert('Copiado!');
                                }}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500/10 rounded-lg"
                            >
                                Copiar
                            </button>
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="px-4 py-2 bg-gold-500 text-on-gold text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper icons components to map close to material symbols
function UtensilsIcon({ size = 24, className }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    )
}

function ChefIcon({ size = 24, className }) {
    return <ChefHat size={size} className={className} />
}
