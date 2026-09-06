import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { WhoToCall } from '@/components/who-to-call'
import { DashboardCards } from '@/components/dashboard-cards'
import { LeadsFilters } from '@/components/leads-filters'
import { LeadsTable } from '@/components/leads-table'
import { LeadsCards } from '@/components/leads-cards'
import { KanbanBoard } from '@/components/kanban-board'
import { LeadForm } from '@/components/lead-form'
import { LeadEditForm } from '@/components/lead-edit-form'
import { NotesTimeline } from '@/components/notes-timeline'
import { CsvImport } from '@/components/csv-import'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { todayISO } from '@/lib/dates'
import type { Lead } from '@/types'

const leads: Lead[] = ['Ana Carolina de Albuquerque e Vasconcelos', 'João Mendes', 'Marina Costa', 'Pedro Lima'].map((nome, index) => ({
  id: `00000000-0000-4000-8000-00000000000${index}`,
  nome, whatsapp: index === 1 ? '123' : '11999999999', email: 'contato.de.demonstracao@example.com',
  status: (['novo', 'em_atendimento', 'em_negociacao', 'fechado'] as const)[index],
  interesse: 'Consultoria e acompanhamento do projeto', valor_maximo: 125000.50,
  source: 'Indicação', proximo_retorno: index === 0 ? '2026-01-01' : todayISO(),
  nota_retorno: 'Enviar proposta revisada e confirmar horário da próxima conversa.', created_at: '2026-01-01T12:00:00Z',
}))

export default function UIReview({ searchParams }: { searchParams: { view?: string; empty?: string } }) {
  if (process.env.NODE_ENV !== 'development') notFound()
  const view = searchParams.view ?? 'today'
  const empty = searchParams.empty === '1'
  return <>
    <PageHeader title={view === 'today' ? 'Hoje' : view === 'contacts' ? 'Contatos' : view === 'kanban' ? 'Funil' : view === 'new' ? 'Novo contato' : view === 'edit' ? leads[0].nome : 'Importar contatos'} description="Prévia temporária com dados fictícios — revisão visual, sem salvar alterações." />
    {view === 'today' && <><WhoToCall overdue={empty ? [] : leads.slice(0, 2)} today={leads.slice(2, 3)} fresh={[]} counts={{ overdue: empty ? 0 : 2, today: 1, fresh: 0 }} hasAny /><DashboardCards stats={{ total: 24, byStatus: { novo: 10, em_atendimento: 8, em_negociacao: 4, fechado: 2 } }} /></>}
    {view === 'contacts' && <><LeadsFilters initialStatus="novo" /><div className="hidden overflow-hidden rounded-lg border bg-card xl:block"><LeadsTable leads={empty ? [] : leads} /></div><LeadsCards leads={empty ? [] : leads} /></>}
    {view === 'kanban' && <KanbanBoard initialLeads={empty ? [] : leads} />}
    {view === 'new' && <LeadForm />}
    {view === 'edit' && <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-start"><section><h2 className="mb-5 text-xl font-semibold">Anotações</h2><NotesTimeline leadId={leads[0].id} initialNotes={[{ id: 'test-note', lead_id: leads[0].id, texto: 'Cliente pediu retorno na segunda de manhã. Enviar orçamento com as condições conversadas e revisar cronograma.', created_at: leads[0].created_at }]} /></section><Card><CardHeader className="border-b"><CardTitle>Atendimento e dados do contato</CardTitle></CardHeader><CardContent className="pt-5 md:pt-6"><LeadEditForm lead={leads[0]} /></CardContent></Card></div>}
    {view === 'import' && <CsvImport />}
  </>
}
