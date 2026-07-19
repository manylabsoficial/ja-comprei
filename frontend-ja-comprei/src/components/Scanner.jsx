import { ArrowLeft, Camera, FileImage, ImagePlus, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import ScanMethodModal from './ScanMethodModal';
import CameraScanner from './CameraScanner';

export default function Scanner({ onScan, onBack }) {
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const submitFile = (file) => {
        if (file?.type?.startsWith('image/')) onScan(file);
    };

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
        submitFile(file);
    };

    return (
        <div className="min-h-screen bg-surface-base px-5 pb-28 pt-5 text-text-primary lg:min-h-0 lg:px-8 lg:pb-10 lg:pt-8 2xl:px-12">
            <div className="mx-auto max-w-[1360px]">
                <header className="mb-7 flex items-center gap-4 lg:hidden">
                    <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-text-primary">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold-500">Nova leitura</p>
                        <h1 className="text-lg font-extrabold">Adicionar ingredientes</h1>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.78fr)_minmax(480px,1.22fr)] lg:gap-6 xl:gap-10">
                    <section className="order-2 hidden flex-col justify-center rounded-[28px] border border-border-subtle bg-surface-raised p-6 sm:p-8 lg:order-1 lg:flex lg:min-h-[610px] lg:p-10">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-gold-500 text-on-gold shadow-lg shadow-gold-500/20">
                            <ScanLine size={28} />
                        </span>
                        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.15em] text-gold-500">Passo 1 de 3</p>
                        <h2 className="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-4xl">Mostre o que entrou na sua cozinha</h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary sm:text-base">Uma foto bem iluminada da nota ou dos ingredientes é suficiente. Você revisa tudo antes de gerar qualquer receita.</p>

                        <div className="mt-8 space-y-4 border-t border-border-subtle pt-7">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500"><Sparkles size={17} /></span>
                                <div><strong className="block text-sm">Leitura automática</strong><span className="mt-0.5 block text-xs leading-5 text-text-tertiary">Identificamos nomes e quantidades para você.</span></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500"><ShieldCheck size={17} /></span>
                                <div><strong className="block text-sm">Você mantém o controle</strong><span className="mt-0.5 block text-xs leading-5 text-text-tertiary">Nenhuma sugestão é criada antes da sua revisão.</span></div>
                            </div>
                        </div>
                    </section>

                    <section className="order-1 rounded-[26px] border border-border-subtle bg-surface-raised p-3 sm:p-6 lg:order-2 lg:min-h-[610px] lg:rounded-[28px]">
                        <div
                            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(event) => {
                                event.preventDefault();
                                setIsDragging(false);
                                submitFile(event.dataTransfer.files?.[0]);
                            }}
                            className={`flex h-full min-h-[570px] flex-col items-center justify-center rounded-[20px] border-2 border-dashed px-5 py-10 text-center transition sm:min-h-[500px] sm:rounded-[22px] sm:px-6 sm:py-12 lg:min-h-[560px] ${isDragging
                                ? 'border-gold-400 bg-gold-500/10'
                                : 'border-border-default bg-surface-sunken hover:border-border-gold'
                            }`}
                        >
                            <span className="flex size-20 items-center justify-center rounded-[24px] border border-border-subtle bg-surface-overlay text-gold-500 shadow-xl shadow-black/20">
                                <ImagePlus size={34} />
                            </span>
                            <h3 className="mt-7 text-xl font-extrabold tracking-[-0.025em] sm:text-2xl">
                                <span className="sm:hidden">Escolha como adicionar sua foto</span>
                                <span className="hidden sm:inline">Arraste uma imagem para cá</span>
                            </h3>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-text-tertiary">Use uma foto nítida da nota ou dos ingredientes. Você revisa tudo antes de continuar.</p>

                            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                                <button onClick={handleGalleryClick} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 text-sm font-extrabold text-on-gold transition hover:bg-gold-400">
                                    <FileImage size={18} /> Escolher foto
                                </button>
                                <button onClick={handleCameraClick} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border-default bg-surface-overlay px-5 text-sm font-bold text-text-primary transition hover:border-border-gold">
                                    <Camera size={18} /> Usar câmera
                                </button>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="mt-5 text-xs font-bold text-text-tertiary underline decoration-border-strong underline-offset-4 transition hover:text-gold-400">Ver opções de captura</button>
                        </div>
                    </section>
                </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={(event) => submitFile(event.target.files?.[0])} accept="image/*" className="hidden" />

            <ScanMethodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectGallery={handleGalleryClick}
                onSelectCamera={handleCameraClick}
            />

            {showCamera && (
                <CameraScanner
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                    onSelectGallery={() => { setShowCamera(false); handleGalleryClick(); }}
                />
            )}
        </div>
    );
}
