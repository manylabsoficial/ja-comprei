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
    if (!userId) throw new Error('Usuário não autenticado');

    const payload = {
        user_id: userId,
        title: listTitle || `Lista de Compras ${new Date().toLocaleDateString('pt-BR')}`,
        items: items // JSONB
    };

    const { data, error } = await supabase.schema('jacomprei')
        .from('shopping_lists')
        .insert([payload])
        .select();

    if (error) {
        console.error('Erro ao salvar lista:', error);
        throw error;
    }

    return data;
}

export const getShoppingLists = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado');

    console.log('Fetching lists for user:', userId);

    const { data, error } = await supabase.schema('jacomprei')
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar listas:', error);
        throw error;
    }

    console.log('Lists found:', data);
    return data;
}

export const deleteShoppingList = async (listId) => {
    const { error } = await supabase.schema('jacomprei')
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

    if (error) {
        console.error('Erro ao deletar lista:', error);
        throw error;
    }
}

export const getShoppingListById = async (listId) => {
    const { data, error } = await supabase.schema('jacomprei')
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .single();

    if (error) {
        console.error('Erro ao buscar lista por ID:', error);
        throw error;
    }

    return data;
}

// === CREDITS SYSTEM ===

export const checkCredits = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // Fetch profile
    let { data: profile, error } = await supabase.schema('jacomprei')
        .from('profiles')
        .select('credits_balance, subscription_tier')
        .eq('id', userId)
        .single();

    if (error) {
        console.warn('Profile not found, assuming defaults or error:', error);
        throw error;
    }

    const role = profile.subscription_tier;
    const isPrivileged = role === 'dev' || role === 'admin';
    const hasCredits = profile.credits_balance > 0;

    return {
        allowed: isPrivileged || hasCredits,
        isPrivileged,
        role,
        balance: profile.credits_balance
    };
};

export const deductCredit = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // 1. Re-check status/admin
    const { data: profile, error: profileError } = await supabase.schema('jacomprei')
        .from('profiles')
        .select('credits_balance, subscription_tier')
        .eq('id', userId)
        .single();

    if (profileError) throw profileError;

    // Privilege bypass (God Mode / Admin)
    if (profile.subscription_tier === 'dev' || profile.subscription_tier === 'admin') {
        console.log('Privileged user (dev/admin): No credit deducted.');
        return;
    }

    if (profile.credits_balance <= 0) {
        throw new Error('Saldo insuficiente.');
    }

    // 2. Deduct Logic
    const { error: updateError } = await supabase.schema('jacomprei')
        .from('profiles')
        .update({ credits_balance: profile.credits_balance - 1 })
        .eq('id', userId);

    if (updateError) throw updateError;

    // 3. Log Transaction
    const { error: logError } = await supabase.schema('jacomprei')
        .from('credit_transactions')
        .insert([{
            user_id: userId,
            amount: -1,
            description: 'Geração de Receita'
        }]);

    if (logError) {
        console.error('Error logging transaction:', logError);
    }
};
