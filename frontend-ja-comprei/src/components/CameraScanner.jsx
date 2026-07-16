import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Zap, ZapOff, Image as ImageIcon, Circle } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';

export default function CameraScanner({ onCapture, onClose, onSelectGallery }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { stream, error, isLoading, hasFlash, toggleFlash, startCamera, stopCamera } = useCameraStream();
    const [flashOn, setFlashOn] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleFlashToggle = () => {
        const newState = !flashOn;
        setFlashOn(newState);
        toggleFlash(newState);
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas size to match video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob/file
        canvas.toBlob((blob) => {
            const file = new File([blob], "scanner_capture.jpg", { type: "image/jpeg" });
            onCapture(file);
        }, 'image/jpeg', 0.95);
    };

    if (error) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-white text-center">
                <p className="text-xl font-bold mb-4">Acesso à câmera negado</p>
                <p className="mb-6 text-gray-400">Precisamos de acesso à câmera para escanear notas fiscais.</p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={startCamera}
                        className="px-6 py-3 rounded-xl bg-[#2b6cee] hover:bg-blue-600 transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-sans">
            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* UI Overlay */}
            <div className="relative z-10 flex flex-col h-full justify-between">

                {/* Header */}
                <header className="pt-14 pb-6 px-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-white/20 transition-all active:scale-95"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <h1 className="text-white text-lg font-bold tracking-[-0.015em] drop-shadow-lg">Escanear Nota</h1>

                    <button
                        onClick={handleFlashToggle}
                        disabled={!hasFlash}
                        className={`flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-md transition-all active:scale-95 ${!hasFlash ? 'opacity-50 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
                    >
                        {flashOn ? <Zap size={20} className="fill-current" /> : <ZapOff size={20} />}
                    </button>
                </header>

                {/* Viewfinder */}
                <main className="flex-1 relative flex flex-col items-center justify-center w-full pointer-events-none">
                    <div className="relative w-[75%] aspect-[3/4] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]">
                        {/* Corner Markers */}
                        <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-[4px] border-l-[4px] border-[#2b6cee] rounded-tl-lg drop-shadow-md"></div>
                        <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-[4px] border-r-[4px] border-[#2b6cee] rounded-tr-lg drop-shadow-md"></div>
                        <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-[4px] border-l-[4px] border-[#2b6cee] rounded-bl-lg drop-shadow-md"></div>
                        <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-[4px] border-r-[4px] border-[#2b6cee] rounded-br-lg drop-shadow-md"></div>

                        {/* Grid */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-10">
                            <div className="border-r border-white"></div>
                            <div className="border-r border-white"></div>
                            <div></div>
                            <div className="border-t border-white col-span-3"></div>
                            <div className="border-r border-white"></div>
                            <div className="border-r border-white"></div>
                            <div></div>
                            <div className="border-t border-white col-span-3"></div>
                            <div className="border-r border-white"></div>
                            <div className="border-r border-white"></div>
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-0 right-0 flex justify-center px-6">
                        <p className="text-white/90 text-sm font-medium bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md shadow-sm text-center">
                            Alinhe a nota dentro do quadro
                        </p>
                    </div>
                </main>

                {/* Footer Controls */}
                <footer className="pb-12 pt-16 px-12 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    {/* Gallery Shortcut */}
                    <button
                        onClick={onSelectGallery}
                        className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
                    >
                        <ImageIcon size={24} className="text-white" />
                    </button>

                    {/* Shutter Button */}
                    <button
                        onClick={handleCapture}
                        disabled={isLoading}
                        className="group relative flex items-center justify-center outline-none active:scale-95 transition-transform duration-150"
                    >
                        <div className="w-[84px] h-[84px] rounded-full border-[5px] border-white flex items-center justify-center shadow-2xl bg-black/20 backdrop-blur-sm">
                            <div className="w-[68px] h-[68px] rounded-full bg-white group-active:bg-[#2b6cee] transition-colors duration-150 shadow-inner"></div>
                        </div>
                    </button>

                    {/* Placeholder for symmetry or another action */}
                    <div className="w-12 h-12"></div>
                </footer>
            </div>
        </div>
    );
}
