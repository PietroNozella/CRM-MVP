import type { Imovel } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, MapPin } from 'lucide-react'

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

function PropertyDetails({ imovel }: { imovel: Imovel }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      <div><dt className="text-xs text-muted-foreground">Quartos</dt><dd className="mt-1 font-semibold tabular-nums">{imovel.quartos}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Banheiros</dt><dd className="mt-1 font-semibold tabular-nums">{imovel.banheiros}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Vagas</dt><dd className="mt-1 font-semibold tabular-nums">{imovel.vagas}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Área</dt><dd className="mt-1 font-semibold tabular-nums">{imovel.area} m²</dd></div>
    </dl>
  )
}

export function ImoveisTable({ imoveis }: { imoveis: Imovel[] }) {
  if (imoveis.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card px-5 py-14 text-center">
        <Building2 aria-hidden="true" className="mx-auto size-8 text-muted-foreground/60" />
        <h2 className="mt-4 text-base font-semibold">Nenhum imóvel cadastrado</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Cadastre a primeira opção para começar a organizar o portfólio.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2 xl:hidden">
        {imoveis.map(imovel => (
          <Card key={imovel.id} className="shadow-sm shadow-primary/[0.02]">
            <CardContent className="space-y-5 pt-5 md:pt-6">
              <div>
                <h2 className="break-words text-lg font-semibold tracking-[-0.02em]">{imovel.titulo}</h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="size-4" />{imovel.bairro}</p>
                <p className="metric-number mt-4 text-2xl font-semibold">{money.format(imovel.preco)}</p>
              </div>
              <div className="border-t pt-4"><PropertyDetails imovel={imovel} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border bg-card xl:block">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Quartos</TableHead>
              <TableHead>Banheiros</TableHead>
              <TableHead>Vagas</TableHead>
              <TableHead>Área</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imoveis.map(imovel => (
              <TableRow key={imovel.id}>
                <TableCell className="max-w-80 break-words py-4 font-semibold">{imovel.titulo}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">{money.format(imovel.preco)}</TableCell>
                <TableCell>{imovel.bairro}</TableCell>
                <TableCell className="tabular-nums">{imovel.quartos}</TableCell>
                <TableCell className="tabular-nums">{imovel.banheiros}</TableCell>
                <TableCell className="tabular-nums">{imovel.vagas}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{imovel.area} m²</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
