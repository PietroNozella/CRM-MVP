import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban-board'
import { PageHeader } from '@/components/page-header'

export default async function FunilPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id,nome,status,interesse')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <div>
      <PageHeader title="Funil" description="Arraste para a etapa certa. Contato parado é venda perdida." />
      <KanbanBoard initialLeads={leads ?? []} />
    </div>
  )
}
