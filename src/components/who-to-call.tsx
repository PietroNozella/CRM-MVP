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
    <div className="flex flex-wrap items-center gap-3 border-b py-4 last:border-0">
      <div className="min-w-0 flex-1 basis-48">
        <Link
          href={`/leads/${lead.id}`}
          className="text-base font-semibold hover:underline break-words block"
        >
          {lead.nome}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground break-words">
          {lead.nota_retorno || 'Primeiro contato ou retorno a combinar'}
        </p>
        {lead.proximo_retorno && <p className="mt-2 font-mono text-xs text-muted-foreground">Retorno: {lead.proximo_retorno.split('-').reverse().join('/')}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
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
        <CardContent className="pt-6 md:pt-6">
          <h2 className="font-display text-3xl font-semibold">Toda conversa começa com um contato.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Cadastre o primeiro e mantenha o próximo passo por perto.</p>
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

  const featured = groups.find((group) => group.count > 0) ?? groups[0]

  function renderQueue(g: (typeof groups)[number], prominent = false) {
    return (
      <Card key={g.title} className={prominent && g.count > 0 ? 'border-l-4 border-l-accent' : ''}>
        <CardHeader className="flex-row items-end justify-between gap-3 space-y-0 border-b pb-4">
          <div>
            <p className="section-index">{g.index} / FILA</p>
            <CardTitle className="mt-2 text-lg font-semibold">{g.title}</CardTitle>
          </div>
          <span className="metric-number text-4xl font-medium">{g.count}</span>
        </CardHeader>
        <CardContent className={g.items.length === 0 ? 'pt-4 md:pt-4' : ''}>
          {g.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{g.empty}</p>
          ) : g.items.map((lead) => <CallRow key={lead.id} lead={lead} />)}
          {g.count > 0 && <Button variant="link" className="mt-2 min-h-11 p-0 text-sm" asChild>
            <Link href={g.href} aria-label={`Abrir fila: ${g.title}`}>Abrir fila →</Link>
          </Button>}
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Agenda de contatos</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Próximas conversas</h2>
        </div>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {renderQueue(featured, true)}
        <div className="grid gap-4">
          {groups.filter((group) => group !== featured).map((group) => renderQueue(group))}
        </div>
      </div>
    </section>
  )
}
