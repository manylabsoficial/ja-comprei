-- 1. Criar o Schema do App
CREATE SCHEMA IF NOT EXISTS jacomprei;

-- 2. Tabela de Perfis do Já Comprei (Gereciamento de Créditos Local)
CREATE TABLE IF NOT EXISTS jacomprei.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_balance INTEGER DEFAULT 10,
    subscription_tier TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Receitas
CREATE TABLE IF NOT EXISTS jacomprei.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    ingredients JSONB DEFAULT '[]'::jsonb,
    instructions JSONB DEFAULT '[]'::jsonb,
    visual_tag TEXT,
    image_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_recipe_slug UNIQUE (slug)
);

-- 4. Tabela de Metadados de Receitas (LangGraph)
CREATE TABLE IF NOT EXISTS jacomprei.user_recipe_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES jacomprei.recipes(id) ON DELETE CASCADE,
    
    -- Metadados Técnicos
    proteina_principal TEXT,
    metodo_cocao JSONB DEFAULT '[]'::jsonb,
    perfil_sabor JSONB DEFAULT '[]'::jsonb,
    nivel_dificuldade TEXT,
    tempo_estimado_minutos INTEGER,
    tipo_refeicao TEXT,
    utensilios_especiais JSONB DEFAULT '[]'::jsonb,
    ingredientes_chave JSONB DEFAULT '[]'::jsonb,
    
    -- Metadados Populacionais/Contextuais
    restricoes_detectadas JSONB DEFAULT '[]'::jsonb,
    custo_estimado TEXT,
    ocasiao TEXT,
    num_ingredientes INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_recipe_metadata UNIQUE (user_id, recipe_id)
);

-- 5. Tabela de Listas de Compras
CREATE TABLE IF NOT EXISTS jacomprei.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Transações de Créditos
CREATE TABLE IF NOT EXISTS jacomprei.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON jacomprei.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON jacomprei.recipes(slug);
CREATE INDEX IF NOT EXISTS idx_metadata_user_recipe ON jacomprei.user_recipe_metadata(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON jacomprei.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON jacomprei.credit_transactions(user_id);

-- Habilitar RLS nas tabelas do Schema jacomprei
ALTER TABLE jacomprei.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jacomprei.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jacomprei.user_recipe_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE jacomprei.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE jacomprei.credit_transactions ENABLE ROW LEVEL SECURITY;
