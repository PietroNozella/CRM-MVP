export type LeadStatus = 'novo' | 'em_atendimento' | 'visita' | 'fechado'

export interface Lead {
  id: string
  nome: string
  whatsapp: string
  email: string | null
  status: LeadStatus
  interesse: string | null
  valor_maximo: number | null
  created_at: string
}

export interface Imovel {
  id: string
  titulo: string
  preco: number
  bairro: string
  quartos: number
  banheiros: number
  vagas: number
  area: number
  fotos_url: string[]
  created_at: string
}
