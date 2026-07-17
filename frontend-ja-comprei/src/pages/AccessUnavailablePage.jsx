import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getSafeNextPath } from '../lib/manylabs';

export default function AccessUnavailablePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const reason = location.state?.reason;
    const next = getSafeNextPath(location.state?.from);
    const technicalFailure = reason === 'service_error' || reason === 'network_error';

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 dark:bg-[#171c19]">
            <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm dark:border-gray-700 dark:bg-[#202622]">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {technicalFailure ? 'Não foi possível verificar seu acesso' : 'Acesso ao Já Comprei indisponível'}
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {technicalFailure
                        ? 'Sua conta continua autenticada. Tente novamente em instantes; se o problema persistir, fale com o suporte.'
                        : 'Sua Conta ManyLabs está válida, mas este aplicativo ainda não está liberado para ela.'}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                    <button type="button" onClick={() => navigate(`/auth/callback?next=${encodeURIComponent(next)}`, { replace: true })} className="rounded-xl bg-[#E07A5F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#cc684f]">
                        Tentar novamente
                    </button>
                    <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800">
                        {isSigningOut ? 'Saindo...' : 'Sair da conta'}
                    </button>
                </div>
            </section>
        </main>
    );
}
