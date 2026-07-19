import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, ListPlus, Loader2, Mic, Sparkles, Square, WandSparkles } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { api } from '../services/api';

export default function VoiceInputPage() {
    const navigate = useNavigate();
    const {
        isRecording,
        recordingTime,
        mediaBlob,
        error: recorderError,
        startRecording,
        stopRecording,
    } = useAudioRecorder();
    const [transcribing, setTranscribing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [processError, setProcessError] = useState('');

    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    const handleToggleRecording = () => {
        if (isRecording) stopRecording();
        else {
            setProcessError('');
            setTranscription('');
            startRecording();
        }
    };

    useEffect(() => {
        async function processAudio() {
            if (!mediaBlob || isRecording) return;
            setTranscribing(true);
            try {
                const result = await api.transcribeAudio(mediaBlob);
                setTranscription(result?.text || JSON.stringify(result));
            } catch (error) {
                console.error('Transcription error:', error);
                setProcessError('Falha ao transcrever o áudio. Tente novamente.');
            } finally {
                setTranscribing(false);
            }
        }
        processAudio();
    }, [mediaBlob, isRecording]);

    const handleCreateList = () => {
        if (!transcription.trim()) return;
        const initialItems = transcription
            .split(/[\n,]| e /i)
            .map((name) => name.trim())
            .filter(Boolean)
            .map((name, index) => ({ id: Date.now() + index, name, quantity: '' }));
        navigate('/entrada-manual', { state: { initialItems } });
    };

    return (
        <div className="min-h-screen bg-surface-base px-5 pb-28 pt-5 text-text-primary lg:min-h-0 lg:px-8 lg:pb-10 lg:pt-8 2xl:px-12">
            <div className="mx-auto max-w-[1260px]">
                <header className="mb-6 flex items-center gap-4 lg:hidden">
                    <button onClick={() => navigate('/dashboard')} className="flex size-10 items-center justify-center rounded-full border border-border-subtle bg-surface-raised"><ArrowLeft size={20} /></button>
                    <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-gold-500">Nova leitura</p><h1 className="text-lg font-extrabold">Entrada por voz</h1></div>
                </header>

                <div className="grid overflow-hidden rounded-[28px] border border-border-subtle bg-surface-raised lg:min-h-[620px] lg:grid-cols-[0.88fr_1.12fr]">
                    <section className="flex flex-col items-center justify-center border-b border-border-subtle bg-[radial-gradient(circle_at_50%_38%,rgba(232,180,74,0.13),transparent_42%)] px-6 py-12 text-center lg:border-b-0 lg:border-r lg:px-10">
                        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-border-gold bg-gold-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.13em] text-gold-400"><Sparkles size={13} /> Entrada natural</span>
                        <h2 className="max-w-md text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Conte o que você tem na cozinha</h2>
                        <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">Diga os ingredientes e quantidades como lembraria de uma lista. Você poderá revisar a transcrição depois.</p>

                        <div className="relative mt-10">
                            {isRecording && <><div className="absolute inset-0 rounded-full bg-danger/20 animate-ping" /><div className="absolute -inset-4 rounded-full border border-danger/25 animate-pulse" /></>}
                            <button
                                onClick={handleToggleRecording}
                                disabled={transcribing}
                                className={`relative z-10 flex size-24 items-center justify-center rounded-full shadow-2xl transition-all duration-300 sm:size-28 ${isRecording
                                    ? 'bg-danger text-white shadow-danger/20 hover:bg-danger/90'
                                    : 'bg-gold-500 text-on-gold shadow-gold-500/20 hover:-translate-y-1 hover:bg-gold-400'
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                                aria-label={isRecording ? 'Parar gravação' : 'Começar gravação'}
                            >
                                {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
                            </button>
                        </div>

                        <div className="mt-6 h-8">
                            {isRecording && <span className="font-mono text-xl font-bold text-danger animate-pulse">{formatTime(recordingTime)}</span>}
                            {transcribing && <span className="flex items-center gap-2 text-sm font-bold text-gold-400"><Loader2 size={18} className="animate-spin" /> Processando áudio...</span>}
                            {!isRecording && !transcribing && <span className="text-xs font-semibold text-text-tertiary">Clique para começar a gravar</span>}
                        </div>
                    </section>

                    <section className="flex min-h-[430px] flex-col p-5 sm:p-8 lg:p-10">
                        <div className="flex items-start justify-between border-b border-border-subtle pb-5">
                            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">Resultado</p><h3 className="mt-1 text-xl font-extrabold">Revise antes de continuar</h3></div>
                            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-500"><WandSparkles size={20} /></span>
                        </div>

                        {(recorderError || processError) && (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{recorderError || processError}</p></div>
                        )}

                        {transcription && !isRecording && !transcribing ? (
                            <div className="flex flex-1 flex-col pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex-1 rounded-2xl border border-border-subtle bg-surface-sunken p-5 sm:p-6">
                                    <p className="text-base leading-7 text-text-secondary sm:text-lg">{transcription}</p>
                                </div>
                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button onClick={() => setTranscription('')} className="h-12 rounded-xl border border-border-default px-5 text-sm font-bold text-text-secondary transition hover:bg-surface-hover">Tentar novamente</button>
                                    <button onClick={handleCreateList} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 text-sm font-extrabold text-on-gold shadow-lg shadow-gold-500/15 transition hover:bg-gold-400"><Check size={18} /> Revisar lista</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
                                <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-sunken text-text-tertiary"><ListPlus size={28} /></span>
                                <h4 className="mt-5 text-sm font-extrabold">A transcrição aparecerá aqui</h4>
                                <p className="mt-2 max-w-sm text-xs leading-5 text-text-tertiary">Experimente dizer: “dois tomates, meio quilo de frango e uma cebola”.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
