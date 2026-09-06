import { createClient } from '@/lib/supabase/server'
import { DashboardCards } from '@/components/dashboard-cards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase.from('leads').select('status')

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
    </div>
  )
}
