import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  total: number
  novo: number
  em_atendimento: number
  visita: number
  fechado: number
}

export function DashboardCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: 'Total de Leads', value: stats.total, href: '/leads' },
    { label: 'Novos', value: stats.novo, href: '/leads?status=novo' },
    {
      label: 'Em Atendimento',
      value: stats.em_atendimento,
      href: '/leads?status=em_atendimento',
    },
    { label: 'Visita', value: stats.visita, href: '/leads?status=visita' },
    { label: 'Fechados', value: stats.fechado, href: '/leads?status=fechado' },
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
