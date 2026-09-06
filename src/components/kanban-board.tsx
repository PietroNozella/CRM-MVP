'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LEAD_STATUSES } from '@/lib/pipeline'
import type { LeadStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type KanbanLead = {
  id: string
  nome: string
  status: LeadStatus
  interesse: string | null
}

type Board = Record<LeadStatus, KanbanLead[]>

function group(leads: KanbanLead[]): Board {
  const board = {} as Board
  for (const s of LEAD_STATUSES) board[s.value] = []
  for (const l of leads) {
    if (board[l.status]) board[l.status].push(l)
  }
  return board
}

export function KanbanBoard({ initialLeads }: { initialLeads: KanbanLead[] }) {
  const [board, setBoard] = useState<Board>(() => group(initialLeads))
  const [dragId, setDragId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState<LeadStatus>('novo')
  const [movedTo, setMovedTo] = useState<LeadStatus | null>(null)
  const [message, setMessage] = useState('')
  const headings = useRef<Partial<Record<LeadStatus, HTMLHeadingElement | null>>>({})

  useEffect(() => {
    if (!movedTo) return
    const visibleStage = window.matchMedia('(min-width: 768px)').matches ? movedTo : activeStage
    headings.current[visibleStage]?.focus()
    setMovedTo(null)
  }, [movedTo, activeStage])

  // Salva primeiro, atualiza o estado de forma imutavel depois.
  // Sem otimismo: evita divergencia tela/banco e dispensa rollback.
  async function moveTo(leadId: string, to: LeadStatus) {
    if (saving) return
    let lead: KanbanLead | undefined
    for (const s of LEAD_STATUSES) {
      const found = board[s.value].filter((l) => l.id === leadId)[0]
      if (found) {
        lead = found
        break
      }
    }
    if (!lead || lead.status === to) return

    setSaving(true)
    setError(null)
    setMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('leads')
        .update({ status: to })
        .eq('id', leadId)
        .select('id')
        .single()
      if (error) throw error

      setBoard((prev) => {
        const next = { ...prev } as Board
        for (const s of LEAD_STATUSES) {
          next[s.value] = prev[s.value].filter((l) => l.id !== leadId)
        }
        next[to] = [...next[to], { ...lead, status: to }]
        return next
      })
      setMessage(`${lead.nome}: etapa alterada para ${LEAD_STATUSES.find(s => s.value === to)?.label}.`)
      setMovedTo(to)
    } catch {
      setError('Não foi possível mudar a etapa. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="min-h-6 mb-2">
        <p role="status" className="text-sm text-muted-foreground">{saving ? 'Salvando etapa…' : message}</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="mb-4 md:hidden">
        <label htmlFor="etapa-visivel" className="mb-2 block text-sm font-medium">Ver etapa</label>
        <Select value={activeStage} onValueChange={value => setActiveStage(value as LeadStatus)} disabled={saving}>
          <SelectTrigger id="etapa-visivel"><SelectValue /></SelectTrigger>
          <SelectContent>{LEAD_STATUSES.map(stage => <SelectItem key={stage.value} value={stage.value}>{stage.label} ({board[stage.value].length})</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="md:flex gap-4 md:overflow-x-auto pb-4">
        {LEAD_STATUSES.map((s) => (
          <div
            key={s.value}
            className={`${s.value === activeStage ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 rounded-lg bg-muted/50 p-3`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragId) moveTo(dragId, s.value)
              setDragId(null)
            }}
          >
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 ref={node => { headings.current[s.value] = node }} tabIndex={-1} className="rounded text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{s.label}</h2>
              <span className="text-xs text-muted-foreground">
                {board[s.value].length}
              </span>
            </div>
            <div className="space-y-2 min-h-10">
              {board[s.value].map((lead) => (
                <Card
                  key={lead.id}
                  draggable={!saving}
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`md:cursor-grab md:active:cursor-grabbing ${
                    dragId === lead.id ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="pt-3 pb-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="block break-words text-sm font-medium hover:underline"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      {lead.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lead.interesse ?? 'Sem interesse informado'}
                    </p>
                    <Select
                      value={lead.status}
                      disabled={saving}
                      onValueChange={(v) => moveTo(lead.id, v as LeadStatus)}
                    >
                      <SelectTrigger
                        aria-label={`Etapa de ${lead.nome}`}
                        className="mt-3 min-h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((stage) => (
                          <SelectItem
                            key={stage.value}
                            value={stage.value}
                            className="min-h-11"
                          >
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
              {board[s.value].length === 0 && (
                <p className="text-xs text-muted-foreground px-1">
                  Nenhum contato nesta etapa
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
