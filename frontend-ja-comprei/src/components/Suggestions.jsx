import { useState } from 'react';
import { Search, Clock, ChefHat, User, QrCode, BookOpen, Flame, Leaf, Eye, X } from 'lucide-react';

export default function Suggestions({ recipes, onSelectRecipe, onBack }) {
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    return (
        <div className="relative flex min-h-screen w-full flex-col mx-auto bg-[#FDFBF7] dark:bg-[#171c19] shadow-2xl overflow-hidden font-display antialiased text-[#121614] dark:text-white md:max-w-7xl md:px-0">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-[#FDFBF7]/90 backdrop-blur-md px-6 py-4 dark:bg-[#171c19]/95 border-b border-transparent md:rounded-t-3xl md:border-x md:border-t dark:md:border-white/5 md:bg-white dark:md:bg-[#171c19]">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#81B29A]/15 text-[#81B29A] dark:bg-[#80b294]/20 dark:text-[#80b294]">
                        <UtensilsIcon size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Sugestões do Chef</h1>
                </div>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Search size={24} />
                </button>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-28 pt-6 no-scrollbar md:px-8 md:border-x md:border-[#ebefed] dark:md:border-white/5 md:bg-white dark:md:bg-[#1c221f]">
                {/* Context Message */}
                <div className="px-1 mb-8">
                    <p className="text-sm font-medium text-[#677e70] font-sans dark:text-gray-400">
                        Com base no seu recibo/ingredientes, aqui estão {recipes.length} receitas deliciosas que você pode preparar agora.
                    </p>
                </div>

                <div className="flex flex-col gap-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
                    {recipes.map((recipe, index) => (
                        <article key={recipe.id || index} className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-[#232a26]">
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[2rem]">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${recipe.image_url || recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}')` }}
                                ></div>
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                                {/* Prompt Debug Button */}
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

                                {/* Floating Badge (Example Logic) */}
                                {recipe.tag && (
                                    <div className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#81B29A] backdrop-blur shadow-sm dark:bg-black/80 dark:text-[#80b294]">
                                        <span className="flex items-center gap-1 font-sans">
                                            {recipe.tag === 'Saudável' ? <Leaf size={14} className="fill-current" /> : <Flame size={14} className="fill-current text-[#E07A5F]" />}
                                            {recipe.tag}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-4 p-6">
                                <h3 className="font-serif text-2xl font-bold leading-tight">
                                    {recipe.title || recipe.nome_do_prato}
                                </h3>

                                {/* Metadata */}
                                <div className="flex items-center gap-5 text-sm font-medium text-gray-500 font-sans dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={20} className="text-[#E07A5F]" />
                                        <span>{recipe.time || recipe.tempo_preparo}</span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5">
                                        <ChefIcon size={20} className="text-[#E07A5F]" />
                                        <span>{recipe.difficulty || 'Fácil'}</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="mt-2 flex items-center justify-end">
                                    <button
                                        onClick={() => onSelectRecipe(recipe, index)}
                                        className="flex w-full items-center justify-center rounded-full bg-[#81B29A] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#81B29A]/30 transition-transform active:scale-95 font-sans hover:bg-[#72a38b]"
                                    >
                                        Ver Receita
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-[#ebefed] bg-white/95 px-8 pb-8 pt-4 backdrop-blur-xl dark:bg-[#171c19]/95 dark:border-white/5 left-0 right-0 mx-auto md:rounded-t-2xl md:mb-4 md:shadow-2xl md:border-x">
                <div className="flex items-end justify-between">
                    <button onClick={onBack} className="group flex flex-1 flex-col items-center gap-1.5 text-[#677e70] transition-colors hover:text-[#81B29A] dark:text-gray-500">
                        <QrCode size={28} className="transition-transform group-hover:-translate-y-1" />
                        <span className="text-[10px] font-bold tracking-wider font-sans uppercase">Scan</span>
                    </button>

                    <button className="group flex flex-1 flex-col items-center gap-1.5 text-[#81B29A] transition-colors dark:text-[#80b294]">
                        <div className="relative">
                            <BookOpen size={28} className="drop-shadow-sm transition-transform group-hover:-translate-y-1 fill-current" />
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#E07A5F] dark:border-[#171c19]"></span>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider font-sans uppercase">Receitas</span>
                    </button>

                    <button className="group flex flex-1 flex-col items-center gap-1.5 text-[#677e70] transition-colors hover:text-[#81B29A] dark:text-gray-500">
                        <User size={28} className="transition-transform group-hover:-translate-y-1" />
                        <span className="text-[10px] font-bold tracking-wider font-sans uppercase">Perfil</span>
                    </button>
                </div>
            </nav>

            {/* Prompt Debug Modal */}
            {selectedPrompt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#232a26] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                            <h3 className="font-serif text-lg font-bold">Image Prompt Debug</h3>
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-black/30 p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                            <p className="font-mono text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto">
                                {selectedPrompt}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedPrompt);
                                    alert('Copiado!');
                                }}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-sage hover:bg-sage/10 rounded-lg"
                            >
                                Copiar
                            </button>
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="px-4 py-2 bg-sage text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-oslo-gray transition-colors"
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
