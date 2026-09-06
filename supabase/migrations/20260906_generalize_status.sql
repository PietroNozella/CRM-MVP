-- Generaliza funil: visita -> em_negociacao (CRM geral, nao imobiliario)
-- Rode no Supabase SQL Editor ou via supabase db push.

UPDATE leads SET status = 'em_negociacao' WHERE status = 'visita';

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('novo', 'em_atendimento', 'em_negociacao', 'fechado'));

