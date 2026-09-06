import { CsvImport } from '@/components/csv-import'

export default function ImportarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Importar Contatos</h1>
      <CsvImport />
    </div>
  )
}
