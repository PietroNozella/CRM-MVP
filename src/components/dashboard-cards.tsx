import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ label, value, href }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <Button variant="link" className="h-auto p-0 mt-2" asChild>
              <Link href={href}>Ver todos</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
