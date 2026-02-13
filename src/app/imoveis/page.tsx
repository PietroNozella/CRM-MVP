import { createClient } from '@/lib/supabase/server'
import { ImoveisTable } from '@/components/imoveis-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function ImoveisPage() {
  const supabase = await createClient()
  const { data: imoveis, error } = await supabase
    .from('imoveis')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <Button asChild>
          <Link href="/imoveis/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Imóvel
          </Link>
        </Button>
      </div>
      <ImoveisTable imoveis={imoveis ?? []} />
    </div>
  )
}
