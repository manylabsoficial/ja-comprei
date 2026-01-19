import { ArrowLeft, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
import ScanMethodModal from './ScanMethodModal';
import CameraScanner from './CameraScanner';

export default function Scanner({ onScan, onBack }) {
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    const handleGalleryClick = () => {
        setIsModalOpen(false);
        fileInputRef.current?.click();
    };

    const handleCameraClick = () => {
        setIsModalOpen(false);
        setShowCamera(true);
    };

    const handleCameraCapture = (file) => {
        setShowCamera(false);
        if (file) {
            onScan(file);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onScan(file);
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden select-none bg-background-dark text-white font-sans md:flex md:items-center md:justify-center md:bg-black/95">
            {/* Desktop Container Wrapper */}
            <div className="w-full h-full relative md:w-full md:max-w-md md:h-[90vh] md:max-h-[900px] md:rounded-[2.5rem] md:overflow-hidden md:shadow-2xl md:border-[8px] md:border-[#222] bg-[#121212]">

                {/* Header */}
                <header className="absolute top-0 left-0 w-full z-10 pt-14 pb-6 px-6 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all active:scale-95">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold tracking-[-0.015em]">Adicionar Item</h1>
                    <div className="w-10 h-10"></div>
                </header>

                {/* Main Content Actions */}
                <main className="flex-1 h-full flex flex-col items-center justify-center p-6 gap-8">

                    <div className="text-center space-y-2 max-w-[280px]">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#2b6cee] to-[#2b6cee]/50 shadow-2xl shadow-[#2b6cee]/20 mb-6">
                            <Plus size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Nova Leitura</h2>
                        <p className="text-gray-400 text-sm">Adicione uma nota fiscal ou lista para extrair ingredientes automaticamente.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full max-w-xs py-4 px-6 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors active:scale-95 shadow-lg"
                    >
                        Adicionar Nota
                    </button>

                </main>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {/* Selection Modal */}
                <ScanMethodModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelectGallery={handleGalleryClick}
                    onSelectCamera={handleCameraClick}
                />

                {/* Camera Overlay */}
                {showCamera && (
                    <CameraScanner
                        onCapture={handleCameraCapture}
                        onClose={() => setShowCamera(false)}
                        onSelectGallery={() => {
                            setShowCamera(false);
                            handleGalleryClick();
                        }}
                    />
                )}

            </div>
        </div>
    );
}

