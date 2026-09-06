import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/leads-table'
import { LeadsCards } from '@/components/leads-cards'
import { LeadsFilters } from '@/components/leads-filters'
import { LEAD_STATUSES } from '@/lib/pipeline'
import { todayISO, dayStartUTC, nextDayStartUTC } from '@/lib/dates'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { Plus } from 'lucide-react'

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
  const requestedPage = Number(params.page)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const pageSize = 50
  function pageHref(value: number) {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && key !== 'page') next.set(key, value)
    }
    next.set('page', String(value))
    return `/leads?${next}`
  }

  const supabase = await createClient()
  let query = supabase
    .from('leads')
    .select(
      'id,nome,whatsapp,email,status,interesse,valor_maximo,source,proximo_retorno,nota_retorno,created_at',
      { count: 'exact' }
    )

  if (status && VALID_STATUS.has(status as never)) {
    query = query.eq('status', status)
  }
  if (q && q.trim()) {
    const term = q.trim().slice(0, 100)
    const pattern = likePattern(term)
    query = query.or(`nome.ilike.${pattern},whatsapp.ilike.${pattern}`)
  }
  if (dataInicio && isDateISO(dataInicio)) {
    query = query.gte('created_at', dayStartUTC(dataInicio))
  }
  if (dataFim && isDateISO(dataFim)) {
    query = query.lt('created_at', nextDayStartUTC(dataFim))
  }
  if (retorno === 'agendados') {
    query = query.not('proximo_retorno', 'is', null)
  }
  if (retorno === 'hoje') {
    query = query.eq('proximo_retorno', todayISO())
  }
  if (retorno === 'atrasados') {
    query = query.lt('proximo_retorno', todayISO())
  }
  if (retorno === 'sem_retorno') query = query.is('proximo_retorno', null)
  if (retorno === 'hoje' || retorno === 'atrasados') {
    query = query.neq('status', 'fechado')
  }
  if (['hoje', 'atrasados', 'agendados'].includes(retorno ?? '')) {
    query = query.order('proximo_retorno', { ascending: true }).order('created_at')
  } else {
    query = query.order('created_at', { ascending: retorno === 'sem_retorno' })
  }
  query = query.order('id').range((page - 1) * pageSize, page * pageSize - 1)

  const { data: leads, error, count } = await query

  if (error) throw error
  const total = count ?? 0
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (page > pages) redirect(pageHref(pages))

  return (
    <div>
      <PageHeader
        title="Contatos"
        description="Todo mundo que já procurou você — e o próximo passo de cada um."
        actions={<Button asChild><Link href="/leads/novo"><Plus aria-hidden="true" />Novo contato</Link></Button>}
      />
      <LeadsFilters
        key={`${params.q ?? ''}-${params.status ?? ''}-${params.data_inicio ?? ''}-${params.data_fim ?? ''}-${params.retorno ?? ''}`}
        initialQ={typeof params.q === 'string' ? params.q : ''}
        initialStatus={typeof params.status === 'string' ? params.status : 'todos'}
        initialDataInicio={typeof params.data_inicio === 'string' ? params.data_inicio : ''}
        initialDataFim={typeof params.data_fim === 'string' ? params.data_fim : ''}
        initialRetorno={typeof params.retorno === 'string' ? params.retorno : 'todos'}
      />
      <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground" role="status">{total === 0 ? 'Nenhum resultado' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} contatos`}</p>
      <div className="hidden overflow-hidden rounded-lg border bg-card xl:block">
        <LeadsTable leads={leads ?? []} />
      </div>
      <LeadsCards leads={leads ?? []} />
      {pages > 1 && <nav aria-label="Páginas de contatos" className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        {page > 1 ? <Button asChild variant="outline"><Link href={pageHref(page - 1)}>Anterior</Link></Button> : <Button disabled variant="outline">Anterior</Button>}
        <span className="font-mono text-xs text-muted-foreground">Página {page} de {pages}</span>
        {page < pages ? <Button asChild variant="outline"><Link href={pageHref(page + 1)}>Próxima</Link></Button> : <Button disabled variant="outline">Próxima</Button>}
      </nav>}
    </div>
  )
}
