import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  Clock3,
  Plus,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { FunnelCard, OriginsCard } from '@/components/dashboard-metrics'
import { ReturnCalendar } from '@/components/return-calendar'
import { AgendaTimeline } from '@/components/agenda-timeline'
import { dashboardEvents, type DashboardLead } from '@/lib/dashboard'
import type { Note } from '@/types'

export function DashboardOverview({
  leads,
  notes,
  year,
  month,
  today,
}: {
  leads: DashboardLead[]
  notes: Note[]
  year: number
  month: number
  today: string
}) {
  const active = leads.filter((lead) => lead.status !== 'fechado')
  const overdue = active
    .filter((lead) => lead.proximo_retorno && lead.proximo_retorno < today)
    .sort((a, b) => a.proximo_retorno!.localeCompare(b.proximo_retorno!))
  const dueToday = active.filter((lead) => lead.proximo_retorno === today)
  const fresh = active.filter(
    (lead) => lead.status === 'novo' && !lead.proximo_retorno,
  )
  const scheduled = active.filter((lead) => lead.proximo_retorno)
  const upcoming = scheduled.length - overdue.length - dueToday.length
  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const events = dashboardEvents(leads, notes, monthKey)
  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${today}T12:00:00Z`))

  return (
    <>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
        Seu negócio em movimento
      </p>
      <PageHeader
        title="Hoje, com clareza."
        description={dateLabel}
        actions={
          <Button asChild>
            <Link href="/leads/novo">
              <Plus aria-hidden="true" />
              Novo contato
            </Link>
          </Button>
        }
      />
      {leads.length === 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-5">
          <div>
            <h2 className="font-semibold">Tudo começa com uma conversa.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre seu primeiro contato para dar vida ao seu painel.
            </p>
          </div>
          <Button asChild>
            <Link href="/leads/novo">Cadastrar primeiro contato</Link>
          </Button>
        </div>
      )}
      <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_1.2fr_0.8fr]">
        <Link
          href={
            overdue.length ? '/leads?retorno=atrasados' : '/leads?retorno=hoje'
          }
          className="group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground md:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-white/80">
              {overdue.length ? (
                <Clock3 aria-hidden="true" className="size-4" />
              ) : (
                <CheckCheck aria-hidden="true" className="size-4" />
              )}
              {overdue.length ? 'Precisam da sua atenção' : 'Retornos em dia'}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <strong className="metric-number text-5xl font-semibold text-accent">
              {overdue.length}
            </strong>
            <span className="text-sm">
              {overdue.length === 1 ? 'retorno atrasado' : 'retornos atrasados'}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/75">
            {overdue.length
              ? 'Retome essas conversas primeiro.'
              : 'Continue acompanhando suas próximas conversas.'}
          </p>
        </Link>
        <section
          className="dashboard-panel flex flex-col justify-between"
          aria-labelledby="schedule-summary"
        >
          <div className="flex items-center justify-between">
            <h2
              id="schedule-summary"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <CalendarDays aria-hidden="true" className="size-4" />
              Sua agenda de retornos
            </h2>
            <Link
              href="/leads?retorno=hoje"
              aria-label="Ver retornos de hoje"
              className="rounded p-2 text-muted-foreground hover:bg-secondary"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <p className="mt-2">
            <Link href="/leads?retorno=hoje" className="hover:underline">
              <strong className="metric-number text-4xl font-semibold">
                {dueToday.length}
              </strong>
              <span className="ml-2 text-xs text-muted-foreground">
                para hoje
              </span>
            </Link>
          </p>
          <div
            className="my-3 flex h-2.5 overflow-hidden rounded-full bg-secondary"
            role="img"
            aria-label={`${overdue.length} atrasados, ${dueToday.length} hoje, ${upcoming} futuros`}
          >
            {[
              { count: overdue.length, color: 'bg-destructive' },
              { count: dueToday.length, color: 'bg-primary' },
              { count: upcoming, color: 'bg-accent' },
            ].map((part, index) => (
              <span
                key={index}
                className={part.color}
                style={{
                  width: `${scheduled.length ? (part.count / scheduled.length) * 100 : 0}%`,
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <i className="size-1.5 rounded-full bg-destructive" />
              {overdue.length} atrasados
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-1.5 rounded-full bg-primary" />
              {dueToday.length} hoje
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-1.5 rounded-full bg-accent" />
              {upcoming} futuros
            </span>
          </div>
        </section>
        <Link
          href="/leads?status=novo&retorno=sem_retorno"
          className="dashboard-panel group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-2 text-xs font-medium">
              <Users aria-hidden="true" className="size-4" />
              Primeiro contato
            </span>
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </div>
          <p className="mt-3">
            <strong className="metric-number text-4xl font-semibold">
              {fresh.length}
            </strong>
          </p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground group-hover:text-primary">
            Novos contatos sem retorno agendado
          </p>
        </Link>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
        <div className="grid min-w-0 gap-5">
          <ReturnCalendar
            key={monthKey}
            year={year}
            month={month}
            events={events}
            today={today}
          />
          <AgendaTimeline
            overdue={overdue}
            today={dueToday}
            fresh={fresh}
            todayISO={today}
          />
        </div>
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-1">
          <FunnelCard leads={leads} />
          <OriginsCard leads={leads} />
        </div>
      </div>
    </>
  )
}
