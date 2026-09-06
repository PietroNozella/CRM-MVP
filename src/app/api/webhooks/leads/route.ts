import { createAdminClient } from '@/lib/supabase/admin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function isAuthorized(request: Request) {
  const secret = process.env.LEADS_WEBHOOK_SECRET
  // Sem segredo configurado: permite (dev local). Em produção, configure.
  if (!secret) return true

  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true

  const fallback = request.headers.get('x-webhook-secret')
  return fallback === secret
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const body = await request.json()
    const { name, email, phone, source } = body

    if (!name?.trim() || !phone?.trim()) {
      return new Response(
        JSON.stringify({ error: 'name e phone são obrigatórios' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    const supabase = createAdminClient()
    const insertData: Record<string, unknown> = {
      nome: name.trim(),
      whatsapp: phone.trim(),
      email: email?.trim() || null,
      status: 'novo',
      interesse: null,
      valor_maximo: null,
    }
    const sourceVal = source?.trim()
    if (sourceVal) insertData.source = sourceVal

    const { error } = await supabase.from('leads').insert(insertData)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
