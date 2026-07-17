import { supabase } from '../lib/supabase'

export const ensureDevSession = async () => {
    // Verifica se já temos sessão
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        // Desativado auto-login fake para não poluir o banco central do ManyLabs
        return null;
    }

    // Retorna o usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// === SLUG GENERATION ===

export const generateSlug = (title) => {
    // 1. Slugifica o título
    const base = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-')     // Substitui espaços/especiais por -
        .replace(/(^-|-$)/g, '');        // Remove - do início/fim

    // 2. Gera sufixo HHMMSS (hora de criação)
    const now = new Date();
    const suffix = String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

    return `${base}-${suffix}`;
};

export const saveRecipeToSupabase = async (recipe, userId) => {
    if (!userId) {
        throw new Error('Erro: Usuário não autenticado. O auto-login falhou?')
    }

    // Gerar slug único
    const slug = generateSlug(recipe.nome_do_prato);

    // Mapeamento dos campos do LLM para o Supabase
    const payload = {
        title: recipe.nome_do_prato || recipe.title,
        slug: slug,
        ingredients: recipe.ingredientes_usados || recipe.ingredients, // JSONB
        instructions: recipe.modo_de_preparo || recipe.steps || recipe.instructions || [],    // JSONB: Robust fallback
        visual_tag: recipe.visual_tag,
        image_url: recipe.image_url,
        user_id: userId,
        is_public: false
    }

    const { data, error } = await supabase.schema('jacomprei')
        .from('recipes')
        .insert([payload])
        .select()

    if (error) {
        console.error('Erro ao salvar receita no Supabase:', error)
        throw error
    }

    // Retorna dados com slug para redirecionamento
    const result = { ...data[0], slug };

    // Trigger metadata extraction (non-blocking)
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    fetch(`${API_BASE}/api/recipes/${result.id}/extract-metadata`, { method: 'POST' })
        .catch(e => console.warn('Metadata extraction trigger failed (non-blocking):', e));

    return result;
}

export const getRecipeBySlug = async (slug) => {
    const { data, error } = await supabase.schema('jacomprei')
        .from('recipes')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Erro ao buscar receita por slug:', error);
        throw error;
    }

    return data;
}

export const getSavedRecipes = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase.schema('jacomprei')
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Erro ao buscar receitas salvas:', error)
        throw error
    }

    return data
}

// === SHOPPING LIST PERSISTENCE ===

export const saveShoppingList = async (userId, listTitle, items) => {
    if (!userId) throw new Error('User is not authenticated.');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Session expired. Sign in again to save the list.');

    // `jacomprei` is a private schema and is intentionally not exposed by Data API.
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
    const response = await fetch(`${apiUrl}/auth/shopping-lists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: listTitle || `Lista de Compras ${new Date().toLocaleDateString('pt-BR')}`,
            items,
        }),
    });

    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.detail || 'Unable to save the list.');
    }

    return response.json();
}

const getAuthenticatedApiContext = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Session expired. Sign in again to access saved lists.');

    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
    return { apiUrl, accessToken: session.access_token };
};

const shoppingListRequest = async (path = '', options = {}) => {
    const { apiUrl, accessToken } = await getAuthenticatedApiContext();
    const response = await fetch(`${apiUrl}/auth/shopping-lists${path}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.detail || 'Unable to complete the saved-list request.');
    }

    return response.status === 204 ? null : response.json();
};

export const getShoppingLists = async (userId) => {
    if (!userId) throw new Error('User is not authenticated.');
    return shoppingListRequest();
};

export const getShoppingListById = async (listId) => shoppingListRequest(`/${encodeURIComponent(listId)}`);

export const deleteShoppingList = async (listId) => shoppingListRequest(`/${encodeURIComponent(listId)}`, {
    method: 'DELETE',
});

// === CREDITS SYSTEM ===

export const checkCredits = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado');
    const { apiUrl, accessToken } = await getAuthenticatedApiContext();
    const response = await fetch(`${apiUrl}/auth/credits`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.detail || 'Unable to verify credits.');
    }
    return response.json();
};

export const deductCredit = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado');
    const { apiUrl, accessToken } = await getAuthenticatedApiContext();
    const response = await fetch(`${apiUrl}/auth/credits/consume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.detail || 'Unable to consume credit.');
    }
    const status = await response.json();
    if (!status.allowed) throw new Error('Saldo insuficiente.');
    return status;
};
