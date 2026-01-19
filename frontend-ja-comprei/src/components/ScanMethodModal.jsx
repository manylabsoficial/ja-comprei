import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function ScanMethodModal({ isOpen, onClose, onSelectGallery, onSelectCamera }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 pb-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#FDFBF7] dark:bg-[#171c19] shadow-2xl transition-all animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white font-sans">
                        Adicionar Nota
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-4 p-6">

                    {/* Camera Option (Disabled) */}
                    {/* Camera Option (Active) */}
                    <button
                        onClick={onSelectCamera}
                        className="group relative flex w-full items-center gap-4 rounded-xl border border-[#2b6cee]/30 bg-[#2b6cee]/10 p-4 text-left transition-all hover:bg-[#2b6cee]/20 active:scale-[0.98] ring-offset-2 focus:ring-2 focus:ring-[#2b6cee]"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2b6cee] text-white shadow-lg shadow-[#2b6cee]/30 group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">Escanear Câmera</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Capture sua nota ao vivo</p>
                        </div>
                    </button>

                    {/* Gallery Option (Active) */}
                    <button
                        onClick={onSelectGallery}
                        className="group relative flex w-full items-center gap-4 rounded-xl border border-[#81B29A]/30 bg-[#81B29A]/10 p-4 text-left transition-all hover:bg-[#81B29A]/20 active:scale-[0.98] ring-offset-2 focus:ring-2 focus:ring-[#81B29A]"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#81B29A] text-white shadow-lg shadow-[#81B29A]/30 group-hover:scale-110 transition-transform">
                            <ImageIcon size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">Galeria de Fotos</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Selecione uma foto do arquivo</p>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
}
