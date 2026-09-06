'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Note } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${m}/${d.getFullYear()} ${h}:${min}`
}

export function NotesTimeline({
  leadId,
  initialNotes,
}: {
  leadId: string
  initialNotes: Note[]
}) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('notes')
      .insert({ lead_id: leadId, texto: texto.trim() })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setTexto('')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Ex: Cliente pediu retorno na segunda de manhã"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button type="submit" disabled={saving || !texto.trim()}>
          Anotar
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {initialNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma anotação ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {initialNotes.map((n) => (
            <Card key={n.id}>
              <CardContent className="pt-4">
                <p className="text-sm">{n.texto}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(n.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
