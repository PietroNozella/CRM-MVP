-- Generaliza funil: visita -> em_negociacao (CRM geral, nao imobiliario)
-- Rode no Supabase SQL Editor ou via supabase db push.
-- Idempotente: pode rodar em banco novo ou ja migrado.

BEGIN;

-- DROP antes do UPDATE: a constraint antiga rejeita 'em_negociacao'.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

UPDATE leads SET status = 'em_negociacao' WHERE status = 'visita';

ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('novo', 'em_atendimento', 'em_negociacao', 'fechado'));

COMMIT;

