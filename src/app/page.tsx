import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FunnelCard, OriginsCard } from '@/components/dashboard-metrics'
import { AgendaTimeline } from '@/components/agenda-timeline'
import { ReturnCalendar } from '@/components/return-calendar'
import { todayISO } from '@/lib/dates'
import { PageHeader } from '@/components/page-header'

const CALL_COLS =
  'id,nome,whatsapp,status,proximo_retorno,nota_retorno'

function parseMonth(param: string | undefined) {
  const m = /^\d{4}-\d{2}$/.exec(param ?? '')
  if (m) {
    const [y, mo] = param!.split('-').map(Number)
    if (mo >= 1 && mo <= 12) return { y, m: mo }
  }
  const now = new Date()
  return { y: now.getFullYear(), m: now.getMonth() + 1 }
}

function monthRange(y: number, m: number) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = `${y}-${pad(m)}-01`
  const nm = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }
  return { start, end: `${nm.y}-${pad(nm.m)}-01` }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { y: calY, m: calM } = parseMonth(
    typeof searchParams.mes === 'string' ? searchParams.mes : undefined
  )
  const { start: monthStart, end: monthEnd } = monthRange(calY, calM)

  const supabase = await createClient()
  const { data: leads, error } = await supabase
    .from('leads')
    .select('status,source')

  if (error) throw error

  const total = leads?.length ?? 0

  const today = todayISO()
  const [overdueRes, todayRes, freshRes, monthRes] = await Promise.all([
    supabase
      .from('leads')
      .select(CALL_COLS, { count: 'exact' })
      .lt('proximo_retorno', today)
      .neq('status', 'fechado')
      .order('proximo_retorno', { ascending: true })
      .limit(5),
    supabase
      .from('leads')
      .select(CALL_COLS, { count: 'exact' })
      .eq('proximo_retorno', today)
      .neq('status', 'fechado')
      .order('created_at', { ascending: true })
      .limit(5),
    supabase
      .from('leads')
      .select(CALL_COLS, { count: 'exact' })
      .eq('status', 'novo')
      .is('proximo_retorno', null)
      .order('created_at', { ascending: true })
      .limit(5),
    supabase
      .from('leads')
      .select('proximo_retorno')
      .gte('proximo_retorno', monthStart)
      .lt('proximo_retorno', monthEnd)
      .neq('status', 'fechado'),
  ])
  if (overdueRes.error) throw overdueRes.error
  if (todayRes.error) throw todayRes.error
  if (freshRes.error) throw freshRes.error
  if (monthRes.error) throw monthRes.error

  const monthCounts: Record<string, number> = {}
  for (const r of monthRes.data ?? []) {
    if (r.proximo_retorno) {
      monthCounts[r.proximo_retorno] = (monthCounts[r.proximo_retorno] ?? 0) + 1
    }
  }

  const overdueCount = overdueRes.count ?? 0
  const todayCount = todayRes.count ?? 0

  return (
    <div>
      <PageHeader
        title="Hoje"
        description="Quem precisa de retorno, em ordem. Comece pelo topo."
      />
      {total === 0 ? (
        <div className="py-8">
          <p className="font-display text-3xl font-semibold">
            Toda conversa começa com um contato.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre o primeiro e saiba quem chamar todo dia.
          </p>
          <Link
            href="/leads/novo"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Cadastrar contato
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4 border-b border-border pb-6">
            <Link href="/leads?retorno=hoje" className="group">
              <span className="metric-number block text-5xl font-semibold leading-none md:text-6xl">
                {todayCount}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground group-hover:underline">
                para hoje →
              </span>
            </Link>
            <Link href="/leads?retorno=atrasados" className="group">
              <span className="metric-number block text-5xl font-semibold leading-none text-destructive md:text-6xl">
                {overdueCount}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground group-hover:underline">
                atrasados →
              </span>
            </Link>
            <span className="pb-1 text-sm text-muted-foreground">
              {total} contato{total === 1 ? '' : 's'} no total
            </span>
          </div>
          <div className="mt-2">
            <AgendaTimeline
              overdue={overdueRes.data ?? []}
              today={todayRes.data ?? []}
              fresh={freshRes.data ?? []}
              todayISO={today}
            />
          </div>
        </>
      )}
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ReturnCalendar year={calY} month={calM} counts={monthCounts} />
        <FunnelCard leads={leads ?? []} />
      </div>
      <details className="mt-8 border-t border-border pt-4">
        <summary className="min-h-11 cursor-pointer py-3 font-mono text-xs font-medium uppercase tracking-[0.08em]">
          Resultados e origens
        </summary>
        <div className="mt-4 max-w-2xl">
          <OriginsCard leads={leads ?? []} />
        </div>
      </details>
    </div>
  )
}
