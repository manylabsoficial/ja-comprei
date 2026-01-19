import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // getUser() faz uma chamada ao backend do Supabase para validar o token.
                // Isso é mais seguro que getSession() que apenas lê o localStorage.
                const { data: { user }, error } = await supabase.auth.getUser();

                if (user && !error) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.error("Erro na validação de auth:", error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFBF7] dark:bg-[#171c19]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#E07A5F]"></div>
                    <p className="text-sm text-gray-500 animate-pulse">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        // Redirect to login, optionally saving the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
