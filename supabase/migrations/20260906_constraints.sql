-- Validacao no banco (vale para form, CSV, webhook e PostgREST direto).
-- Rode no Supabase SQL Editor (bancos existentes). Instalacoes novas ja
-- incluem via supabase/schema.sql. Confira dados existentes antes: linhas
-- fora dos limites abaixo fazem o ADD CONSTRAINT falhar.

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_nome_valido;
ALTER TABLE leads ADD CONSTRAINT leads_nome_valido
  CHECK (char_length(btrim(nome)) BETWEEN 2 AND 150);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_whatsapp_valido;
ALTER TABLE leads ADD CONSTRAINT leads_whatsapp_valido
  CHECK (char_length(btrim(whatsapp)) BETWEEN 8 AND 25);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_valor_valido;
ALTER TABLE leads ADD CONSTRAINT leads_valor_valido
  CHECK (valor_maximo IS NULL OR valor_maximo >= 0);

ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_texto_valido;
ALTER TABLE notes ADD CONSTRAINT notes_texto_valido
  CHECK (char_length(btrim(texto)) BETWEEN 1 AND 5000);
