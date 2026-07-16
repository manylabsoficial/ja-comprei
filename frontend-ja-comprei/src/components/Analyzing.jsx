import { Wind, Receipt, Lightbulb, ChefHat } from 'lucide-react';
import { useState, useEffect } from 'react';

const DICAS_CULINARIAS = [
    { text: "Você sabia? O tomate é tecnicamente uma fruta!", icon: Lightbulb },
    { text: "Dica de Chef: Sempre deixe a carne descansar antes de cortar.", icon: ChefHat },
    { text: "Mantenha suas facas sempre afiadas para evitar acidentes.", icon: Receipt }, // Using Receipt as placeholder or better icon if available
    { text: "O segredo do arroz soltinho é lavar bem os grãos antes.", icon: Wind },
    { text: "Cozinhar é um ato de amor e paciência.", icon: ChefHat },
];

export default function Analyzing() {
    const [currentTip, setCurrentTip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % DICAS_CULINARIAS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const TipIcon = DICAS_CULINARIAS[currentTip].icon;

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-cream dark:bg-[#171b19] text-[#2D2A26] dark:text-gray-100 font-sans transition-colors duration-300">
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full border border-sage/20 dark:border-sage/10 opacity-20"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full border border-terracotta/20 dark:border-terracotta/10 opacity-20"></div>

            <div className="flex flex-col items-center justify-center z-10 p-8 max-w-sm w-full text-center space-y-10">

                {/* Animated Icon Group */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Pulse Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-sage/30 animate-[pulse-ring_4s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-4 rounded-full border border-terracotta/20 animate-[pulse-ring_4s_ease-in-out_infinite] delay-1000"></div>

                    <div className="relative z-10">
                        {/* Steam Animation */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
                            <Wind className="text-terracotta opacity-70 animate-[float_3s_ease-in-out_infinite]" size={32} />
                            <Wind className="text-terracotta opacity-70 animate-[float_3s_ease-in-out_infinite] delay-500 -mt-2" size={24} />
                            <Wind className="text-terracotta opacity-70 animate-[float_3s_ease-in-out_infinite] delay-1000" size={32} />
                        </div>

                        {/* Skillet / Main Icon */}
                        <div className="animate-[rotate-slow_6s_ease-in-out_infinite] text-sage dark:text-sage/80">
                            {/* SVG for Skillet/Pan */}
                            <svg
                                width="96"
                                height="96"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M2 20h20" />
                                <path d="M4 20v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
                                <path d="M12 13V4a2 2 0 0 1 2-2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Text Content with Tips Carousel */}
                <div className="space-y-4 min-h-[120px] transition-all duration-500">
                    <h2 className="text-2xl font-serif text-[#2D2A26] dark:text-gray-100 leading-snug">
                        O Chef está criando o menu...
                    </h2>

                    <div className="flex flex-col items-center gap-2 animate-fade-in transition-opacity duration-500" key={currentTip}>
                        <div className="p-2 rounded-full bg-sage/10 text-sage">
                            <TipIcon size={20} />
                        </div>
                        <p className="text-sm text-[#6B665E] dark:text-gray-400 font-medium tracking-wide italic max-w-xs mx-auto">
                            "{DICAS_CULINARIAS[currentTip].text}"
                        </p>
                    </div>
                </div>

                {/* Loading Dots */}
                <div className="w-16 flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce delay-0"></div>
                    <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce delay-300"></div>
                </div>

            </div>

            {/* Footer Icon */}
            <div className="absolute bottom-8 text-sage opacity-20 dark:opacity-10">
                <Receipt size={24} />
            </div>

        </div>
    );
}
