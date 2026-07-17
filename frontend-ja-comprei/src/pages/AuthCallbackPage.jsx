import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ensureManyLabsAccess, getSafeNextPath } from '../lib/manylabs';

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState('Confirmando sua Conta ManyLabs...');

    useEffect(() => {
        let cancelled = false;

        const finishAuthentication = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                if (error) {
                    if (!cancelled) setMessage('Não foi possível concluir sua autenticação. Tente entrar novamente.');
                    return;
                }
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                if (!cancelled) setMessage('Não localizamos uma sessão válida. Volte para entrar novamente.');
                return;
            }

            setMessage('Ativando seu acesso ao Já Comprei...');
            const access = await ensureManyLabsAccess(session);
            const next = getSafeNextPath(params.get('next'));

            if (access.ok) {
                navigate(next, { replace: true });
                return;
            }

            navigate('/acesso-indisponivel', {
                replace: true,
                state: { from: next, reason: access.reason, status: access.status },
            });
        };

        finishAuthentication();
        return () => { cancelled = true; };
    }, [location.search, navigate]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 dark:bg-[#171c19]">
            <div className="max-w-sm text-center">
                <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#E07A5F]" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
            </div>
        </main>
    );
}
