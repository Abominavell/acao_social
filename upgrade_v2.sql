-- ============================================
-- UPGRADE V2 — Monitoramento de Voluntários
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar campo WhatsApp na tabela colaboradores
ALTER TABLE colaboradores
ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT NULL;

-- 2. Renomear setor "Supervisão Administrativa" → "Administração"
UPDATE setores
SET nome = 'Administração'
WHERE nome = 'Supervisão Administrativa';

-- 3. Recarregar schema do PostgREST
NOTIFY pgrst, 'reload schema';
