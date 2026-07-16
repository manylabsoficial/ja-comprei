import { ChefHat, Search, Clock, Flame, Leaf, User, BookOpen, ScanLine } from 'lucide-react';

export default function Recipes({ recipes, onSelectRecipe, onBack }) {

    // Helper to get time and difficulty from recipe props or mock
    const getMeta = (recipe) => ({
        time: recipe.time || '15 min',
        difficulty: recipe.difficulty || 'Fácil',
        tag: recipe.tag || 'Popular'
    });

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 font-display antialiased overflow-hidden pb-20 transition-colors duration-200">

            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between bg-cream/90 dark:bg-[#171b19]/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                        <ChefHat size={24} className="fill-current" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight font-sans">Sugestões do Chef</h1>
                </div>
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Search size={24} />
                </button>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-5 pt-2 pb-28 space-y-8 no-scrollbar">
                {/* Context Message */}
                <div className="px-1">
                    <p className="text-sm font-medium text-[#677e70] font-sans">
                        Com base no seu recibo, aqui estão 3 receitas deliciosas que você pode preparar agora.
                    </p>
                </div>

                {/* Recipe Cards */}
                {recipes.map((recipe) => {
                    const meta = getMeta(recipe);
                    return (
                        <article
                            key={recipe.id}
                            className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-soft transition-all duration-300 hover:shadow-xl"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[2rem]">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${recipe.image}')` }}
                                ></div>
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                                {/* Floating Badge */}
                                <div className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-sage backdrop-blur shadow-sm flex items-center gap-1 font-sans">
                                    {meta.tag === 'Saudável' ? <Leaf size={14} className="fill-current" /> : <Flame size={14} className="fill-current text-terracotta" />}
                                    <span className={meta.tag !== 'Saudável' ? 'text-terracotta' : ''}>{meta.tag}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-4 p-6">
                                <h3 className="font-serif text-2xl font-bold leading-tight text-gray-900">
                                    {recipe.title}
                                </h3>

                                {/* Metadata */}
                                <div className="flex items-center gap-5 text-sm font-medium text-gray-500 font-sans">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={20} className="text-terracotta" />
                                        <span>{meta.time}</span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5">
                                        <Flame size={20} className="text-terracotta" />
                                        <span>{meta.difficulty}</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="mt-2 flex items-center justify-between">
                                    {/* Avatar Pile (Mock) */}
                                    <div className="flex -space-x-2 overflow-hidden">
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80')" }}></div>
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80')" }}></div>
                                    </div>

                                    <button
                                        onClick={() => onSelectRecipe(recipe)}
                                        className="flex items-center justify-center rounded-full bg-sage px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sage/30 transition-transform active:scale-95 font-sans hover:bg-[#72a38b]"
                                    >
                                        Ver Receita
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-[#ebefed] bg-white/95 px-8 pb-8 pt-4 backdrop-blur-xl">
                <div className="flex items-end justify-between">
                    <button
                        onClick={onBack}
                        className="group flex flex-1 flex-col items-center gap-1.5 text-[#677e70] transition-colors hover:text-sage"
                    >
                        <ScanLine size={28} className="transition-transform group-hover:-translate-y-1" />
                        <span className="text-[10px] font-bold tracking-wider font-sans uppercase">Scan</span>
                    </button>

                    <button className="group flex flex-1 flex-col items-center gap-1.5 text-sage transition-colors">
                        <div className="relative">
                            <BookOpen size={28} className="fill-current drop-shadow-sm transition-transform group-hover:-translate-y-1" />
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-terracotta"></span>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider font-sans uppercase">Receitas</span>
                    </button>

                    <button className="group flex flex-1 flex-col items-center gap-1.5 text-[#677e70] transition-colors hover:text-sage">
                        <User size={28} className="transition-transform group-hover:-translate-y-1" />
                        <span className="text-[10px] font-bold tracking-wider font-sans uppercase">Perfil</span>
                    </button>
                </div>
            </nav>

        </div>
    );
}
