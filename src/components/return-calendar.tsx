import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { todayISO } from '@/lib/dates'

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function monthKey(y: number, m: number) {
  return `${y}-${String(m).padStart(2, '0')}`
}

function shiftMonth(y: number, m: number, delta: number) {
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 }
}

const monthLabel = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function ReturnCalendar({
  year,
  month,
  counts,
}: {
  year: number
  month: number
  counts: Record<string, number>
}) {
  const today = todayISO()
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const cells: (string | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${monthKey(year, month)}-${String(d).padStart(2, '0')}`)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {monthLabel.format(new Date(Date.UTC(year, month - 1, 1)))}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" asChild aria-label="Mês anterior">
              <Link href={`/?mes=${monthKey(prev.y, prev.m)}`}>←</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild aria-label="Mês seguinte">
              <Link href={`/?mes=${monthKey(next.y, next.m)}`}>→</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEK.map((w, i) => (
            <span key={i} className="text-xs text-muted-foreground py-1">
              {w}
            </span>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <span key={`b${i}`} />
            const count = counts[iso] ?? 0
            const isToday = iso === today
            const overdue = iso < today && count > 0
            const inner = (
              <>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    isToday
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : overdue
                        ? 'text-destructive font-semibold'
                        : ''
                  }`}
                >
                  {Number(iso.slice(8))}
                </span>
                <span className="flex h-1.5 justify-center gap-0.5 mt-0.5">
                  {count > 0 && (
                    <span
                      className={`h-1.5 rounded-full ${overdue ? 'bg-destructive' : 'bg-accent'}`}
                      style={{ width: `${Math.min(24, 6 + count * 4)}px` }}
                    />
                  )}
                </span>
              </>
            )
            return count > 0 ? (
              <Link
                key={iso}
                href={`/leads?retorno_dia=${iso}`}
                className="rounded-md py-1 hover:bg-muted"
                aria-label={`${count} retorno${count === 1 ? '' : 's'} em ${iso.split('-').reverse().join('/')}`}
              >
                {inner}
              </Link>
            ) : (
              <span key={iso} className="py-1">
                {inner}
              </span>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
