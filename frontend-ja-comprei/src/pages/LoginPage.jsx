import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ensureManyLabsAccess, getSafeNextPath } from '../lib/manylabs';
import Logo from '../assets/images/Logo.png';
import kitchenBg from '../assets/images/kitchen_quadrado.png';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('login'); // 'login' or 'signup'

    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate(`/auth/callback?next=${encodeURIComponent(getSafeNextPath(from))}`, { replace: true });
            }
        };
        checkSession();
    }, [navigate, from]);

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getSafeNextPath(from))}`,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message || 'Erro ao conectar com Google.');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'reset_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/redefinir-senha`,
                });
                if (error) throw error;
                setError('Enviamos um link para redefinir sua senha no seu e-mail.');
            } else if (mode === 'login') {
                const { data: authData, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                
                // --- ManyLabs Ensure Access ---
                const access = await ensureManyLabsAccess(authData.session);
                if (!access.ok) {
                    navigate('/acesso-indisponivel', {
                        replace: true,
                        state: { from: getSafeNextPath(from), reason: access.reason, status: access.status },
                    });
                    return;
                }

                // Limpa flag de logout manual para permitir auto-login futuro se necessário
                sessionStorage.removeItem('manual_logout');
                navigate(getSafeNextPath(from), { replace: true });
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setError('Verifique seu email para confirmar o cadastro!');
                setMode('login');
            }
        } catch (err) {
            setError(err.message || 'Erro ao processar. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-surface-base overflow-hidden">
            {/* Foto de comida desfocada — mesma continuidade cinematográfica da landing */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
                style={{ backgroundImage: `url(${kitchenBg})` }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-base/40 via-surface-base/70 to-surface-base" aria-hidden="true" />

            <div className="relative max-w-md w-full bg-surface-overlay/90 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-2xl p-8 space-y-6">

                {/* Logo */}
                <div className="flex justify-center">
                    <img src={Logo} alt="Já Comprei" className="w-20 h-20 object-contain" />
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-primary">
                        {mode === 'reset_password' ? 'Redefinir Senha' : mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                    </h1>
                    <p className="text-sm text-text-tertiary mt-1">
                        {mode === 'reset_password'
                            ? 'Digite seu email para receber um link de recuperação'
                            : mode === 'login'
                                ? 'Entre para acessar suas receitas'
                                : 'Comece a transformar suas compras em receitas'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={`p-3 rounded-lg text-sm text-center ${(error.includes('Verifique') || error.includes('Enviamos')) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface-sunken text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-border-gold"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    {mode !== 'reset_password' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-bold text-text-primary">
                                    Senha
                                </label>
                                {mode === 'login' && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setMode('reset_password'); setError(''); }}
                                        className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                )}
                            </div>
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
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-on-gold font-bold rounded-full shadow-lg shadow-gold-500/30 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Aguarde...' : (mode === 'reset_password' ? 'Enviar Link' : mode === 'login' ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>

                {mode !== 'reset_password' && (
                    <>
                        <div className="flex items-center gap-3 py-2">
                            <div className="flex-1 h-px bg-border-subtle"></div>
                            <span className="text-xs text-text-tertiary font-medium uppercase">ou continue com</span>
                            <div className="flex-1 h-px bg-border-subtle"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 bg-surface-sunken hover:bg-surface-elevated text-text-primary font-bold rounded-full border border-border-default transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </>
                )}

                {/* Toggle Mode */}
                <div className="text-center">
                    <button
                        onClick={() => {
                            if (mode === 'reset_password') {
                                setMode('login');
                            } else {
                                setMode(mode === 'login' ? 'signup' : 'login');
                            }
                            setError('');
                        }}
                        className="text-sm text-gold-300 hover:underline"
                    >
                        {mode === 'reset_password'
                            ? 'Lembrou sua senha? Volte ao login'
                            : mode === 'login'
                                ? 'Não tem conta? Cadastre-se'
                                : 'Já tem conta? Entre'}
                    </button>
                </div>

                {/* Back to Landing */}
                <div className="text-center pt-4 border-t border-border-subtle">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-text-tertiary hover:text-text-primary"
                    >
                        ← Voltar para a página inicial
                    </button>
                </div>
            </div>
        </div>
    );
}
