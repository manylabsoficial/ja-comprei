import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';
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
        stopRecording
    } = useAudioRecorder();

    const [transcribing, setTranscribing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [processError, setProcessError] = useState('');

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setProcessError('');
            setTranscription('');
            startRecording();
        }
    };

    // Auto-transcribe when blob is ready
    useEffect(() => {
        const processAudio = async () => {
            if (mediaBlob && !isRecording) {
                setTranscribing(true);
                try {
                    const result = await api.transcribeAudio(mediaBlob);
                    // Assuming result has a 'text' property from Whisper
                    if (result && result.text) {
                        setTranscription(result.text);
                    } else {
                        // Fallback in case backend structure varies
                        setTranscription(JSON.stringify(result));
                    }
                } catch (err) {
                    console.error("Transcription error:", err);
                    setProcessError("Falha ao transcrever áudio. Tente novamente.");
                } finally {
                    setTranscribing(false);
                }
            }
        };

        processAudio();
    }, [mediaBlob, isRecording]);

    const handleCreateList = () => {
        if (!transcription.trim()) return;

        // Simple parsing logic: split by newlines, commas, or ' e '
        const rawItems = transcription
            .split(/[\n,]| e /i)
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const initialItems = rawItems.map((name, index) => ({
            id: Date.now() + index,
            name: name,
            quantity: '' // Default empty, user clarifies in next screen
        }));

        navigate('/entrada-manual', { state: { initialItems } });
    };

    return (
        <div className="min-h-screen bg-cream dark:bg-[#171b19] text-charcoal dark:text-gray-100 flex flex-col">
            {/* Header */}
            <div className="p-6 pb-2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-500 hover:text-charcoal dark:hover:text-cream transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar
                </button>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-10 max-w-md mx-auto w-full">

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-serif font-bold">O que vamos comprar?</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isRecording ? "Estou ouvindo..." : "Toque no microfone e dite sua lista."}
                    </p>
                </div>

                {/* Recording Visualizer / Button */}
                <div className="relative">
                    {/* Ripple Effect when recording */}
                    {isRecording && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-sage/20 animate-ping opacity-75"></div>
                            <div className="absolute inset-[-10px] rounded-full bg-sage/10 animate-pulse"></div>
                        </>
                    )}

                    <button
                        onClick={handleToggleRecording}
                        disabled={transcribing}
                        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
                            ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-sage hover:bg-[#6a9480] text-white'
                            }
                            ${transcribing ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
                    </button>
                </div>

                {/* Timer or Status */}
                <div className="h-8 flex items-center justify-center">
                    {isRecording && (
                        <span className="font-mono text-xl font-bold text-red-500 animate-pulse">
                            {formatTime(recordingTime)}
                        </span>
                    )}
                    {transcribing && (
                        <span className="flex items-center text-sage font-bold">
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Processando áudio...
                        </span>
                    )}
                </div>

                {/* Error Display */}
                {(recorderError || processError) && (
                    <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center text-sm w-full">
                        <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                        <p>{recorderError || processError}</p>
                    </div>
                )}

                {/* Transcription Result */}
                {transcription && !isRecording && !transcribing && (
                    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-[#232a26] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 w-full">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transcrição</h3>
                            <p className="text-lg leading-relaxed">{transcription}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setTranscription('')}
                                className="flex-1 py-4 rounded-xl font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                            >
                                Tentar de novo
                            </button>
                            <button
                                onClick={handleCreateList}
                                className="flex-1 py-4 rounded-xl font-bold bg-sage text-white hover:bg-[#6a9480] shadow-lg shadow-sage/20 transition-all hover:scale-[1.02] flex items-center justify-center"
                            >
                                <Check size={20} className="mr-2" />
                                Criar Lista
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
