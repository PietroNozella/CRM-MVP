// Fuso unico por instalacao (padrao Brasil). Filtros e badges usam as
// mesmas funcoes para nao divergir "hoje" x "atrasado" a noite.
export const APP_TIME_ZONE =
  process.env.NEXT_PUBLIC_TIME_ZONE ?? 'America/Sao_Paulo'

function partsInTZ(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.filter((p) => p.type === type)[0]?.value ?? ''
  return { y: get('year'), m: get('month'), d: get('day') }
}

// Hoje no fuso do app, formato YYYY-MM-DD (compara com DATE do banco).
export function todayISO() {
  const { y, m, d } = partsInTZ(new Date())
  return `${y}-${m}-${d}`
}

// Inicio do dia (no fuso) em UTC, para filtrar created_at (timestamptz).
// Calcula o offset dinamicamente (nao assume -03:00 fixo).
export function dayStartUTC(dateISO: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  let guess = Date.UTC(y, m - 1, d, 12, 0, 0)
  for (let i = 0; i < 2; i++) {
    guess = Date.UTC(y, m - 1, d, 0, 0, 0) - tzOffsetMs(new Date(guess))
  }
  return new Date(guess).toISOString()
}

// Exclusivo: inicio do dia seguinte em UTC.
export function nextDayStartUTC(dateISO: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0))
  return dayStartUTC(
    `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
  )
}

function tzOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) =>
    parts.filter((p) => p.type === type)[0]?.value ?? '0'
  const asUTC = Date.UTC(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')) % 24,
    Number(get('minute')),
    Number(get('second'))
  )
  return asUTC - date.getTime()
}
