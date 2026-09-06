import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Secret',
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

// Mesmo piso do banco (CHECKs): nome 2-150, whatsapp 8-25.
const captureSchema = z.object({
  name: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(8).max(25),
  email: z.string().trim().email().max(254).nullish(),
  source: z.string().trim().max(500).nullish(),
})

function checkAuth(request: Request): Response | null {
  const secret = process.env.LEADS_WEBHOOK_SECRET
  // Sem segredo a captura fica indisponivel (fail-closed, inclusive local).
  // Dev local: defina qualquer valor no .env.local.
  if (!secret) return jsonError('Captura indisponível', 503)

  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return null

  const fallback = request.headers.get('x-webhook-secret')
  if (fallback === secret) return null

  return jsonError('Unauthorized', 401)
}

export async function POST(request: Request) {
  const authError = checkAuth(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON', 400)
  }

  const parsed = captureSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Dados inválidos', 400)
  }
  const { name, email, phone, source } = parsed.data

  try {
    const supabase = createAdminClient()
    const insertData: Record<string, unknown> = {
      nome: name,
      whatsapp: phone,
      email: email || null,
      status: 'novo',
      interesse: null,
      valor_maximo: null,
    }
    if (source) insertData.source = source

    const { error } = await supabase.from('leads').insert(insertData)

    if (error) {
      console.error('webhook leads insert failed')
      return jsonError('Falha ao salvar contato', 500)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch {
    console.error('webhook leads unexpected error')
    return jsonError('Falha ao salvar contato', 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
