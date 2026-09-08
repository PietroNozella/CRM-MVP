'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowUpRight,
  CheckCheck,
  MessageCircle,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { whatsappMessage, whatsappLink } from '@/lib/site'
import type { CallItem } from '@/components/who-to-call'
import { cn } from '@/lib/utils'

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
  const [selected, setSelected] = useState<'overdue' | 'today' | 'fresh'>(
    overdue.length ? 'overdue' : today.length ? 'today' : 'fresh',
  )
  const groups = {
    overdue: {
      label: 'Atrasados',
      items: overdue,
      href: '/leads?retorno=atrasados',
      color: 'bg-destructive/10 text-destructive',
    },
    today: {
      label: 'Para hoje',
      items: today,
      href: '/leads?retorno=hoje',
      color: 'bg-primary/10 text-primary',
    },
    fresh: {
      label: 'Sem primeiro retorno',
      items: fresh,
      href: '/leads?status=novo&retorno=sem_retorno',
      color: 'bg-info-soft text-info-foreground',
    },
  }
  const active = groups[selected]
  return (
    <section className="dashboard-panel" aria-labelledby="priorities-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="priorities-title" className="panel-title">
            Próximas conversas
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Priorize quem está esperando por você.
          </p>
        </div>
        <Link
          href={active.href}
          className="flex min-h-11 shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver todos <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div
        className="my-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar próximas conversas"
      >
        {(Object.keys(groups) as Array<keyof typeof groups>).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-medium',
              selected === key
                ? groups[key].color
                : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {groups[key].label}
            <span className="rounded-md bg-card/70 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
              {groups[key].items.length}
            </span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {active.items.length} contatos: {active.label}
      </p>
      {active.items.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCheck aria-hidden="true" className="mb-3 size-8 text-primary" />
          <p className="text-sm font-semibold">
            {selected === 'overdue'
              ? 'Nenhum retorno atrasado'
              : selected === 'today'
                ? 'Nenhum retorno para hoje'
                : 'Nenhum novo contato sem retorno'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Consulte as outras listas ou explore sua agenda.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-border/60">
          {active.items.slice(0, 5).map((lead) => {
            const href = whatsappLink(lead.whatsapp, whatsappMessage(lead.nome))
            const overdueDays =
              lead.proximo_retorno && lead.proximo_retorno < todayISO
                ? Math.round(
                    (Date.parse(todayISO) - Date.parse(lead.proximo_retorno)) /
                      86400000,
                  )
                : 0
            return (
              <li
                key={lead.id}
                className="flex flex-wrap items-center gap-3 py-4"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    active.color,
                  )}
                >
                  {lead.nome
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((name) => name[0])
                    .join('')}
                </span>
                <div className="min-w-0 flex-1 basis-36">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="block truncate text-sm font-semibold hover:underline"
                    title={lead.nome}
                  >
                    {lead.nome}
                  </Link>
                  <p
                    className="mt-1 truncate text-xs text-muted-foreground"
                    title={lead.nota_retorno ?? undefined}
                  >
                    {lead.nota_retorno ||
                      'Combine o próximo passo com este contato.'}
                  </p>
                  <p
                    className={cn(
                      'mt-1.5 text-[11px] font-medium',
                      selected === 'overdue'
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                    )}
                  >
                    {overdueDays
                      ? `${overdueDays} ${overdueDays === 1 ? 'dia de atraso' : 'dias de atraso'}`
                      : lead.proximo_retorno === todayISO
                        ? 'Retorno hoje'
                        : 'Ainda sem retorno agendado'}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="size-11"
                  >
                    <Link
                      href={`/leads/${lead.id}#nova-nota`}
                      aria-label={`Anotar sobre ${lead.nome}`}
                    >
                      <StickyNote className="size-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  {href ? (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="min-h-11 border-primary/15 bg-primary/5 text-primary"
                    >
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Chamar ${lead.nome} no WhatsApp`}
                      >
                        <MessageCircle className="size-4" />
                        <span className="hidden sm:inline">Chamar</span>
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="min-h-11"
                    >
                      <Link href={`/leads/${lead.id}#dados-contato`}>
                        Corrigir telefone
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
      {active.items.length > 5 && (
        <p className="mt-2 border-t pt-3 text-xs text-muted-foreground">
          Mostrando os 5 primeiros de {active.items.length}.{' '}
          <Link
            href={active.href}
            className="font-medium text-primary hover:underline"
          >
            Ver lista completa
          </Link>
        </p>
      )}
    </section>
  )
}
