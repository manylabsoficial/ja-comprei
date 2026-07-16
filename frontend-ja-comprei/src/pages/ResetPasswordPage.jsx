import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from '../assets/images/Logo.png';
import kitchenBg from '../assets/images/kitchen_quadrado.png';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Ao carregar esta rota após o clique no e-mail,
        // o Supabase JS intercepta a hash na URL e inicializa a sessão temporariamente
        // para que a atualização de senha seja possível.
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Modo de recuperação de senha ativado');
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({ password });
            
            if (error) throw error;
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 3000);
            
        } catch (err) {
            setError(err.message || 'Erro ao redefinir a senha. O link pode ter expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-surface-base overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
                style={{ backgroundImage: `url(${kitchenBg})` }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-base/40 via-surface-base/70 to-surface-base" aria-hidden="true" />

            <div className="relative max-w-md w-full bg-surface-overlay/90 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-8 space-y-6">
                
                <div className="flex justify-center">
                    <img src={Logo} alt="Já Comprei" className="w-20 h-20 object-contain" />
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-primary">
                        Nova Senha
                    </h1>
                    <p className="text-sm text-text-tertiary mt-1">
                        Defina uma nova senha para sua conta
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-lg text-sm text-center bg-danger/10 text-danger">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="p-3 rounded-lg text-sm text-center bg-success/10 text-success">
                        Senha redefinida com sucesso! Redirecionando...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-1">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface-sunken text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-border-gold"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-on-gold font-bold rounded-full shadow-lg shadow-gold-500/30 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Aguarde...' : 'Salvar nova senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
