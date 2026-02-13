'use client'

import { Lead, LeadStatus } from '@/types'
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

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  visita: 'Visita',
  fechado: 'Fechado',
}

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  novo: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  em_atendimento:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  visita:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  fechado:
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
}

function formatStatus(status: LeadStatus) {
  return STATUS_LABELS[status] ?? status
}

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
              <Badge
                variant="outline"
                className={STATUS_BADGE_CLASSES[lead.status]}
              >
                {formatStatus(lead.status)}
              </Badge>
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
