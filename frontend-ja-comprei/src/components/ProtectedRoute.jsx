import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Validação de sessão no cliente usando getSession para resposta imediata
        // e onAuthStateChange para atualizações em tempo real (evita flashes de tela).
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (session && !error) {
                    let { data: hasAccess, error: rpcError } = await supabase.rpc('current_user_has_manylabs_app_access');
                    
                    if (rpcError || !hasAccess) {
                        if (rpcError) console.error("Erro RPC ManyLabs (primeira tentativa):", rpcError);
                        
                        // Tenta autoativação transparente via backend
                        try {
                            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                            const baseApi = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
                            
                            const response = await fetch(`${baseApi}/auth/manylabs/ensure-access`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${session.access_token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            
                            if (response.ok) {
                                const { data: retryAccess } = await supabase.rpc('current_user_has_manylabs_app_access');
                                hasAccess = retryAccess;
                            }
                        } catch (fetchError) {
                            console.error("Falha na autoativação transparente:", fetchError);
                        }
                    }

                    if (!hasAccess) {
                        // Se mesmo após a tentativa de ativação falhar, desloga
                        await supabase.auth.signOut();
                        setAuthenticated(false);
                    } else {
                        setAuthenticated(true);
                    }
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                let { data: hasAccess } = await supabase.rpc('current_user_has_manylabs_app_access');
                
                if (!hasAccess) {
                    try {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                        const baseApi = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
                        
                        const response = await fetch(`${baseApi}/auth/manylabs/ensure-access`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            const { data: retryAccess } = await supabase.rpc('current_user_has_manylabs_app_access');
                            hasAccess = retryAccess;
                        }
                    } catch (e) {
                        console.error("Erro no interceptor de onAuthStateChange:", e);
                    }
                }

                if (!hasAccess) {
                    await supabase.auth.signOut();
                    setAuthenticated(false);
                } else {
                    setAuthenticated(true);
                }
            } else {
                setAuthenticated(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
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
