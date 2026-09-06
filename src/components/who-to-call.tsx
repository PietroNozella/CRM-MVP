import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import { whatsappMessage, whatsappLink } from '@/lib/site'

export interface CallItem {
  id: string
  nome: string
  whatsapp: string
  status: string
  proximo_retorno: string | null
  nota_retorno: string | null
}

function CallRow({ lead }: { lead: CallItem }) {
  const href = whatsappLink(lead.whatsapp, whatsappMessage(lead.nome))
  return (
    <div className="grid gap-3 border-b py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0 flex-1">
        <Link
          href={`/leads/${lead.id}`}
          className="text-sm font-medium hover:underline break-words block"
        >
          {lead.nome}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground break-words">
          {lead.nota_retorno || 'Primeiro contato ou retorno a combinar'}
        </p>
        {lead.proximo_retorno && <p className="mt-1 text-xs text-muted-foreground">Retorno: {lead.proximo_retorno.split('-').reverse().join('/')}</p>}
      </div>
      <div className="flex flex-wrap gap-2 sm:w-44">
      {href ? (
        <Button size="sm" asChild className="flex-1 min-h-11">
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Chamar ${lead.nome} no WhatsApp`}>
            <MessageCircle className="h-4 w-4 mr-1" />
            Chamar
          </a>
        </Button>
      ) : <Button asChild variant="outline" className="min-h-11 flex-1"><Link href={`/leads/${lead.id}#dados-contato`}>Corrigir telefone</Link></Button>}
      <Button size="sm" variant="outline" asChild className="min-h-11 flex-1"><Link href={`/leads/${lead.id}#nova-nota`}>Anotar<span className="sr-only"> sobre {lead.nome}</span></Link></Button>
      </div>
    </div>
  )
}

export function WhoToCall({
  overdue,
  today,
  fresh,
  hasAny,
  counts,
}: {
  overdue: CallItem[]
  today: CallItem[]
  fresh: CallItem[]
  hasAny: boolean
  counts: { overdue: number; today: number; fresh: number }
}) {
  if (!hasAny) {
    return (
      <Card className="mb-6 border-l-4 border-l-accent">
        <CardContent className="pt-6">
          <p className="text-sm">Cadastre seu primeiro contato para começar.</p>
          <Button asChild className="mt-3 min-h-11">
            <Link href="/leads/novo">Novo contato</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const groups = [
    {
      index: '01',
      title: 'Atrasados',
      count: counts.overdue,
      empty: 'Nenhum retorno atrasado.',
      items: overdue,
      href: '/leads?retorno=atrasados',
    },
    {
      index: '02',
      title: 'Retornos de hoje',
      count: counts.today,
      empty: 'Nenhum retorno para hoje.',
      items: today,
      href: '/leads?retorno=hoje',
    },
    {
      index: '03',
      title: 'Novos sem retorno',
      count: counts.fresh,
      empty: 'Nenhum contato novo sem retorno.',
      items: fresh,
      href: '/leads?status=novo&retorno=sem_retorno',
    },
  ]

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Agenda de contatos</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">Próximas conversas</h2>
        </div>
        <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground sm:block">Atualizado agora</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((g, index) => (
          <Card key={g.title} className={index === 0 ? 'border-l-4 border-l-accent xl:row-span-2' : ''}>
            <CardHeader className="flex-row items-end justify-between space-y-0 border-b pb-4">
              <div>
                <p className="section-index">{g.index} / FILA</p>
                <CardTitle className="mt-2 text-base font-semibold">{g.title}</CardTitle>
              </div>
              <span className="metric-number text-3xl font-medium">{g.count}</span>
            </CardHeader>
            <CardContent>
              {g.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {g.empty}
                </p>
              ) : (
                g.items.map((l) => <CallRow key={l.id} lead={l} />)
              )}
              <Button variant="link" className="mt-2 min-h-11 p-0 font-mono text-xs uppercase tracking-[0.1em]" asChild>
                <Link href={g.href} aria-label={`Ver todos: ${g.title}`}>Abrir fila →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
