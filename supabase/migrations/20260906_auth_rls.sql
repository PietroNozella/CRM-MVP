-- Auth: fecha acesso anonimo, libera apenas usuarios logados.
-- Rode no Supabase SQL Editor DEPOIS do deploy do codigo com /login.
-- Pre-requisito no dashboard: Authentication -> Add user (criar login do
-- cliente) e desativar "Allow new users to sign up".
-- Webhook continua funcionando (usa service_role, contorna RLS).

-- leads
DROP POLICY IF EXISTS "Allow all for leads" ON leads;
CREATE POLICY "Authenticated full access for leads"
  ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- notes
DROP POLICY IF EXISTS "Allow all for notes" ON notes;
CREATE POLICY "Authenticated full access for notes"
  ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- imoveis (legado)
DROP POLICY IF EXISTS "Allow all for imoveis" ON imoveis;
CREATE POLICY "Authenticated full access for imoveis"
  ON imoveis FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anonimo perde tudo (service_role nao e afetado).
REVOKE ALL ON leads, notes, imoveis FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON imoveis TO authenticated;
