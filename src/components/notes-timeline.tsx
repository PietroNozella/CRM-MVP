'use client'

import { useRef, useState } from 'react'
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
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim() || saving) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const { error } = await createClient().from('notes')
        .insert({ lead_id: leadId, texto: texto.trim() })
      if (error) throw error
      setTexto('')
      setSaved(true)
      router.refresh()
    } catch {
      setError('Não foi possível salvar a anotação. Seu texto foi mantido; tente novamente.')
    } finally {
      setSaving(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-t-2 border-t-accent bg-card p-4 md:p-5">
        <label htmlFor="nova-nota" className="text-sm font-medium">
          O que foi combinado?
        </label>
        <textarea
          id="nova-nota"
          ref={inputRef}
          disabled={saving}
          maxLength={5000}
          rows={3}
          value={texto}
          onChange={(e) => { setTexto(e.target.value); setSaved(false) }}
          placeholder="Ex: voltar segunda de manhã com o orçamento"
          className="w-full scroll-mt-4 rounded-md border border-input bg-background p-3 text-base focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <Button type="submit" disabled={!texto.trim()} loading={saving} loadingLabel="Salvando anotação…" className="min-h-11">
          Salvar anotação
        </Button>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p role="status" className="text-sm text-muted-foreground">{saved ? 'Anotação salva.' : ''}</p>
      {initialNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma anotação. Registre o que foi combinado.
        </p>
      ) : (
        <div className="relative space-y-3 pl-5 before:absolute before:bottom-4 before:left-1.5 before:top-4 before:w-px before:bg-border">
          {initialNotes.map((n) => (
            <Card key={n.id} className="relative before:absolute before:-left-[1.14rem] before:top-5 before:h-2 before:w-2 before:rotate-45 before:bg-primary">
              <CardContent className="pt-4 md:pt-4">
                <p className="text-sm whitespace-pre-wrap break-words">{n.texto}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
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
