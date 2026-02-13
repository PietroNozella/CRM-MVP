import { createClient } from '@/lib/supabase/server'
import { DashboardCards } from '@/components/dashboard-cards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase.from('leads').select('status')

  if (error) throw error

  const stats = {
    total: leads?.length ?? 0,
    novo: leads?.filter((l) => l.status === 'novo').length ?? 0,
    em_atendimento:
      leads?.filter((l) => l.status === 'em_atendimento').length ?? 0,
    visita: leads?.filter((l) => l.status === 'visita').length ?? 0,
    fechado: leads?.filter((l) => l.status === 'fechado').length ?? 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardCards stats={stats} />
    </div>
  )
}
