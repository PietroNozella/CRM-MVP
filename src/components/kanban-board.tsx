'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LEAD_STATUSES } from '@/lib/pipeline'
import type { Lead, LeadStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

type Board = Record<LeadStatus, Lead[]>

function group(leads: Lead[]): Board {
  const board = {} as Board
  for (const s of LEAD_STATUSES) board[s.value] = []
  for (const l of leads) {
    if (board[l.status]) board[l.status].push(l)
  }
  return board
}

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [board, setBoard] = useState<Board>(() => group(initialLeads))
  const [dragId, setDragId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function moveTo(leadId: string, to: LeadStatus) {
    let moved: Lead | undefined
    setBoard((prev) => {
      const next = { ...prev } as Board
      for (const s of LEAD_STATUSES) {
        const idx = next[s.value].findIndex((l) => l.id === leadId)
        if (idx >= 0) {
          const [lead] = next[s.value].splice(idx, 1)
          if (s.value === to) {
            next[s.value].splice(idx, 0, lead)
          } else {
            moved = { ...lead, status: to }
            next[to] = [...next[to], moved]
          }
          break
        }
      }
      return next
    })
    if (!moved) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ status: to })
      .eq('id', leadId)
    setSaving(false)
    if (error) {
      // reverte em caso de falha
      setBoard(group(initialLeads))
    }
  }

  return (
    <div>
      {saving && (
        <p className="text-xs text-muted-foreground mb-2">Salvando...</p>
      )}
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
                  Arraste cards para cá
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
