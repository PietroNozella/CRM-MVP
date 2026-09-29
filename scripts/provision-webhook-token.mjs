import { createHash, randomBytes } from 'node:crypto'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

try {
  process.loadEnvFile('.env.local')
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

function argument(name) {
  const position = process.argv.indexOf(`--${name}`)
  if (position >= 0) return process.argv[position + 1]

  const prefix = `--${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length)
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function fail(message) {
  throw new Error(message)
}

async function findUserByEmail(supabase, email) {
  const normalizedEmail = email.trim().toLowerCase()
  const matches = []

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    })
    if (error) throw error

    matches.push(
      ...data.users.filter(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail,
      ),
    )
    if (data.users.length < 1000) break
  }

  if (matches.length !== 1) {
    fail(`Esperado 1 usuário com o e-mail informado; encontrados: ${matches.length}.`)
  }
  return matches[0]
}

async function resolveUser(supabase) {
  const userId = argument('user-id')
  const email = argument('email')

  if (Boolean(userId) === Boolean(email)) {
    fail('Informe somente --user-id <uuid> ou --email <endereço>.')
  }

  if (userId) {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error) throw error
    if (!data.user) fail('Usuário não encontrado.')
    return data.user
  }

  return findUserByEmail(supabase, email)
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    fail('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  }

  const label = (argument('label') ?? 'default').trim()
  if (!label || label.length > 80) {
    fail('O label deve ter entre 1 e 80 caracteres.')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const user = await resolveUser(supabase)

  if (hasFlag('revoke')) {
    const { data, error } = await supabase
      .from('lead_webhook_tokens')
      .update({ active: false })
      .eq('owner_id', user.id)
      .eq('label', label)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) fail('Token ativo não encontrado para o usuário e label informados.')

    console.log(`Token revogado para ${user.email ?? user.id} (${label}).`)
    return
  }

  const reuseLegacySecret = hasFlag('reuse-legacy-secret')
  const token = reuseLegacySecret
    ? process.env.LEADS_WEBHOOK_SECRET
    : randomBytes(32).toString('hex')

  if (!token || token.length < 32 || token.length > 512) {
    fail('O segredo legado deve ter entre 32 e 512 caracteres.')
  }

  const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex')

  const { error } = await supabase.from('lead_webhook_tokens').upsert(
    {
      owner_id: user.id,
      label,
      token_hash: tokenHash,
      active: true,
    },
    { onConflict: 'owner_id,label' },
  )
  if (error) throw error

  console.log(`Usuário: ${user.email ?? user.id}`)
  console.log(`Identificador: ${label}`)
  console.log(`Token: ${token}`)
  console.log('Guarde o token agora: somente o hash foi salvo no banco.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Falha ao provisionar token.')
  process.exitCode = 1
})
