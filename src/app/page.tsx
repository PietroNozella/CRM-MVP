import { createClient } from '@/lib/supabase/server'
import { DashboardOverview } from '@/components/dashboard-overview'
import { dayStartUTC, todayISO } from '@/lib/dates'
import { dashboardMonth, type DashboardLead } from '@/lib/dashboard'
import type { Note } from '@/types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const today = todayISO()
  const { year, month, start, end } = dashboardMonth(
    typeof searchParams.mes === 'string' ? searchParams.mes : undefined,
    today,
  )
  const supabase = await createClient()

  // Paginação evita indicadores parciais quando a base ultrapassa o limite do PostgREST.
  async function getLeads() {
    const leads: DashboardLead[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase
        .from('leads')
        .select(
          'id,nome,whatsapp,status,source,created_at,proximo_retorno,nota_retorno',
        )
        .order('created_at')
        .order('id')
        .range(offset, offset + 499)
      if (error) throw error
      leads.push(...data)
      if (data.length < 500) return leads
    }
  }

  async function getNotes() {
    const notes: Note[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase
        .from('notes')
        .select('id,lead_id,texto,created_at')
        .gte('created_at', dayStartUTC(start))
        .lt('created_at', dayStartUTC(end))
        .order('created_at')
        .order('id')
        .range(offset, offset + 499)
      if (error) throw error
      notes.push(...data)
      if (data.length < 500) return notes
    }
  }

  const [leads, notes] = await Promise.all([getLeads(), getNotes()])
  return (
    <DashboardOverview
      leads={leads}
      notes={notes}
      year={year}
      month={month}
      today={today}
    />
  )
}
