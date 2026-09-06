import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/leads-table'
import { LeadsFilters } from '@/components/leads-filters'

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
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (q && q.trim()) {
    query = query.or(`nome.ilike.%${q.trim()}%,whatsapp.ilike.%${q.trim()}%`)
  }
  if (dataInicio) {
    query = query.gte('created_at', `${dataInicio}T00:00:00.000Z`)
  }
  if (dataFim) {
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
