import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { whatsappMessage, whatsappLink } from '@/lib/site'
import type { CallItem } from '@/components/who-to-call'

function badgeFor(iso: string | null, today: string) {
  if (!iso)
    return { label: 'sem data', cls: 'text-muted-foreground' }
  if (iso < today)
    return {
      label: iso.split('-').reverse().join('/'),
      cls: 'bg-destructive text-destructive-foreground',
    }
  if (iso === today)
    return { label: 'hoje', cls: 'bg-primary text-primary-foreground' }
  return {
    label: iso.split('-').reverse().join('/'),
    cls: 'bg-secondary text-secondary-foreground',
  }
}

export function AgendaTimeline({
  overdue,
  today,
  fresh,
  todayISO,
}: {
  overdue: CallItem[]
  today: CallItem[]
  fresh: CallItem[]
  todayISO: string
}) {
  const items = [...overdue, ...today, ...fresh].slice(0, 8)
  if (items.length === 0) return null

  return (
    <ol className="divide-y divide-border">
      {items.map((lead) => {
        const badge = badgeFor(lead.proximo_retorno, todayISO)
        const href = whatsappLink(lead.whatsapp, whatsappMessage(lead.nome))
        return (
          <li key={lead.id} className="flex items-center gap-3 py-3">
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}
            >
              {badge.label}
            </span>
            <span className="min-w-0 flex-1">
              <Link
                href={`/leads/${lead.id}`}
                className="block truncate text-sm font-medium hover:underline"
              >
                {lead.nome}
              </Link>
              <span className="block truncate text-xs text-muted-foreground">
                {lead.nota_retorno || 'Conversa nova — combine o próximo passo'}
              </span>
            </span>
            {href && (
              <Button size="sm" variant="ghost" asChild className="shrink-0 min-h-11" aria-label={`Chamar ${lead.nome} no WhatsApp`}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </a>
              </Button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
