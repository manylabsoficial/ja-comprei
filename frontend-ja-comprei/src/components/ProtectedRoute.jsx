import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCurrentManyLabsAccess } from '../lib/manylabs';

export default function ProtectedRoute({ children }) {
    const [state, setState] = useState({ loading: true, authenticated: false, access: false, error: null });
    const location = useLocation();

    useEffect(() => {
        let cancelled = false;

        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (!session || error) {
                    if (!cancelled) setState({ loading: false, authenticated: false, access: false, error: null });
                    return;
                }

                const { hasAccess, error: accessError } = await getCurrentManyLabsAccess();
                if (!cancelled) setState({ loading: false, authenticated: true, access: hasAccess, error: accessError || null });
            } catch (error) {
                console.error('Erro na validação de acesso:', error);
                if (!cancelled) setState({ loading: false, authenticated: true, access: false, error });
            }
        };

        checkAuth();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => queueMicrotask(checkAuth));

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    if (state.loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7] dark:bg-[#171c19]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#E07A5F]" />
                    <p className="animate-pulse text-sm text-gray-500">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    if (!state.authenticated) return <Navigate to="/login" state={{ from: location }} replace />;

    if (!state.access) {
        return <Navigate to="/acesso-indisponivel" state={{ from: location.pathname, reason: state.error ? 'service_error' : 'access_required' }} replace />;
    }

    return children;
}
