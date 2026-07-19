import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function ScanMethodModal({ isOpen, onClose, onSelectGallery, onSelectCamera }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm overflow-hidden rounded-t-[28px] border border-border-subtle bg-surface-overlay shadow-2xl transition-all animate-in slide-in-from-bottom-10 sm:rounded-[28px] sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>

                <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border-strong sm:hidden" aria-hidden="true" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
                    <h2 className="text-lg font-bold text-text-primary font-sans">
                        Como quer adicionar?
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-text-tertiary hover:bg-surface-hover transition-colors"
                        aria-label="Fechar"
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
                        className="group relative flex w-full items-center gap-4 rounded-2xl border border-border-gold bg-gold-500/10 p-4 text-left transition-all hover:bg-gold-500/15 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-on-gold shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
                            <Camera size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-text-primary">Usar a câmera</h3>
                            <p className="text-sm text-text-tertiary">Fotografe agora</p>
                        </div>
                    </button>

                    {/* Gallery Option (Active) */}
                    <button
                        onClick={onSelectGallery}
                        className="group relative flex w-full items-center gap-4 rounded-2xl border border-border-subtle bg-surface-sunken p-4 text-left transition-all hover:border-border-gold hover:bg-surface-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-gold-500 group-hover:scale-105 transition-transform">
                            <ImageIcon size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-text-primary">Escolher da galeria</h3>
                            <p className="text-sm text-text-tertiary">Use uma foto que já existe</p>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
}
