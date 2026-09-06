import { LeadForm } from '@/components/lead-form'
import { PageHeader } from '@/components/page-header'

export default function NovoLeadPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader index="04" title="Novo contato" description="Registre o essencial agora. O contexto pode crescer a cada conversa." />
      <LeadForm />
    </div>
  )
}
