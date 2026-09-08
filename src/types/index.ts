export type LeadStatus = 'novo' | 'em_atendimento' | 'em_negociacao' | 'fechado'

export interface Lead {
  id: string
  nome: string
  whatsapp: string
  email: string | null
  status: LeadStatus
  interesse: string | null
  valor_maximo: number | null
  source: string | null
  proximo_retorno: string | null
  nota_retorno: string | null
  created_at: string
}

export interface Note {
  id: string
  lead_id: string
  texto: string
  created_at: string
}
