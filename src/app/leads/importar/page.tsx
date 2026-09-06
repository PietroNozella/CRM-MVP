import { CsvImport } from '@/components/csv-import'

import { PageHeader } from '@/components/page-header'

export default function ImportarPage() {
  return (
    <div>
      <PageHeader title="Importar contatos" description="Sua planilha vira base de atendimento em minutos." />
      <CsvImport />
    </div>
  )
}
