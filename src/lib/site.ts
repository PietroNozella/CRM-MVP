// Config por cliente: ajuste aqui ou via .env, sem espalhar codigo.
// NEXT_PUBLIC_APP_NAME: nome exibido no menu e no titulo do site.
// NEXT_PUBLIC_WHATSAPP_TEMPLATE: mensagem do botao Chamar, use {nome}.

export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'CRM'

export function whatsappMessage(nome: string) {
  const template = process.env.NEXT_PUBLIC_WHATSAPP_TEMPLATE
  if (template) return template.replace('{nome}', nome)
  return `Olá ${nome}, obrigado pelo contato! Como posso ajudar?`
}

// Normaliza para wa.me: 10-11 digitos ganham DDI 55; com DDI mantem.
// Compara por comprimento (nao por prefixo) para nao confundir DDD 55.
export function normalizeBrazilPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`
  if (/^55\d{10,11}$/.test(digits)) return digits
  return null
}

export function formatPhoneBR(value: string) {
  const digits = value.replace(/\D/g, '')
  const local = /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  }
  return value
}

export function whatsappLink(phone: string, message?: string) {
  const numero = normalizeBrazilPhone(phone)
  if (!numero) return null
  const base = `https://wa.me/${numero}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
