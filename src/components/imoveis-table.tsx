'use client'

import { Imovel } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatPrice(preco: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco)
}

export function ImoveisTable({ imoveis }: { imoveis: Imovel[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Bairro</TableHead>
          <TableHead>Quartos</TableHead>
          <TableHead>Banheiros</TableHead>
          <TableHead>Vagas</TableHead>
          <TableHead>Área (m²)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {imoveis.map((imovel) => (
          <TableRow key={imovel.id}>
            <TableCell className="font-medium">{imovel.titulo}</TableCell>
            <TableCell>{formatPrice(imovel.preco)}</TableCell>
            <TableCell>{imovel.bairro}</TableCell>
            <TableCell>{imovel.quartos}</TableCell>
            <TableCell>{imovel.banheiros}</TableCell>
            <TableCell>{imovel.vagas}</TableCell>
            <TableCell>{imovel.area}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
