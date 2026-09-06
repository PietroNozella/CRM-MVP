import { createClient } from '@/lib/supabase/server'
import { DashboardCards } from '@/components/dashboard-cards'
import { FunnelCard, OriginsCard } from '@/components/dashboard-metrics'
import { WhoToCall } from '@/components/who-to-call'
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

  const byStatus: Record<string, number> = {}
  for (const l of leads ?? []) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1
  }

  const stats = {
    total: leads?.length ?? 0,
    byStatus,
  }

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

  return (
    <div>
      <PageHeader
        title="Hoje"
        description="Quem precisa de retorno, em ordem. Comece pelo topo."
      />
      <WhoToCall
        overdue={overdueRes.data ?? []}
        today={todayRes.data ?? []}
        fresh={freshRes.data ?? []}
        counts={{ overdue: overdueRes.count ?? 0, today: todayRes.count ?? 0, fresh: freshRes.count ?? 0 }}
        hasAny={stats.total > 0}
      />
      <DashboardCards stats={stats} />
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
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
