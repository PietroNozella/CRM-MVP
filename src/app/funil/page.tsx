import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban-board'

export default async function FunilPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id,nome,status,interesse')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Funil</h1>
      <KanbanBoard initialLeads={leads ?? []} />
    </div>
  )
}
