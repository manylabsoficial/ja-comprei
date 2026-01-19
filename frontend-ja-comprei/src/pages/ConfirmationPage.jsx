import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// import { motion } from 'framer-motion';
import Logo from '../assets/images/Logo.png';

export default function ConfirmationPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verificando seu email...');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const token_hash = params.get('token_hash');
                const type = params.get('type');
                const next = params.get('next') ?? '/dashboard';

                if (!token_hash || !type) {
                    setStatus('error');
                    setMessage('Link de confirmação inválido.');
                    return;
                }

                const { error } = await supabase.auth.verifyOtp({
                    token_hash,
                    type,
                });

                if (error) throw error;

                setStatus('success');
                setMessage('Email confirmado com sucesso!');

                // Redirect after small delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } catch (error) {
                console.error('Confirmation error:', error);
                setStatus('error');
                setMessage('Erro ao confirmar email. O link pode ter expirado.');
            }
        };

        verifyEmail();
    }, [params, navigate]);

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in slide-in-from-bottom duration-500"
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={Logo} alt="Já Comprei" className="w-20 h-20 object-contain" />
                </div>

                {/* Loading State */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-charcoal font-medium animate-pulse">{message}</p>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <div
                        className="flex flex-col items-center animate-in zoom-in duration-300"
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 text-3xl">
                            ✓
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Sucesso!</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <p className="text-sm text-sage mt-4">Redirecionando...</p>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div
                        className="flex flex-col items-center animate-in slide-in-from-left duration-300"
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 text-3xl">
                            ✕
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Ops!</h2>
                        <p className="text-red-500">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 px-6 py-2 bg-sage text-white rounded-lg hover:bg-[#6a9480] transition-colors"
                        >
                            Ir para Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
