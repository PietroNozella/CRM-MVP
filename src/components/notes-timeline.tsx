'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APP_TIME_ZONE } from '@/lib/dates'
import type { Note } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TIME_ZONE,
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso))
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
      <form onSubmit={onSubmit} className="space-y-2">
        <label htmlFor="nova-nota" className="text-sm font-medium">
          O que foi combinado?
        </label>
        <textarea
          id="nova-nota"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex: Cliente pediu retorno na segunda de manhã"
          className="w-full rounded-md border bg-background p-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
        <Button type="submit" disabled={saving || !texto.trim()} className="min-h-11">
          {saving ? 'Salvando anotação…' : 'Salvar anotação'}
        </Button>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {initialNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma anotação ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {initialNotes.map((n) => (
            <Card key={n.id}>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap break-words">{n.texto}</p>
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
