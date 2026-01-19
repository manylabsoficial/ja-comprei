import { supabase } from '../lib/supabase'

export const ensureDevSession = async () => {
    // Verifica se já temos sessão
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        // SEGURANÇA: Só permite auto-login em ambiente de desenvolvimento
        const isLocahost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (!import.meta.env.DEV || !isLocahost) {
            // Em produção ou rede externa, retorna null silenciosamente
            return null;
        }

        console.log('DEV MODE: Iniciando auto-login...')
        // Auto-login hardcoded para desenvolvimento
        const { error } = await supabase.auth.signInWithPassword({
            email: 'dev@jacomprei.com',
            password: 'senha123',
        })

        if (error) {
            console.warn('DEV MODE: Login falhou. Tentando criar usuário dev...', error.message)

            // Tenta criar o usuário se não existir
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: 'dev@jacomprei.com',
                password: 'senha123',
            })

            if (signUpError) {
                console.error('DEV MODE FATAL: Falha ao criar usuário.', signUpError)
                return null
            }

            console.log('DEV MODE: Usuário criado com sucesso!', signUpData)

            // Se o auto-confirm não estiver ativo, o login pode não ocorrer automaticamente.
            if (!signUpData.session) {
                alert('DEV MODE: Usuário criado! Verifique seu email para confirmar (se necessário) ou desative "Confirm Email" no Supabase.')
                return null
            }
        }
        console.log('DEV MODE: Login realizado com sucesso')
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

    const { data, error } = await supabase
        .from('recipes')
        .insert([payload])
        .select()

    if (error) {
        console.error('Erro ao salvar receita no Supabase:', error)
        throw error
    }

    // Retorna dados com slug para redirecionamento
    return { ...data[0], slug }
}

export const getRecipeBySlug = async (slug) => {
    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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
    const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

    if (error) {
        console.error('Erro ao deletar lista:', error);
        throw error;
    }
}

export const getShoppingListById = async (listId) => {
    const { data, error } = await supabase
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
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('credits_balance, subscription_tier')
        .eq('id', userId)
        .single();

    if (error) {
        // Se perfil não existe (primeiro login antes do trigger rodar?), tenta criar ou assume default
        console.warn('Profile not found, assuming defaults or error:', error);
        // Fallback or retry logic could go here. For MVP, we might error out or treat as free with 0 credits if table exists but empty.
        // Assuming profile trigger works, this shouldn't happen often.
        throw error;
    }

    const isAdmin = profile.subscription_tier === 'admin';
    const hasCredits = profile.credits_balance > 0;

    return {
        allowed: isAdmin || hasCredits,
        isAdmin,
        balance: profile.credits_balance
    };
};

export const deductCredit = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado');

    // 1. Re-check status/admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_balance, subscription_tier')
        .eq('id', userId)
        .single();

    if (profileError) throw profileError;

    if (profile.subscription_tier === 'admin') {
        console.log('Admin user: No credit deducted.');
        return; // God mode
    }

    if (profile.credits_balance <= 0) {
        throw new Error('Saldo insuficiente.');
    }

    // 2. Deduct Logic (Optimistic UI handled by caller usually, but here we do DB)
    // Update profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits_balance: profile.credits_balance - 1 })
        .eq('id', userId);

    if (updateError) throw updateError;

    // 3. Log Transaction
    const { error: logError } = await supabase
        .from('credit_transactions')
        .insert([{
            user_id: userId,
            amount: -1,
            description: 'Geração de Receita'
        }]);

    if (logError) {
        console.error('Error logging transaction:', logError);
        // We don't throw here to avoid breaking the user flow after successful deduction
    }
};
