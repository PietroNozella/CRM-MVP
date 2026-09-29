import { createHash } from 'node:crypto'
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

function readToken(request: Request): string | null {
  const auth = request.headers.get('authorization')
  const bearer = auth?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
  const token = bearer || request.headers.get('x-webhook-secret')?.trim()

  if (!token || token.length < 32 || token.length > 512) return null
  return token
}

function tokenHash(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

async function findOwnerId(
  supabase: ReturnType<typeof createAdminClient>,
  token: string,
) {
  const { data, error } = await supabase
    .from('lead_webhook_tokens')
    .select('owner_id')
    .eq('token_hash', tokenHash(token))
    .eq('active', true)
    .maybeSingle()

  if (error) throw error
  return data?.owner_id ?? null
}

export async function POST(request: Request) {
  const token = readToken(request)
  if (!token) return jsonError('Unauthorized', 401)

  let supabase: ReturnType<typeof createAdminClient>
  let ownerId: string | null
  try {
    supabase = createAdminClient()
    ownerId = await findOwnerId(supabase, token)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('webhook credential lookup failed', { code: error.code })
    } else {
      console.error('webhook credential lookup failed')
    }
    return jsonError('Captura indisponível', 503)
  }
  if (!ownerId) return jsonError('Unauthorized', 401)

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
    const insertData: Record<string, unknown> = {
      owner_id: ownerId,
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
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('webhook leads unexpected error', { code: error.code })
    } else {
      console.error('webhook leads unexpected error')
    }
    return jsonError('Falha ao salvar contato', 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
