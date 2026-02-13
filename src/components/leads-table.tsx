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
import { MessageCircle } from 'lucide-react'
import { StatusBadgeSelect } from '@/components/status-badge-select'

function formatPhone(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return whatsapp
}

function whatsappUrl(lead: Lead) {
  const numero = lead.whatsapp.replace(/\D/g, '')
  const msg = encodeURIComponent(
    `Olá ${lead.nome}, vi seu interesse em um imóvel e gostaria de conversar!`
  )
  return `https://wa.me/${numero}?text=${msg}`
}

function EmptyCell() {
  return (
    <span className="text-muted-foreground">Não informado</span>
  )
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
            <TableCell>{formatPhone(lead.whatsapp)}</TableCell>
            <TableCell>{lead.email ?? <EmptyCell />}</TableCell>
            <TableCell>
              <StatusBadgeSelect leadId={lead.id} currentStatus={lead.status} />
            </TableCell>
            <TableCell>{lead.interesse ?? <EmptyCell />}</TableCell>
            <TableCell>
              {lead.valor_maximo ? (
                `R$ ${lead.valor_maximo}`
              ) : (
                <EmptyCell />
              )}
            </TableCell>
            <TableCell>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={whatsappUrl(lead)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                  Chamar
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
