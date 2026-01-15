-- Adiciona coluna slug à tabela recipes
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON public.recipes(slug);

-- Comentário: O slug será gerado no frontend ao salvar e deve ser único.
-- Formato esperado: "nome-da-receita-abc12" (título slugificado + sufixo único)
 