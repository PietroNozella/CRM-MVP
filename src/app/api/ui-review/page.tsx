import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { DashboardOverview } from '@/components/dashboard-overview'
import { dashboardMonth } from '@/lib/dashboard'
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

export default function UIReview({ searchParams }: { searchParams: { view?: string; empty?: string; mes?: string } }) {
  if (process.env.NODE_ENV !== 'development') notFound()
  const view = searchParams.view ?? 'today'
  const empty = searchParams.empty === '1'
  if (view === 'today') {
    const today = todayISO()
    const { year, month } = dashboardMonth(searchParams.mes, today)
    const currentMonth = today.slice(0, 7)
    const demoLeads = Array.from({ length: 32 }, (_, index) => ({
      ...leads[index % leads.length],
      id: `demo-${index}`,
      nome: ['Ana Carolina de Albuquerque e Vasconcelos', 'João Mendes', 'Marina Costa', 'Pedro Lima', 'Beatriz Santos', 'Rafael Oliveira', 'Juliana Ferreira', 'Lucas Ribeiro'][index % 8],
      status: (['novo', 'em_atendimento', 'em_negociacao', 'fechado'] as const)[index % 10 < 4 ? 0 : index % 10 < 7 ? 1 : index % 10 < 9 ? 2 : 3],
      source: ['Indicação', 'Instagram', 'Site', 'WhatsApp', null][index % 5],
      created_at: `${currentMonth}-${String(1 + index % Math.max(1, Number(today.slice(8)))).padStart(2, '0')}T14:00:00Z`,
      proximo_retorno: index % 4 === 0 ? null : index % 4 === 1 ? today : `${currentMonth}-${index % 4 === 2 ? '01' : '20'}`,
    }))
    const demoNotes = Array.from({ length: 18 }, (_, index) => ({
      id: `demo-note-${index}`, lead_id: `demo-${index}`,
      texto: ['Proposta enviada. Cliente vai avaliar as condições e retornar com a decisão.', 'Conversamos sobre o projeto. Próximo passo: apresentar as opções na reunião.', 'Cliente confirmou interesse. Preparar a proposta com o escopo combinado.'][index % 3],
      created_at: `${currentMonth}-${String(1 + index % Math.max(1, Number(today.slice(8)))).padStart(2, '0')}T15:30:00Z`,
    }))
    return <><p className="mb-5 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">Prévia de desenvolvimento · dados fictícios para revisão visual, sem salvar alterações.</p><DashboardOverview leads={empty ? [] : demoLeads} notes={empty ? [] : demoNotes} year={year} month={month} today={today} /></>
  }
  return <>
    <PageHeader title={view === 'today' ? 'Hoje' : view === 'contacts' ? 'Contatos' : view === 'kanban' ? 'Funil' : view === 'new' ? 'Novo contato' : view === 'edit' ? leads[0].nome : 'Importar contatos'} description="Prévia temporária com dados fictícios — revisão visual, sem salvar alterações." />
    {view === 'contacts' && <><LeadsFilters initialStatus="novo" /><div className="hidden overflow-hidden rounded-lg border bg-card xl:block"><LeadsTable leads={empty ? [] : leads} /></div><LeadsCards leads={empty ? [] : leads} /></>}
    {view === 'kanban' && <KanbanBoard initialLeads={empty ? [] : leads} />}
    {view === 'new' && <LeadForm />}
    {view === 'edit' && <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-start"><section><h2 className="mb-5 text-xl font-semibold">Anotações</h2><NotesTimeline leadId={leads[0].id} initialNotes={[{ id: 'test-note', lead_id: leads[0].id, texto: 'Cliente pediu retorno na segunda de manhã. Enviar orçamento com as condições conversadas e revisar cronograma.', created_at: leads[0].created_at }]} /></section><Card><CardHeader className="border-b"><CardTitle>Atendimento e dados do contato</CardTitle></CardHeader><CardContent className="pt-5 md:pt-6"><LeadEditForm lead={leads[0]} /></CardContent></Card></div>}
    {view === 'import' && <CsvImport />}
  </>
}
