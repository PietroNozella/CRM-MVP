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
    <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border xl:grid-cols-5">
      {cards.map(({ label, value, href }, index) => (
        <Link
          key={label}
          href={href}
          className={`group flex min-h-24 items-center justify-between gap-3 bg-card p-4 transition-colors hover:bg-secondary xl:block ${index === 0 ? 'col-span-2 xl:col-span-1' : ''}`}
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{label}</p>
          </div>
          <p className="metric-number text-3xl font-medium xl:mt-3 xl:text-4xl">{value}</p>
        </Link>
      ))}
    </div>
  )
}
