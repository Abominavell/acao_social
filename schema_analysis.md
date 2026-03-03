# Análise de Conexões Frontend ↔ Supabase

Esta análise detalha todas as tabelas e colunas que o sistema (Frontend) espera encontrar no seu banco de dados Supabase. Como a conexão é feita via `supabase-js` (REST API), qualquer divergência de schema causará erros (como o código HTTP 400).

## 1. Tabela `acoes_sociais`
**Status:** ⚠️ Requer Atualização no Supabase

O frontend lê e salva os seguintes campos:
- `id` (uuid, primary key)
- `titulo` (text)
- `descricao` (text, nullable)
- `data_evento` (timestamp / timestamptz)
- `vagas_limite` (integer)
- `ativo` (boolean, default true)
- `created_at` (timestamptz)
- 🚨 **`vagas_por_setor`** (jsonb, nullable) -> **Falta no banco!**

**Onde é usada:** `admin/page.tsx`, `inscricao/page.tsx`, `dashboard/page.tsx`

## 2. Tabela `setores`
**Status:** ✅ Sincronizada

O frontend lê e salva os seguintes campos:
- `id` (uuid, primary key)
- `nome` (text)
- `created_at` (timestamptz)

*Nota: O frontend agora consegue criar o setor "EXTERNOS" automaticamente.*

**Onde é usada:** `admin/page.tsx`, `inscricao/page.tsx`, `dashboard/page.tsx`

## 3. Tabela `colaboradores`
**Status:** ✅ Sincronizada

O frontend lê e salva os seguintes campos:
- `id` (uuid, primary key)
- `setor_id` (uuid, foreign key para `setores.id`)
- `nome` (text)
- `is_externo` (boolean, default false)
- `created_at` (timestamptz)

*Requisito forte:* O Join (`colaboradores!inner(is_externo)`) no Dashboard exige que a chave estrangeira de `setor_id` e a relação com `inscricoes` estejam perfeitamente alinhadas no painel do Supabase.

**Onde é usada:** `inscricao/page.tsx`, `dashboard/page.tsx` (via join)

## 4. Tabela `inscricoes`
**Status:** ✅ Sincronizada

O frontend lê e salva os seguintes campos:
- `id` (uuid, primary key)
- `acao_id` (uuid, foreign key para `acoes_sociais.id`)
- `colaborador_id` (uuid, foreign key para `colaboradores.id`)
- `confirmado_presenca` (boolean, default false)
- `created_at` (timestamptz)

*Comportamento esperado:* Quando uma ação social é deletada (`handleDeleteAcao`), as inscrições também são removidas. Idealmente, a chave estrangeira `acao_id` no Supabase deve ter `ON DELETE CASCADE` configurado para consistência.

**Onde é usada:** `admin/page.tsx`, `dashboard/page.tsx`

---

## Como Rodar o Patch do Banco via SQL Editor

Como não temos a chave secreta de administrador do banco (`service_role` ou URL PostgreSQL) no código fonte, os comandos **DDL (Alter Table)** não podem ser executados automaticamente pelo sistema via API REST.

Você deve entrar no [Painel do Supabase](https://supabase.com/dashboard) > **SQL Editor** e rodar:

```sql
ALTER TABLE acoes_sociais 
ADD COLUMN IF NOT EXISTS vagas_por_setor JSONB DEFAULT NULL;

NOTIFY pgrst, 'reload schema';
```
