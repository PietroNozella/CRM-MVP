import { ImovelForm } from '@/components/imovel-form'
import { PageHeader } from '@/components/page-header'

export default function NovoImovelPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Novo imóvel" description="Cadastre os dados essenciais para consultar esta opção durante os atendimentos." />
      <ImovelForm />
    </div>
  )
}
