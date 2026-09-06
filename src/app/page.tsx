import { createClient } from '@/lib/supabase/server'
import { DashboardCards } from '@/components/dashboard-cards'
import { DashboardMetrics } from '@/components/dashboard-metrics'

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
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
