-- Isolamento multiusuario para uma instalacao existente.
--
-- Se houver contatos sem proprietario, a migracao exige exatamente um usuario
-- em auth.users e atribui os dados existentes a ele. Caso ja existam varios
-- usuarios, a transacao e interrompida para evitar atribuir dados por engano.

BEGIN;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS owner_id UUID;

DO $$
DECLARE
  auth_user_count INTEGER;
  legacy_owner_id UUID;
  unowned_lead_count BIGINT;
BEGIN
  SELECT COUNT(*)
    INTO auth_user_count
    FROM auth.users;

  IF auth_user_count = 1 THEN
    SELECT id
      INTO legacy_owner_id
      FROM auth.users
      LIMIT 1;
  END IF;

  SELECT COUNT(*)
    INTO unowned_lead_count
    FROM public.leads
    WHERE owner_id IS NULL;

  IF unowned_lead_count > 0 AND auth_user_count <> 1 THEN
    RAISE EXCEPTION
      'Migracao interrompida: existem % contatos sem proprietario e % usuarios. Defina o owner_id explicitamente antes de continuar.',
      unowned_lead_count,
      auth_user_count;
  END IF;

  IF unowned_lead_count > 0 THEN
    UPDATE public.leads
      SET owner_id = legacy_owner_id
      WHERE owner_id IS NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
      WHERE conname = 'leads_owner_id_fkey'
        AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE RESTRICT;
  END IF;
END
$$;

ALTER TABLE public.leads
  ALTER COLUMN owner_id SET DEFAULT auth.uid(),
  ALTER COLUMN owner_id SET NOT NULL;

DROP POLICY IF EXISTS "Allow all for leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated full access for leads" ON public.leads;
DROP POLICY IF EXISTS "Users can read own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

CREATE POLICY "Users can read own leads"
  ON public.leads FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can create own leads"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Allow all for notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated full access for notes" ON public.notes;
DROP POLICY IF EXISTS "Users can read notes from own leads" ON public.notes;
DROP POLICY IF EXISTS "Users can create notes on own leads" ON public.notes;
DROP POLICY IF EXISTS "Users can update notes from own leads" ON public.notes;
DROP POLICY IF EXISTS "Users can delete notes from own leads" ON public.notes;

CREATE POLICY "Users can read notes from own leads"
  ON public.notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create notes on own leads"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update notes from own leads"
  ON public.notes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete notes from own leads"
  ON public.notes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = notes.lead_id
        AND leads.owner_id = (SELECT auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS public.lead_webhook_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'default' CHECK (char_length(btrim(label)) BETWEEN 1 AND 80),
  token_hash TEXT NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, label)
);

ALTER TABLE public.lead_webhook_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.leads, public.notes, public.lead_webhook_tokens FROM anon;
REVOKE ALL ON public.lead_webhook_tokens FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_webhook_tokens TO service_role;

CREATE INDEX IF NOT EXISTS leads_owner_created_id_idx
  ON public.leads (owner_id, created_at DESC, id DESC);

COMMIT;
