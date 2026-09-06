import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotesTimeline } from '@/components/notes-timeline'
import { LeadEditForm } from '@/components/lead-edit-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { whatsappMessage, whatsappLink, formatPhoneBR } from '@/lib/site'

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
    .maybeSingle()

  if (error) throw error
  if (!lead) notFound()

  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false })

  const whatsappHref = whatsappLink(lead.whatsapp, whatsappMessage(lead.nome))

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/leads">← Voltar</Link>
      </Button>
      <Card>
        <CardHeader>
          <h1 className="break-words text-2xl font-semibold">{lead.nome}</h1>
          <p className="text-sm text-muted-foreground">{formatPhoneBR(lead.whatsapp)}</p>
        </CardHeader>
        <CardContent>
          {whatsappHref ? (
            <Button asChild className="min-h-11 w-full sm:w-auto">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-100" />
                Chamar no WhatsApp
              </a>
            </Button>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">
              Corrija o WhatsApp em “Dados do contato” para chamar.
            </p>
          )}
        </CardContent>
      </Card>
      <div>
        <h2 className="text-lg font-semibold mb-3">Anotações</h2>
        {notesError ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar o histórico. Recarregue a página.
          </p>
        ) : (
          <NotesTimeline leadId={lead.id} initialNotes={notes ?? []} />
        )}
      </div>
      <Card id="dados-contato" className="scroll-mt-4">
        <CardHeader>
          <CardTitle className="text-base">Atendimento e dados do contato</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadEditForm lead={lead} />
        </CardContent>
      </Card>
    </div>
  )
}
