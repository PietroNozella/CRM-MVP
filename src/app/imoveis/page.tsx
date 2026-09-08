import { createClient } from '@/lib/supabase/server'
import { ImoveisTable } from '@/components/imoveis-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'

export default async function ImoveisPage() {
  const supabase = await createClient()
  const { data: imoveis, error } = await supabase
    .from('imoveis')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <div>
      <PageHeader
        title="Imóveis"
        description="Organize as opções disponíveis e encontre rapidamente o imóvel certo para cada contato."
        actions={<Button asChild>
          <Link href="/imoveis/novo">
            <Plus aria-hidden="true" />
            Novo imóvel
          </Link>
        </Button>}
      />
      <ImoveisTable imoveis={imoveis ?? []} />
    </div>
  )
}
