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
  const total = leads.length
  const fechados = leads.filter((l) => l.status === 'fechado').length

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
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Contatos fechados — {pct(fechados, total)} ({fechados}/{total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {LEAD_STATUSES.map((s) => {
            const count = leads.filter((l) => l.status === s.value).length
            return (
              <div key={s.value}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">
                    {count} · {pct(count, total)}
                  </span>
                </div>
                <div className="h-2 rounded bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: pct(count, total) }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Origens (top 5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {origins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <div className="space-y-2">
              {origins.map(([name, v]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <span className="text-muted-foreground ml-4 shrink-0">
                    {v.total} · {pct(v.fechados, v.total)} fech.
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
