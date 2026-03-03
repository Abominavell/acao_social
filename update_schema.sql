-- Correção para o erro: "Could not find the 'vagas_por_setor' column"
-- Execute este comando no SQL Editor do seu painel do Supabase

ALTER TABLE acoes_sociais 
ADD COLUMN IF NOT EXISTS vagas_por_setor JSONB DEFAULT NULL;

-- Atualizar o cache de schema da API do Supabase
NOTIFY pgrst, 'reload schema';
