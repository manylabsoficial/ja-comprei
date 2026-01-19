import { Wind, Receipt } from 'lucide-react';
import Logo from '../assets/images/Logo.png';

export default function Loading() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-cream font-sans">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full border border-sage opacity-10"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full border border-terracotta opacity-10"></div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center z-10 p-8 max-w-sm w-full text-center space-y-10">

                {/* Animated Icon Container */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-sage opacity-20 animate-pulse-ring"></div>
                    <div className="absolute inset-4 rounded-full border border-terracotta opacity-10 animate-pulse-ring" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10">
                        {/* Steam Animation */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
                            <Wind className="text-terracotta opacity-70 animate-steam-1" size={24} />
                            <Wind className="text-terracotta opacity-70 animate-steam-2 text-2xl -mt-2" size={20} />
                            <Wind className="text-terracotta opacity-70 animate-steam-3" size={24} />
                        </div>

                        {/* Main Logo with Tilt */}
                        <div className="animate-tilt">
                            <img src={Logo} alt="Já Comprei Logo" className="w-24 h-24 object-contain" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-serif text-charcoal leading-snug">
                        O Chef está analisando seus ingredientes...
                    </h2>
                    <p className="text-sm text-[#6B665E] font-light tracking-wide">
                        Criando receitas deliciosas para você.
                    </p>
                </div>

                {/* Bouncing Dots */}
                <div className="w-16 flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>

            {/* Footer Icon */}
            <div className="absolute bottom-8 text-sage opacity-40">
                <Receipt size={32} />
            </div>
        </div>
    );
}
