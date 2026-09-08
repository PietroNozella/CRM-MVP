import Link from 'next/link'
import { ArrowUpRight, Network } from 'lucide-react'
import { LEAD_STATUSES } from '@/lib/pipeline'

export interface LeadMetric {
  status: string
  source: string | null
}

const STAGE_COLORS = [
  'hsl(var(--pipeline-new))',
  'hsl(var(--pipeline-active))',
  'hsl(var(--pipeline-negotiation))',
  'hsl(var(--pipeline-closed))',
]

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0
}

export function DashboardMetrics({ leads }: { leads: LeadMetric[] }) {
  return (
    <div className="mt-4 grid gap-5 xl:grid-cols-2">
      <FunnelCard leads={leads} />
      <OriginsCard leads={leads} />
    </div>
  )
}

export function FunnelCard({ leads }: { leads: LeadMetric[] }) {
  const total = leads.length
  const stages = LEAD_STATUSES.map((stage, index) => ({
    ...stage,
    count: leads.filter((lead) => lead.status === stage.value).length,
    color: STAGE_COLORS[index],
  }))
  const closed = stages.find((stage) => stage.value === 'fechado')?.count ?? 0
  let offset = 0

  return (
    <section className="dashboard-panel" aria-labelledby="funnel-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="funnel-title" className="panel-title">
          Seu funil
        </h2>
        <Link
          href="/funil"
          className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          Abrir funil <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="relative mx-auto my-5 size-40">
        <svg
          viewBox="0 0 160 160"
          className="size-full -rotate-90"
          role="img"
          aria-label={`${total} contatos no funil, ${closed} fechados (${pct(closed, total)}% do total)`}
        >
          <circle
            cx="80"
            cy="80"
            r="65"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="17"
          />
          {stages.map((stage) => {
            const share = total ? (stage.count / total) * 100 : 0
            const start = offset
            offset += share
            return (
              <circle
                key={stage.value}
                cx="80"
                cy="80"
                r="65"
                pathLength="100"
                fill="none"
                stroke={stage.color}
                strokeWidth="17"
                strokeDasharray={`${share} ${100 - share}`}
                strokeDashoffset={-start}
              />
            )
          })}
        </svg>
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          <strong className="metric-number text-4xl font-semibold">
            {total}
          </strong>
          <span className="mt-1 text-xs text-muted-foreground">contatos</span>
        </div>
      </div>
      <div className="space-y-4">
        {stages.map((stage) => (
          <Link
            key={stage.value}
            href={`/leads?status=${stage.value}`}
            className="group block rounded-md"
            aria-label={`${stage.label}: ${stage.count} contatos, ${pct(stage.count, total)}% do total`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="flex-1 font-medium group-hover:underline">
                {stage.label}
              </span>
              <strong className="text-sm tabular-nums">{stage.count}</strong>
              <span className="w-9 text-right tabular-nums text-muted-foreground">
                {pct(stage.count, total)}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-secondary"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${total ? (stage.count / total) * 100 : 0}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
        <strong className="font-semibold text-primary">
          {pct(closed, total)}% fechados
        </strong>{' '}
        · {closed} de {total} contatos da base
      </p>
    </section>
  )
}

export function OriginsCard({ leads }: { leads: LeadMetric[] }) {
  const bySource = new Map<string, number>()
  for (const lead of leads) {
    const name = lead.source?.trim() || 'Não informada'
    bySource.set(name, (bySource.get(name) ?? 0) + 1)
  }
  const all = Array.from(bySource.entries()).sort((a, b) => b[1] - a[1])
  const origins = all.slice(0, all.length > 5 ? 4 : 5)
  const remaining = all
    .slice(origins.length)
    .reduce((sum, [, count]) => sum + count, 0)
  if (remaining) origins.push(['Outras origens (agrupadas)', remaining])
  return (
    <section className="dashboard-panel" aria-labelledby="origins-title">
      <div className="mb-1 flex items-center justify-between">
        <h2 id="origins-title" className="panel-title">
          De onde vêm os contatos
        </h2>
        <Network aria-hidden="true" className="size-4 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">
        Participação na sua base de contatos
      </p>
      {origins.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          As origens aparecem ao cadastrar contatos.
        </p>
      ) : (
        <>
          <div
            className="my-6 flex h-4 gap-1 overflow-hidden rounded-full bg-secondary"
            aria-hidden="true"
          >
            {origins.map(([name, count], index) => (
              <span
                key={name}
                style={{
                  width: `${(count / leads.length) * 100}%`,
                  backgroundColor: [...STAGE_COLORS, 'hsl(var(--pipeline-neutral))'][index],
                }}
              />
            ))}
          </div>
          <ul className="space-y-4">
            {origins.map(([name, count], index) => (
              <li key={name} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: [...STAGE_COLORS, 'hsl(var(--pipeline-neutral))'][index],
                  }}
                />
                <span className="min-w-0 flex-1 break-words font-medium">
                  {name}
                </span>
                <strong className="tabular-nums">{count}</strong>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                  {pct(count, leads.length)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
