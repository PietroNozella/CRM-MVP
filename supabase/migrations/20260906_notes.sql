-- Anotacoes por contato (historico: cada atendente ve o que ja foi tratado)
-- Rode no Supabase SQL Editor (bancos existentes). Instalacoes novas ja
-- incluem via supabase/schema.sql.

CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_lead_id_idx ON notes (lead_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for notes" ON notes;
CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true) WITH CHECK (true);
