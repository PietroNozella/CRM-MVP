import { LeadForm } from '@/components/lead-form'
import { PageHeader } from '@/components/page-header'

export default function NovoLeadPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Novo contato" description="Nome, WhatsApp e quando retornar. O resto a conversa resolve." />
      <LeadForm />
    </div>
  )
}
