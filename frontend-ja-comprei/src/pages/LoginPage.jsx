import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from '../assets/images/Logo.png';

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
                navigate(from, { replace: true });
            }
        };
        checkSession();
    }, [navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (error) throw error;
                navigate(from, { replace: true });
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
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
        <div className="min-h-screen bg-cream dark:bg-[#171b19] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#1c221f] rounded-2xl shadow-xl p-8 space-y-6">

                {/* Logo */}
                <div className="flex justify-center">
                    <img src={Logo} alt="Já Comprei" className="w-20 h-20 object-contain" />
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-serif font-bold text-charcoal dark:text-cream">
                        {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {mode === 'login'
                            ? 'Entre para acessar suas receitas'
                            : 'Comece a transformar suas compras em receitas'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={`p-3 rounded-lg text-sm text-center ${error.includes('Verifique') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#171b19] text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-sage"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#171b19] text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-sage"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-sage hover:bg-[#6a9480] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-sm text-sage hover:underline"
                    >
                        {mode === 'login'
                            ? 'Não tem conta? Cadastre-se'
                            : 'Já tem conta? Entre'}
                    </button>
                </div>

                {/* Back to Landing */}
                <div className="text-center pt-4 border-t border-gray-100 dark:border-white/10">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-muted-foreground hover:text-charcoal dark:hover:text-cream"
                    >
                        ← Voltar para a página inicial
                    </button>
                </div>
            </div>
        </div>
    );
}
