import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotesTimeline } from '@/components/notes-timeline'
import { LeadEditForm } from '@/components/lead-edit-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { whatsappMessage, whatsappLink, formatPhoneBR } from '@/lib/site'
import { PageHeader } from '@/components/page-header'

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
    <div>
      <PageHeader
        title={lead.nome}
        description={formatPhoneBR(lead.whatsapp)}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link href="/leads">← Contatos</Link></Button>
            {whatsappHref && <Button asChild><a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chamar</a></Button>}
          </div>
        }
      />
      {!whatsappHref && <p role="status" className="mb-6 border-l-2 border-l-accent pl-3 text-sm text-muted-foreground">Corrija o WhatsApp nos dados do contato para iniciar a conversa.</p>}
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
        <section>
          <p className="section-index">01 / HISTÓRICO</p>
          <h2 className="mb-5 mt-2 text-xl font-semibold">Anotações</h2>
        {notesError ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar o histórico. Recarregue a página.
          </p>
        ) : (
          <NotesTimeline leadId={lead.id} initialNotes={notes ?? []} />
        )}
        </section>
        <Card id="dados-contato" className="scroll-mt-4 border-t-2 border-t-primary">
        <CardHeader className="border-b">
          <p className="section-index">02 / CADASTRO</p>
          <CardTitle className="mt-2 text-lg">Atendimento e dados do contato</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 md:pt-6">
          <LeadEditForm lead={lead} />
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
