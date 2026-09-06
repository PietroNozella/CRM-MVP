-- Follow-up: proximo retorno + nota (o dono abre todo dia para ver quem chamar)
-- Rode no Supabase SQL Editor (bancos existentes). Instalacoes novas ja
-- incluem estas colunas via supabase/schema.sql.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS proximo_retorno DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nota_retorno TEXT;

CREATE INDEX IF NOT EXISTS leads_proximo_retorno_idx ON leads (proximo_retorno);
