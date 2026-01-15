import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';

export default function ConfirmationPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verificando sua chave mágica...');

    useEffect(() => {
        const handleConfirmation = async () => {
            const token_hash = params.get('token_hash');
            const type = params.get('type');
            const error = params.get('error');
            const error_description = params.get('error_description');

            // 1. Check for URL errors (link expired, etc)
            if (error) {
                setStatus('error');
                setMessage(decodeURIComponent(error_description || 'Link inválido ou expirado.'));
                return;
            }

            // 2. Validate Token
            if (token_hash && type) {
                try {
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        token_hash,
                        type,
                    });

                    if (verifyError) {
                        throw verifyError;
                    }

                    setStatus('success');
                    setMessage('Tudo certo! Sua cozinha está pronta.');

                    // Redirect after short delay
                    setTimeout(() => {
                        navigate('/perfil');
                    }, 2000);

                } catch (err) {
                    console.error("Confirmation Error:", err);
                    setStatus('error');
                    setMessage('Opa! Esse link parece antigo ou inválido. Tente solicitar um novo.');
                }
            } else {
                // Fallback for implicit grant or weird states
                setStatus('error');
                setMessage('Link inválido. Verifique se copiou a URL inteira.');
            }
        };

        handleConfirmation();
    }, [params, navigate]);

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">

                {/* Loading State */}
                {status === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-16 h-16 border-4 border-sage border-t-terracotta rounded-full animate-spin mb-4"></div>
                        <h2 className="text-2xl font-serif text-charcoal font-bold">Quase lá...</h2>
                        <p className="text-muted-foreground">{message}</p>
                    </motion.div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="text-6xl mb-4">✨</div>
                        <h2 className="text-2xl font-serif text-sage font-bold">Sucesso!</h2>
                        <p className="text-charcoal">{message}</p>
                        <p className="text-sm text-muted-foreground mt-4">Redirecionando...</p>
                    </motion.div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-serif text-terracotta font-bold">Algo deu errado</h2>
                        <p className="text-charcoal mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-charcoal text-white rounded-full font-bold hover:bg-opacity-90 transition-all"
                        >
                            Voltar ao Login
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
