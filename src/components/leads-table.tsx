'use client'

import { Lead } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'

function whatsappUrl(lead: Lead) {
  const numero = lead.whatsapp.replace(/\D/g, '')
  const msg = encodeURIComponent(
    `Olá ${lead.nome}, vi seu interesse em um imóvel e gostaria de conversar!`
  )
  return `https://wa.me/${numero}?text=${msg}`
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Interesse</TableHead>
          <TableHead>Valor Máx.</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>{lead.nome}</TableCell>
            <TableCell>{lead.whatsapp}</TableCell>
            <TableCell>{lead.email ?? '-'}</TableCell>
            <TableCell>
              <Badge variant="outline">{lead.status}</Badge>
            </TableCell>
            <TableCell>{lead.interesse ?? '-'}</TableCell>
            <TableCell>
              {lead.valor_maximo ? `R$ ${lead.valor_maximo}` : '-'}
            </TableCell>
            <TableCell>
              <Button size="sm" asChild>
                <a
                  href={whatsappUrl(lead)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> Abrir WhatsApp
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
