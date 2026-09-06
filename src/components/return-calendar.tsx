'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  StickyNote,
  UserPlus,
} from 'lucide-react'
import { APP_TIME_ZONE } from '@/lib/dates'
import type { CalendarEvent } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const monthLabel = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const dayLabel = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const timeLabel = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: APP_TIME_ZONE,
})

export function ReturnCalendar({
  year,
  month,
  events,
  today,
}: {
  year: number
  month: number
  events: CalendarEvent[]
  today: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const initialDay = today.startsWith(monthKey) ? today : `${monthKey}-01`
  const [selected, setSelected] = useState(initialDay)
  const [filter, setFilter] = useState<'history' | 'return'>(
    events.some((event) => event.date === initialDay && event.kind !== 'return')
      ? 'history'
      : events.some(
            (event) => event.date === initialDay && event.kind === 'return',
          )
        ? 'return'
        : 'history',
  )
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const byDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayEvents = byDay.get(event.date)
    if (dayEvents) dayEvents.push(event)
    else byDay.set(event.date, [event])
  }
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const iso = `${monthKey}-${String(index + 1).padStart(2, '0')}`
    const items = byDay.get(iso) ?? []
    return {
      iso,
      number: index + 1,
      notes: items.filter((event) => event.kind === 'note').length,
      created: items.filter((event) => event.kind === 'created').length,
      returns: items.filter((event) => event.kind === 'return').length,
    }
  })
  const maxActivity = Math.max(1, ...days.map((day) => day.notes + day.created))
  const records = events.filter((event) => event.kind !== 'return').length
  const selectedEvents = byDay.get(selected) ?? []
  const history = selectedEvents.filter((event) => event.kind !== 'return')
  const returns = selectedEvents.filter((event) => event.kind === 'return')
  const visible = filter === 'history' ? history : returns

  function selectDay(iso: string) {
    setSelected(iso)
    const dayEvents = byDay.get(iso) ?? []
    const hasHistory = dayEvents.some((event) => event.kind !== 'return')
    const hasReturns = dayEvents.some((event) => event.kind === 'return')
    if (!hasHistory && hasReturns) setFilter('return')
    else if (!hasReturns) setFilter('history')
  }

  function monthHref(delta: number) {
    const key = new Date(Date.UTC(year, month - 1 + delta, 1))
      .toISOString()
      .slice(0, 7)
    const params = new URLSearchParams(searchParams.toString())
    params.set('mes', key)
    return `${pathname}?${params}`
  }

  return (
    <section className="dashboard-panel" aria-labelledby="activity-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="activity-title" className="panel-title">
            Sua atividade
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            O que entrou, o que foi registrado e o próximo passo.
          </p>
        </div>
        <nav
          aria-label="Mês do calendário"
          className="flex items-center gap-1 rounded-lg bg-secondary/70 p-0.5"
        >
          {year === 1900 && month === 1 ? (
            <button
              disabled
              aria-label="Mês anterior"
              className="size-11 opacity-30"
            >
              <ChevronLeft className="mx-auto size-4" />
            </button>
          ) : (
            <Link
              href={monthHref(-1)}
              scroll={false}
              aria-label="Mês anterior"
              className="flex size-11 items-center justify-center rounded-md hover:bg-card"
            >
              <ChevronLeft className="size-4" />
            </Link>
          )}
          <span className="text-xs font-semibold capitalize">
            {monthLabel.format(new Date(Date.UTC(year, month - 1, 1)))}
          </span>
          {year === 2100 && month === 12 ? (
            <button
              disabled
              aria-label="Mês seguinte"
              className="size-11 opacity-30"
            >
              <ChevronRight className="mx-auto size-4" />
            </button>
          ) : (
            <Link
              href={monthHref(1)}
              scroll={false}
              aria-label="Mês seguinte"
              className="flex size-11 items-center justify-center rounded-md hover:bg-card"
            >
              <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <p>
          <strong className="metric-number text-3xl font-semibold">
            {records}
          </strong>
          <span className="ml-2 text-xs text-muted-foreground">
            registros no mês
          </span>
        </p>
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm bg-primary" />
            Anotações
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-sm bg-accent" />
            Novos contatos
          </span>
        </div>
      </div>
      <div className="relative mt-5 pl-5">
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 text-[9px] tabular-nums text-muted-foreground"
        >
          {maxActivity}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-0 text-[9px] text-muted-foreground"
        >
          0
        </span>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex h-28 flex-col justify-between"
        >
          <span className="border-t border-dashed" />
          <span className="border-t border-dashed" />
          <span className="border-t" />
        </div>
        <div
          className="relative flex gap-1"
          role="img"
          aria-label={`Atividade diária em ${monthLabel.format(new Date(Date.UTC(year, month - 1, 1)))}: ${records} registros. Selecione um dia no calendário para consultar os detalhes.`}
        >
          {days.map((day) => (
            <div
              key={day.iso}
              className="min-w-0 flex-1"
              title={`${day.number}: ${day.notes} anotações, ${day.created} novos contatos`}
            >
              <div className="flex h-28 flex-col justify-end">
                <div
                  className="flex flex-col-reverse overflow-hidden rounded-t-[3px]"
                  style={{
                    height: `${((day.notes + day.created) / maxActivity) * 100}%`,
                  }}
                >
                  <span
                    className="min-h-0 bg-primary"
                    style={{ flex: day.notes }}
                  />
                  <span
                    className="min-h-0 bg-accent"
                    style={{ flex: day.created }}
                  />
                </div>
              </div>
              <span className="mt-2 block h-4 text-center text-[9px] tabular-nums text-muted-foreground">
                {day.number === 1 ||
                day.number % 5 === 0 ||
                day.number === daysInMonth
                  ? day.number
                  : ''}
              </span>
            </div>
          ))}
        </div>
        {records === 0 && (
          <p className="absolute inset-x-0 top-8 mx-auto w-fit rounded-lg bg-card/95 px-3 py-2 text-xs text-muted-foreground">
            Nenhum registro neste mês
          </p>
        )}
      </div>
      <div className="mt-5 grid gap-5 border-t pt-5 min-[1100px]:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <CalendarDays
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Explore por dia
            </p>
            {today.startsWith(monthKey) && (
              <button
                type="button"
                onClick={() => selectDay(today)}
                className="min-h-11 px-2 text-xs font-semibold text-primary hover:underline"
              >
                Hoje
              </button>
            )}
          </div>
          <div
            className="grid grid-cols-7 gap-0.5 text-center"
            role="group"
            aria-label="Selecione um dia"
          >
            {WEEK.map((day) => (
              <span
                key={day}
                className="pb-2 text-[10px] font-medium text-muted-foreground"
              >
                {day}
              </span>
            ))}
            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {days.map((day) => (
              <button
                type="button"
                key={day.iso}
                onClick={() => selectDay(day.iso)}
                aria-pressed={selected === day.iso}
                aria-current={day.iso === today ? 'date' : undefined}
                aria-controls="calendar-day-details"
                aria-label={`${day.number} de ${monthLabel.format(new Date(Date.UTC(year, month - 1, 1)))}, ${day.notes + day.created} registros, ${day.returns} retornos${day.iso === today ? ', hoje' : ''}`}
                className={cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-xs tabular-nums transition-colors',
                  selected === day.iso
                    ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                    : day.iso === today
                      ? 'bg-secondary font-bold text-primary ring-1 ring-inset ring-primary/25 hover:bg-primary/10'
                      : day.returns > 0 && day.iso < today
                        ? 'bg-destructive/5 font-medium text-destructive hover:bg-destructive/10'
                        : day.notes + day.created > 0
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-secondary',
                )}
              >
                {day.number}
                <span className="flex h-1 gap-0.5" aria-hidden="true">
                  {day.notes + day.created > 0 && (
                    <span
                      className={cn(
                        'size-1 rounded-full',
                        selected === day.iso ? 'bg-accent' : 'bg-primary',
                      )}
                    />
                  )}
                  {day.returns > 0 && (
                    <span
                      className={cn(
                        'size-1 rounded-full',
                        day.iso < today
                          ? selected === day.iso
                            ? 'bg-[#FFB8AA]'
                            : 'bg-destructive'
                          : selected === day.iso
                            ? 'bg-white'
                            : 'bg-[#5986A6]',
                      )}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <i className="size-1.5 rounded-full bg-primary" />
              Registro
            </span>
            <span className="flex items-center gap-1">
              <i className="size-1.5 rounded-full bg-[#5986A6]" />
              Retorno
            </span>
            <span className="flex items-center gap-1">
              <i className="size-1.5 rounded-full bg-destructive" />
              Atrasado
            </span>
          </div>
        </div>
        <div
          id="calendar-day-details"
          className="min-w-0 rounded-xl bg-background p-4"
        >
          <h3 className="text-sm font-semibold" aria-live="polite">
            {dayLabel.format(new Date(`${selected}T12:00:00Z`))}
            {selected === today && (
              <span className="ml-2 text-[10px] font-medium text-primary">
                HOJE
              </span>
            )}
          </h3>
          <div
            className="my-3 flex gap-1 rounded-lg bg-card p-1"
            role="group"
            aria-label="Tipo de atividade"
          >
            <button
              type="button"
              onClick={() => setFilter('history')}
              aria-pressed={filter === 'history'}
              className={cn(
                'min-h-11 flex-1 rounded-md px-2 text-xs font-medium',
                filter === 'history'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              Registros{' '}
              <span className="ml-1 tabular-nums">{history.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('return')}
              aria-pressed={filter === 'return'}
              className={cn(
                'min-h-11 flex-1 rounded-md px-2 text-xs font-medium',
                filter === 'return'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              Retornos{' '}
              <span className="ml-1 tabular-nums">{returns.length}</span>
            </button>
          </div>
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {visible.length} {filter === 'history' ? 'registros' : 'retornos'}{' '}
            em {dayLabel.format(new Date(`${selected}T12:00:00Z`))}
          </div>
          {visible.length === 0 ? (
            <div className="flex min-h-36 flex-col items-center justify-center text-center">
              <CalendarDays
                aria-hidden="true"
                className="mb-3 size-7 text-muted-foreground/50"
              />
              <p className="text-xs font-medium">
                {filter === 'history'
                  ? 'Nenhum registro neste dia'
                  : 'Nenhum retorno neste dia'}
              </p>
              <p className="mt-1 max-w-52 text-[11px] leading-5 text-muted-foreground">
                {filter === 'history'
                  ? 'Cadastros e anotações salvas aparecem aqui.'
                  : 'Selecione outra data para ver a agenda.'}
              </p>
            </div>
          ) : (
            <ol
              className="max-h-56 space-y-4 overflow-y-auto pr-1"
              tabIndex={0}
              aria-label="Atividades do dia"
            >
              {visible.map((event) => {
                const Icon =
                  event.kind === 'note'
                    ? StickyNote
                    : event.kind === 'created'
                      ? UserPlus
                      : Clock3
                return (
                  <li key={event.id} className="flex gap-2.5">
                    <span
                      className={cn(
                        'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg',
                        event.kind === 'return' && event.date < today
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon aria-hidden="true" className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                        <span>
                          {event.kind === 'note'
                            ? 'Anotação'
                            : event.kind === 'created'
                              ? 'Novo contato'
                              : event.date < today
                                ? 'Retorno atrasado'
                                : 'Retorno agendado'}
                        </span>
                        {event.timestamp && (
                          <time dateTime={event.timestamp}>
                            {timeLabel.format(new Date(event.timestamp))}
                          </time>
                        )}
                      </div>
                      <Link
                        href={`/leads/${event.leadId}`}
                        className="block break-words text-xs font-semibold hover:underline"
                      >
                        {event.name}
                      </Link>
                      {event.kind !== 'created' &&
                        (event.description.length > 130 ? (
                          <details className="mt-1 text-xs leading-5 text-muted-foreground">
                            <summary className="cursor-pointer break-words">
                              {event.description.slice(0, 100)}…{' '}
                              <span className="text-primary">Ler anotação</span>
                            </summary>
                            <p className="mt-2 whitespace-pre-wrap break-words">
                              {event.description}
                            </p>
                          </details>
                        ) : (
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
                            {event.description}
                          </p>
                        ))}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          {filter === 'return' && returns.length > 0 && (
            <Link
              href={`/leads?retorno_dia=${selected}`}
              className="mt-3 flex min-h-11 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver contatos do dia{' '}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
