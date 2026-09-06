import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LEAD_STATUSES } from '@/lib/pipeline'

export interface LeadMetric {
  status: string
  source: string | null
}

function pct(part: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

export function DashboardMetrics({ leads }: { leads: LeadMetric[] }) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <FunnelCard leads={leads} />
      <OriginsCard leads={leads} />
    </div>
  )
}

export function FunnelCard({ leads }: { leads: LeadMetric[] }) {
  const total = leads.length
  const fechados = leads.filter((l) => l.status === 'fechado').length

  return (
    <Card className="border-t-2 border-t-primary">
      <CardHeader className="border-b">
        <p className="section-index">01 / CONVERSÃO</p>
        <CardTitle className="mt-2 text-sm font-semibold">
          Contatos fechados — {pct(fechados, total)} ({fechados}/{total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-5 md:pt-6">
        {LEAD_STATUSES.map((s) => {
          const count = leads.filter((l) => l.status === s.value).length
          return (
            <Link
              key={s.value}
              href={`/leads?status=${s.value}`}
              className="block rounded-md p-1 -m-1 hover:bg-muted"
            >
              <div className="flex justify-between text-sm mb-1">
                <span>{s.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {count} · {pct(count, total)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: pct(count, total) }}
                />
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function OriginsCard({ leads }: { leads: LeadMetric[] }) {
  const bySource: Record<string, { total: number; fechados: number }> = {}
  for (const l of leads) {
    const key = l.source?.trim() || 'Não informada'
    const cur = bySource[key] ?? { total: 0, fechados: 0 }
    cur.total++
    if (l.status === 'fechado') cur.fechados++
    bySource[key] = cur
  }
  const origins = Object.entries(bySource)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  return (
    <Card className="border-t-2 border-t-accent">
        <CardHeader className="border-b">
          <p className="section-index">02 / AQUISIÇÃO</p>
          <CardTitle className="mt-2 text-sm font-semibold">
            De onde vêm os contatos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 md:pt-6">
          {origins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <div className="space-y-2">
              {origins.map(([name, v]) => (
                <div key={name} className="flex justify-between border-b py-2 text-sm last:border-b-0">
                  <span className="truncate">{name}</span>
                  <span className="ml-4 shrink-0 font-mono text-xs text-muted-foreground">
                    {v.total} · {pct(v.fechados, v.total)} fech.
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
  )
}
