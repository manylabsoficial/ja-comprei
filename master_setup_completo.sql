-- ========================================================
-- 1. CRIAÇÃO DO SCHEMA E TABELAS DO JÁ COMPREI
-- ========================================================
CREATE SCHEMA IF NOT EXISTS jacomprei;

-- Tabela de Perfis do Já Comprei (Gerenciamento de Créditos Local)
CREATE TABLE IF NOT EXISTS jacomprei.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_balance INTEGER DEFAULT 10,
    subscription_tier TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Receitas
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

-- Tabela de Metadados de Receitas (LangGraph)
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

-- Tabela de Listas de Compras
CREATE TABLE IF NOT EXISTS jacomprei.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Transações de Créditos
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


-- ========================================================
-- 2. CADASTRO E INTEGRAÇÃO DO APP NA MANYLABS
-- ========================================================
INSERT INTO manylabs.apps (slug, name, status, integrated, metadata)
VALUES (
    'jacomprei', 
    'Já Comprei', 
    'active', 
    true, 
    '{"description": "Aplicativo de organização de listas de compra e inteligência em receitas"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET integrated = true, status = 'active';


-- ========================================================
-- 3. WRAPPERS RPC DE SEGURANÇA (No schema public)
-- ========================================================

-- Wrapper: Ensure App Access (Usado apenas pela Service Role / Backend)
CREATE OR REPLACE FUNCTION public.ensure_manylabs_app_access(
  p_user_id uuid,
  p_email text,
  p_display_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, manylabs, pg_temp
AS $$
DECLARE
  v_status text;
BEGIN
  -- 1. Garante o Perfil Local do Já Comprei com créditos iniciais (10)
  INSERT INTO jacomprei.profiles (id, credits_balance, subscription_tier)
  VALUES (p_user_id, 10, 'user')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Checa se já possui acesso cadastrado no Manylabs
  SELECT aa.status INTO v_status
  FROM manylabs.app_access aa
  WHERE aa.user_id = p_user_id AND aa.app_slug = 'jacomprei';

  IF FOUND THEN
    RETURN v_status IN ('active', 'trial');
  END IF;

  -- 3. Se não existir, autoativa na base unificada
  INSERT INTO manylabs.profiles (user_id, email_normalized, display_name, source, metadata)
  VALUES (p_user_id, lower(nullif(p_email, '')), nullif(p_display_name, ''), 'signup', jsonb_build_object('source_detail', 'jacomprei_auto_activation'))
  ON CONFLICT (user_id) DO UPDATE SET
    email_normalized = coalesce(excluded.email_normalized, manylabs.profiles.email_normalized),
    display_name = coalesce(excluded.display_name, manylabs.profiles.display_name),
    updated_at = now();

  INSERT INTO manylabs.app_access (user_id, app_slug, status, source, activated_at, metadata)
  VALUES (p_user_id, 'jacomprei', 'active', 'signup', now(), jsonb_build_object('trigger', 'login', 'source_detail', 'jacomprei_auto_activation'));

  INSERT INTO manylabs.app_roles (user_id, app_slug, role, source, metadata)
  VALUES (p_user_id, 'jacomprei', 'user', 'signup', jsonb_build_object('source_detail', 'jacomprei_auto_activation'))
  ON CONFLICT DO NOTHING;

  INSERT INTO manylabs.audit_events (actor_user_id, target_user_id, app_slug, action, source, metadata)
  VALUES (p_user_id, p_user_id, 'jacomprei', 'app_access.auto_activated', 'jacomprei', jsonb_build_object('source_detail', 'jacomprei_login'));

  RETURN true;
END;
$$;

-- Wrapper: Has App Access (Service Role apenas, aceita p_user_id arbitrário)
CREATE OR REPLACE FUNCTION public.has_manylabs_app_access(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, manylabs, pg_temp
AS $$
  SELECT manylabs.has_app_access(p_user_id, 'jacomprei');
$$;

-- Wrapper: Current User Has App Access (Seguro, pode ser usado por authenticated/RLS)
CREATE OR REPLACE FUNCTION public.current_user_has_manylabs_app_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, manylabs, pg_temp
AS $$
  SELECT manylabs.has_app_access(auth.uid(), 'jacomprei');
$$;

-- Permissões das funções
REVOKE ALL ON FUNCTION public.ensure_manylabs_app_access(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_manylabs_app_access(uuid, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.has_manylabs_app_access(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.has_manylabs_app_access(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.current_user_has_manylabs_app_access() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_has_manylabs_app_access() TO authenticated;


-- ========================================================
-- 4. POLÍCIAS DE SEGURANÇA RLS NO SCHEMA JACOMPREI
-- ========================================================

-- RLS para jacomprei.profiles
CREATE POLICY "Users can view own profile" ON jacomprei.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can update own profile" ON jacomprei.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id AND public.current_user_has_manylabs_app_access());

-- RLS para jacomprei.recipes
CREATE POLICY "Users can view own recipes" ON jacomprei.recipes
    FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can insert own recipes" ON jacomprei.recipes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can update own recipes" ON jacomprei.recipes
    FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can delete own recipes" ON jacomprei.recipes
    FOR DELETE TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

-- RLS para jacomprei.user_recipe_metadata
CREATE POLICY "Users can view own metadata" ON jacomprei.user_recipe_metadata
    FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can insert own metadata" ON jacomprei.user_recipe_metadata
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can update own metadata" ON jacomprei.user_recipe_metadata
    FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

-- RLS para jacomprei.shopping_lists
CREATE POLICY "Users can view own lists" ON jacomprei.shopping_lists
    FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can insert own lists" ON jacomprei.shopping_lists
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can update own lists" ON jacomprei.shopping_lists
    FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can delete own lists" ON jacomprei.shopping_lists
    FOR DELETE TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

-- RLS para jacomprei.credit_transactions
CREATE POLICY "Users can view own transactions" ON jacomprei.credit_transactions
    FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());

CREATE POLICY "Users can insert own transactions" ON jacomprei.credit_transactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.current_user_has_manylabs_app_access());
