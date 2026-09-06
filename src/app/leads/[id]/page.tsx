import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotesTimeline } from '@/components/notes-timeline'
import { LeadEditForm } from '@/components/lead-edit-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { whatsappMessage, whatsappLink } from '@/lib/site'

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
        <CardContent>
          <Button size="sm" variant="outline" asChild>
            <a
              href={
                whatsappLink(lead.whatsapp, whatsappMessage(lead.nome)) ?? '#'
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
              Chamar no WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editar contato</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadEditForm lead={lead} />
        </CardContent>
      </Card>
      <div>
        <h2 className="text-lg font-semibold mb-3">Anotações</h2>
        <NotesTimeline leadId={lead.id} initialNotes={notes ?? []} />
      </div>
    </div>
  )
}
