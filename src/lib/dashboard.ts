import { dateISOInTimeZone } from '@/lib/dates'
import type { Lead, Note } from '@/types'

export type DashboardLead = Pick<
  Lead,
  | 'id'
  | 'nome'
  | 'whatsapp'
  | 'status'
  | 'source'
  | 'created_at'
  | 'proximo_retorno'
  | 'nota_retorno'
>

export interface CalendarEvent {
  id: string
  leadId: string
  name: string
  date: string
  kind: 'note' | 'created' | 'return'
  description: string
  timestamp?: string
}

export function dashboardEvents(
  leads: DashboardLead[],
  notes: Note[],
  month: string,
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const names = new Map(leads.map((lead) => [lead.id, lead.nome]))
  for (const lead of leads) {
    const created = dateISOInTimeZone(lead.created_at)
    if (created.startsWith(month))
      events.push({
        id: `created-${lead.id}`,
        leadId: lead.id,
        name: lead.nome,
        date: created,
        kind: 'created',
        description: 'Contato cadastrado',
        timestamp: lead.created_at,
      })
    if (lead.status !== 'fechado' && lead.proximo_retorno?.startsWith(month))
      events.push({
        id: `return-${lead.id}`,
        leadId: lead.id,
        name: lead.nome,
        date: lead.proximo_retorno,
        kind: 'return',
        description: lead.nota_retorno || 'Retorno agendado, sem observação.',
      })
  }
  for (const note of notes) {
    const date = dateISOInTimeZone(note.created_at)
    if (!date.startsWith(month) || !names.has(note.lead_id)) continue
    events.push({
      id: `note-${note.id}`,
      leadId: note.lead_id,
      name: names.get(note.lead_id)!,
      date,
      kind: 'note',
      description: note.texto,
      timestamp: note.created_at,
    })
  }
  return events.sort((a, b) =>
    (b.timestamp ?? b.date).localeCompare(a.timestamp ?? a.date),
  )
}

export function dashboardMonth(value: string | undefined, today: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value ?? '')
  const valid = match && Number(match[1]) >= 1900 && Number(match[1]) <= 2100
  const key = valid ? value! : today.slice(0, 7)
  const [year, month] = key.split('-').map(Number)
  const end = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  return { key, year, month, start: `${key}-01`, end }
}
