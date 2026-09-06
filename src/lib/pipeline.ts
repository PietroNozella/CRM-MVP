import type { LeadStatus } from '@/types'

// Funil padrao. Para trocar as etapas de um cliente:
// 1. atualize o tipo LeadStatus em src/types/index.ts;
// 2. edite a lista abaixo (e o schema zod em src/components/lead-form.tsx);
// 3. rode no SQL Editor do Supabase do cliente:
//    ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
//    ALTER TABLE leads ADD CONSTRAINT leads_status_check
//      CHECK (status IN ('etapa1', 'etapa2', ...));

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_atendimento', label: 'Em Atendimento' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'fechado', label: 'Fechado' },
]
