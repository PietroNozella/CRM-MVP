-- Instalacao do zero: rode este arquivo inteiro no SQL Editor do Supabase
-- do cliente (projeto novo). Bancos existentes: rode apenas os arquivos
-- em supabase/migrations/ na ordem de data.
--
-- Modelo: 1 instalacao compartilhada por varios usuarios. Cada usuario acessa
-- apenas os proprios dados por meio de Row Level Security (RLS).

-- Tabela leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
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

-- RLS: cada usuario acessa apenas os proprios contatos. O webhook usa
-- service_role e, por isso, sempre informa owner_id explicitamente.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own leads"
  ON leads FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can create own leads"
  ON leads FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

-- Anotacoes por contato
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  texto TEXT NOT NULL CHECK (char_length(btrim(texto)) BETWEEN 1 AND 5000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read notes from own leads"
  ON notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create notes on own leads"
  ON notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update notes from own leads"
  ON notes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete notes from own leads"
  ON notes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

-- Credenciais do webhook. Apenas service_role acessa esta tabela. O token
-- original nao e armazenado; somente o hash SHA-256.
CREATE TABLE lead_webhook_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'default' CHECK (char_length(btrim(label)) BETWEEN 1 AND 80),
  token_hash TEXT NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, label)
);

ALTER TABLE lead_webhook_tokens ENABLE ROW LEVEL SECURITY;

-- Anonimo sem acesso (service_role nao e afetado, webhook continua ok).
REVOKE ALL ON leads, notes, lead_webhook_tokens FROM anon;
REVOKE ALL ON lead_webhook_tokens FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lead_webhook_tokens TO service_role;

CREATE INDEX IF NOT EXISTS leads_proximo_retorno_idx ON leads (proximo_retorno);
CREATE INDEX IF NOT EXISTS leads_created_id_idx ON leads (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS leads_owner_created_id_idx ON leads (owner_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS notes_lead_created_idx ON notes (lead_id, created_at DESC);
