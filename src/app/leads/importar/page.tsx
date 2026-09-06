import { CsvImport } from '@/components/csv-import'

import { PageHeader } from '@/components/page-header'

export default function ImportarPage() {
  return (
    <div>
      <PageHeader index="05" title="Importar contatos" description="Traga sua base, confirme o mapeamento e continue de onde parou." />
      <CsvImport />
    </div>
  )
}
