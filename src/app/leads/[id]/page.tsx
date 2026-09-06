import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotesTimeline } from '@/components/notes-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !lead) notFound()

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/leads">← Voltar</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{lead.nome}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">WhatsApp: </span>
            {lead.whatsapp}
          </p>
          {lead.email && (
            <p>
              <span className="text-muted-foreground">Email: </span>
              {lead.email}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Status: </span>
            {lead.status}
          </p>
          {lead.interesse && (
            <p>
              <span className="text-muted-foreground">Interesse: </span>
              {lead.interesse}
            </p>
          )}
        </CardContent>
      </Card>
      <div>
        <h2 className="text-lg font-semibold mb-3">Anotações</h2>
        <NotesTimeline leadId={lead.id} initialNotes={notes ?? []} />
      </div>
    </div>
  )
}
