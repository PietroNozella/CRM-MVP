'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEAD_STATUSES } from '@/lib/pipeline'

interface LeadsFiltersProps {
  initialQ?: string
  initialStatus?: string
  initialDataInicio?: string
  initialDataFim?: string
  initialRetorno?: string
}

export function LeadsFilters({ initialQ = '', initialStatus = 'todos', initialDataInicio = '', initialDataFim = '', initialRetorno = 'todos' }: LeadsFiltersProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus)
  const [dataInicio, setDataInicio] = useState(initialDataInicio)
  const [dataFim, setDataFim] = useState(initialDataFim)
  const [retorno, setRetorno] = useState(initialRetorno)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(Boolean(initialDataInicio || initialDataFim || initialStatus !== 'todos' || ['agendados', 'sem_retorno'].includes(initialRetorno)))
  const activeCount = [initialStatus !== 'todos', Boolean(initialDataInicio), Boolean(initialDataFim), initialRetorno !== 'todos'].filter(Boolean).length

  function applyFilters(nextRetorno = retorno) {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setError('A data final precisa ser igual ou posterior à inicial.')
      setExpanded(true)
      return
    }
    setError('')
    setRetorno(nextRetorno)
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (status !== 'todos') params.set('status', status)
    if (dataInicio) params.set('data_inicio', dataInicio)
    if (dataFim) params.set('data_fim', dataFim)
    if (nextRetorno !== 'todos') params.set('retorno', nextRetorno)
    startTransition(() => router.push('/leads?' + params))
  }

  return (
    <form onSubmit={event => { event.preventDefault(); applyFilters() }} className="mb-6 space-y-3" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-3">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="busca-contatos" className="mb-2 block text-sm font-medium">Buscar contato</label>
            <Input id="busca-contatos" type="search" placeholder="Nome ou WhatsApp" maxLength={100} value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Button type="submit">{pending ? 'Buscando…' : 'Buscar'}</Button>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por retorno">
          {[['todos', 'Todos'], ['hoje', 'Hoje'], ['atrasados', 'Atrasados']].map(([value, label]) => (
            <Button key={value} type="button" variant={initialRetorno === value ? 'secondary' : 'outline'} aria-pressed={initialRetorno === value} onClick={() => applyFilters(value)}>{label}</Button>
          ))}
          <Button type="button" variant="ghost" aria-expanded={expanded} aria-controls="filtros-avancados" onClick={() => setExpanded(!expanded)}>
            Mais filtros{activeCount > 0 ? ' (' + activeCount + ')' : ''}
          </Button>
        </div>
        <div id="filtros-avancados" hidden={!expanded}>
          <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="filtro-etapa" className="mb-2 block text-sm font-medium">Etapa</label>
              <Select value={status} onValueChange={setStatus} disabled={pending}>
                <SelectTrigger id="filtro-etapa"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="todos">Todas</SelectItem>{LEAD_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="filtro-retorno" className="mb-2 block text-sm font-medium">Retorno</label>
              <Select value={retorno} onValueChange={setRetorno} disabled={pending}>
                <SelectTrigger id="filtro-retorno"><SelectValue /></SelectTrigger>
                <SelectContent>{[['todos', 'Todos'], ['hoje', 'Hoje'], ['atrasados', 'Atrasados'], ['agendados', 'Agendados'], ['sem_retorno', 'Sem retorno']].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label htmlFor="filtro-data-inicio" className="mb-2 block text-sm font-medium">Cadastro de</label><Input id="filtro-data-inicio" type="date" value={dataInicio} max={dataFim || undefined} onChange={e => setDataInicio(e.target.value)} /></div>
            <div><label htmlFor="filtro-data-fim" className="mb-2 block text-sm font-medium">Cadastro até</label><Input id="filtro-data-fim" type="date" value={dataFim} min={dataInicio || undefined} onChange={e => setDataFim(e.target.value)} /></div>
            <Button type="submit" className="sm:col-span-2 xl:col-span-4">Aplicar filtros</Button>
          </div>
        </div>
        {(activeCount > 0 || initialQ) && <Button type="button" variant="link" className="px-0" onClick={() => {
          setQ(''); setStatus('todos'); setRetorno('todos'); setDataInicio(''); setDataFim(''); setError('')
          startTransition(() => router.push('/leads'))
        }}>Limpar filtros</Button>}
      </fieldset>
      <p role="status" className="sr-only">{pending ? 'Atualizando contatos…' : ''}</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
