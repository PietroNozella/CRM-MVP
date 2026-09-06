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
    <div className="flex items-center gap-3 py-2 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <Link
          href={`/leads/${lead.id}`}
          className="text-sm font-medium hover:underline truncate block"
        >
          {lead.nome}
        </Link>
        <p className="text-xs text-muted-foreground truncate">
          {lead.nota_retorno || 'Sem motivo informado'}
        </p>
      </div>
      {href && (
        <Button size="sm" variant="outline" asChild className="shrink-0 min-h-11">
          <a href={href} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
            Chamar
          </a>
        </Button>
      )}
    </div>
  )
}

export function WhoToCall({
  overdue,
  today,
  fresh,
  hasAny,
}: {
  overdue: CallItem[]
  today: CallItem[]
  fresh: CallItem[]
  hasAny: boolean
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
      title: `Atrasados (${overdue.length})`,
      items: overdue,
      href: '/leads?retorno=atrasados',
    },
    {
      title: `Retornos de hoje (${today.length})`,
      items: today,
      href: '/leads?retorno=hoje',
    },
    {
      title: `Novos sem retorno (${fresh.length})`,
      items: fresh,
      href: '/leads?status=novo',
    },
  ]

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Quem chamar</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {g.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum contato.
                </p>
              ) : (
                g.items.map((l) => <CallRow key={l.id} lead={l} />)
              )}
              <Button variant="link" className="h-auto p-0 mt-2" asChild>
                <Link href={g.href}>Ver todos</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
