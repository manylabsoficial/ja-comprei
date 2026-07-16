-- Query para o Supabase SQL Editor
-- Cria a tabela de metadados para memória evolutiva

CREATE TABLE IF NOT EXISTS public.user_recipe_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir um registro por receita por usuário (opcional, dependendo da lógica de retry)
    CONSTRAINT unique_user_recipe_metadata UNIQUE (user_id, recipe_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metadata_user_id ON public.user_recipe_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_metadata_recipe_id ON public.user_recipe_metadata(recipe_id);

-- Habilitar RLS
ALTER TABLE public.user_recipe_metadata ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own metadata' AND tablename = 'user_recipe_metadata') THEN
        CREATE POLICY "Users can view own metadata" ON public.user_recipe_metadata
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own metadata' AND tablename = 'user_recipe_metadata') THEN
        CREATE POLICY "Users can insert own metadata" ON public.user_recipe_metadata
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
