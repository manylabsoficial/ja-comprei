import { supabase } from './supabase';

export function getApiBaseUrl() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
}

export async function ensureManyLabsAccess(session) {
    if (!session?.access_token) return { ok: false, status: 401, reason: 'unauthorized' };

    try {
        const response = await fetch(`${getApiBaseUrl()}/auth/manylabs/ensure-access`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
        });

        return {
            ok: response.ok,
            status: response.status,
            reason: response.status === 403 ? 'access_required' : response.ok ? null : 'service_error',
        };
    } catch (error) {
        console.error('Falha ao ativar acesso ManyLabs:', error);
        return { ok: false, status: 0, reason: 'network_error' };
    }
}

export async function getCurrentManyLabsAccess() {
    const { data, error } = await supabase.rpc('current_user_has_manylabs_app_access');
    return { hasAccess: Boolean(data), error };
}

export function getSafeNextPath(value, fallback = '/dashboard') {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
    return value;
}
