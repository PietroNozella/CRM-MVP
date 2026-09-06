'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LEAD_STATUSES } from '@/lib/pipeline'
import type { LeadStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

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
    } catch {
      setError('Não foi possível mudar a etapa. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="min-h-6 mb-2">
        <p role="status" className="text-xs text-muted-foreground">{saving ? 'Salvando etapa…' : ''}</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((s) => (
          <div
            key={s.value}
            className="w-64 shrink-0 rounded-lg bg-muted/50 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragId) moveTo(dragId, s.value)
              setDragId(null)
            }}
          >
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-sm font-semibold">{s.label}</h2>
              <span className="text-xs text-muted-foreground">
                {board[s.value].length}
              </span>
            </div>
            <div className="space-y-2 min-h-10">
              {board[s.value].map((lead) => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`cursor-grab active:cursor-grabbing ${
                    dragId === lead.id ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="pt-3 pb-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-sm font-medium hover:underline"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      {lead.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lead.interesse ?? 'Sem interesse informado'}
                    </p>
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
