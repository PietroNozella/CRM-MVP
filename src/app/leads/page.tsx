import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/leads-table'
import { LeadsFilters } from '@/components/leads-filters'
import { LEAD_STATUSES } from '@/lib/pipeline'

const VALID_STATUS = new Set(LEAD_STATUSES.map((s) => s.value))

function isDateISO(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))
}

// Escapa curingas e delimita o valor (gramatica PostgREST): evita que
// virgula/parenteses da busca alterem ou invalidem o filtro.
function likePattern(term: string) {
  const escaped = term.replace(/[\\%_]/g, '\\$&')
  return JSON.stringify(`%${escaped}%`)
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = searchParams
  const status = typeof params.status === 'string' ? params.status : undefined
  const q = typeof params.q === 'string' ? params.q : undefined
  const dataInicio =
    typeof params.data_inicio === 'string' ? params.data_inicio : undefined
  const dataFim =
    typeof params.data_fim === 'string' ? params.data_fim : undefined
  const retorno =
    typeof params.retorno === 'string' ? params.retorno : undefined

  const supabase = await createClient()
  let query = supabase
    .from('leads')
    .select(
      'id,nome,whatsapp,email,status,interesse,valor_maximo,source,proximo_retorno,nota_retorno,created_at'
    )
    .order('created_at', { ascending: false })

  if (status && VALID_STATUS.has(status as never)) {
    query = query.eq('status', status)
  }
  if (q && q.trim()) {
    const term = q.trim().slice(0, 100)
    const pattern = likePattern(term)
    query = query.or(`nome.ilike.${pattern},whatsapp.ilike.${pattern}`)
  }
  if (dataInicio && isDateISO(dataInicio)) {
    query = query.gte('created_at', `${dataInicio}T00:00:00.000Z`)
  }
  if (dataFim && isDateISO(dataFim)) {
    query = query.lte('created_at', `${dataFim}T23:59:59.999Z`)
  }
  if (retorno === 'agendados') {
    query = query.not('proximo_retorno', 'is', null)
  }
  if (retorno === 'atrasados') {
    const today = new Date().toISOString().slice(0, 10)
    query = query.lt('proximo_retorno', today)
  }

  const { data: leads, error } = await query

  if (error) throw error

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contatos</h1>
      <LeadsFilters
        key={`${params.q ?? ''}-${params.status ?? ''}-${params.data_inicio ?? ''}-${params.data_fim ?? ''}-${params.retorno ?? ''}`}
        initialQ={typeof params.q === 'string' ? params.q : ''}
        initialStatus={typeof params.status === 'string' ? params.status : 'todos'}
        initialDataInicio={typeof params.data_inicio === 'string' ? params.data_inicio : ''}
        initialDataFim={typeof params.data_fim === 'string' ? params.data_fim : ''}
        initialRetorno={typeof params.retorno === 'string' ? params.retorno : 'todos'}
      />
      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
