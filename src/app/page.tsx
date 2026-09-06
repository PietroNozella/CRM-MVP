import { createClient } from '@/lib/supabase/server'
import { DashboardCards } from '@/components/dashboard-cards'
import { DashboardMetrics } from '@/components/dashboard-metrics'
import { WhoToCall } from '@/components/who-to-call'
import { todayISO } from '@/lib/dates'

const CALL_COLS =
  'id,nome,whatsapp,status,proximo_retorno,nota_retorno'

export default async function DashboardPage() {
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
  const [overdueRes, todayRes, freshRes] = await Promise.all([
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
  ])
  if (overdueRes.error) throw overdueRes.error
  if (todayRes.error) throw todayRes.error
  if (freshRes.error) throw freshRes.error

  return (
    <div>
      <h1 className="text-2xl font-bold">Hoje</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">Veja quem precisa de retorno e continue o atendimento.</p>
      <WhoToCall
        overdue={overdueRes.data ?? []}
        today={todayRes.data ?? []}
        fresh={freshRes.data ?? []}
        counts={{ overdue: overdueRes.count ?? 0, today: todayRes.count ?? 0, fresh: freshRes.count ?? 0 }}
        hasAny={stats.total > 0}
      />
      <DashboardCards stats={stats} />
      <details className="mt-6">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium">
          Ver resultados e origens
        </summary>
        <DashboardMetrics leads={leads ?? []} />
      </details>
    </div>
  )
}
