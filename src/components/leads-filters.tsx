'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LeadsFiltersProps {
  initialQ?: string
  initialStatus?: string
  initialDataInicio?: string
  initialDataFim?: string
}

export function LeadsFilters({
  initialQ = '',
  initialStatus = 'todos',
  initialDataInicio = '',
  initialDataFim = '',
}: LeadsFiltersProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus)
  const [dataInicio, setDataInicio] = useState(initialDataInicio)
  const [dataFim, setDataFim] = useState(initialDataFim)

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status && status !== 'todos') params.set('status', status)
    if (dataInicio) params.set('data_inicio', dataInicio)
    if (dataFim) params.set('data_fim', dataFim)
    router.push(`/leads?${params.toString()}`)
  }, [q, status, dataInicio, dataFim, router])

  const clearFilters = useCallback(() => {
    setQ('')
    setStatus('todos')
    setDataInicio('')
    setDataFim('')
    router.push('/leads')
  }, [router])

  return (
    <div className="flex flex-wrap items-end gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">Buscar</label>
        <Input
          placeholder="Nome ou WhatsApp"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>
      <div className="w-[180px]">
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
            <SelectItem value="visita">Visita</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-[165px] relative">
        <label className="text-sm font-medium mb-2 block">Data início</label>
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="relative pr-10 w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>
      <div className="w-[165px]">
        <label className="text-sm font-medium mb-2 block">Data fim</label>
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="relative pr-10 w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={applyFilters}>Filtrar</Button>
        <Button variant="outline" onClick={clearFilters}>
          Limpar
        </Button>
      </div>
    </div>
  )
}
