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
    <div className="space-y-2 py-3 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <Link
          href={`/leads/${lead.id}`}
          className="text-sm font-medium hover:underline break-words block"
        >
          {lead.nome}
        </Link>
        <p className="text-sm text-muted-foreground break-words">
          {lead.nota_retorno || 'Primeiro contato ou retorno a combinar'}
        </p>
        {lead.proximo_retorno && <p className="mt-1 text-xs text-muted-foreground">Retorno: {lead.proximo_retorno.split('-').reverse().join('/')}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
      {href ? (
        <Button size="sm" asChild className="flex-1 min-h-11">
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Chamar ${lead.nome} no WhatsApp`}>
            <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
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
      <Card className="mb-6">
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
      title: `Atrasados (${counts.overdue})`,
      empty: 'Nenhum retorno atrasado.',
      items: overdue,
      href: '/leads?retorno=atrasados',
    },
    {
      title: `Retornos de hoje (${counts.today})`,
      empty: 'Nenhum retorno para hoje.',
      items: today,
      href: '/leads?retorno=hoje',
    },
    {
      title: `Novos sem retorno (${counts.fresh})`,
      empty: 'Nenhum contato novo sem retorno.',
      items: fresh,
      href: '/leads?status=novo&retorno=sem_retorno',
    },
  ]

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Quem chamar</h2>
      <div className="grid gap-4 xl:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {g.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {g.empty}
                </p>
              ) : (
                g.items.map((l) => <CallRow key={l.id} lead={l} />)
              )}
              <Button variant="link" className="min-h-11 p-0 mt-2" asChild>
                <Link href={g.href} aria-label={`Ver todos: ${g.title}`}>Ver todos</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
