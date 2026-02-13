import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/leads-table'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leads</h1>
      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
