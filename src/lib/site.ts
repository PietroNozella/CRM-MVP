// Config por cliente: ajuste aqui ou via .env, sem espalhar codigo.
// NEXT_PUBLIC_APP_NAME: nome exibido no menu e no titulo do site.
// NEXT_PUBLIC_WHATSAPP_TEMPLATE: mensagem do botao Chamar, use {nome}.

export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'CRM'

export function whatsappMessage(nome: string) {
  const template = process.env.NEXT_PUBLIC_WHATSAPP_TEMPLATE
  if (template) return template.replace('{nome}', nome)
  return `Olá ${nome}, obrigado pelo contato! Como posso ajudar?`
}
