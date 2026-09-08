-- Instalacao do zero: rode este arquivo inteiro no SQL Editor do Supabase
-- do cliente (projeto novo). Bancos existentes: rode apenas os arquivos
-- em supabase/migrations/ na ordem de data.
--
-- Modelo: 1 banco por cliente (single-tenant). Sem multi-tenant.

-- Tabela leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL CHECK (char_length(btrim(nome)) BETWEEN 2 AND 150),
  whatsapp TEXT NOT NULL CHECK (char_length(btrim(whatsapp)) BETWEEN 8 AND 25),
  email TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'em_negociacao', 'fechado')),
  interesse TEXT,
  valor_maximo NUMERIC CHECK (valor_maximo IS NULL OR valor_maximo >= 0),
  source TEXT,
  proximo_retorno DATE,
  nota_retorno TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: instalacao single-tenant (1 empresa por banco). Apenas usuarios
-- logados (Supabase Auth, cadastro criado pelo admin) acessam. Anonimo
-- nao le nem grava. Webhook usa service_role (contorna RLS).
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access for leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anotacoes por contato
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  texto TEXT NOT NULL CHECK (char_length(btrim(texto)) BETWEEN 1 AND 5000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access for notes" ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anonimo sem acesso (service_role nao e afetado, webhook continua ok).
REVOKE ALL ON leads, notes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;

CREATE INDEX IF NOT EXISTS leads_proximo_retorno_idx ON leads (proximo_retorno);
CREATE INDEX IF NOT EXISTS leads_created_id_idx ON leads (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS notes_lead_created_idx ON notes (lead_id, created_at DESC);
