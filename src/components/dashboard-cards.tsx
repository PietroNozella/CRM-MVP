import Link from 'next/link'
import { LEAD_STATUSES } from '@/lib/pipeline'

interface DashboardStats {
  total: number
  byStatus: Record<string, number>
}

export function DashboardCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: 'Total de Contatos', value: stats.total, href: '/leads' },
    ...LEAD_STATUSES.map((s) => ({
      label: s.label,
      value: stats.byStatus[s.value] ?? 0,
      href: `/leads?status=${s.value}`,
    })),
  ]

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card md:grid md:grid-cols-5">
      {cards.map(({ label, value, href }, index) => (
        <Link
          key={label}
          href={href}
          className="group flex min-h-28 items-end justify-between gap-4 border-b border-border p-4 transition-colors hover:bg-secondary/60 md:block md:border-b-0 md:border-r md:p-5 md:last:border-r-0"
        >
          <div>
            <p className="section-index">{String(index + 1).padStart(2, '0')}</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground">{label}</p>
          </div>
          <p className="metric-number text-3xl font-medium md:mt-5 md:text-4xl">{value}</p>
        </Link>
      ))}
    </div>
  )
}
