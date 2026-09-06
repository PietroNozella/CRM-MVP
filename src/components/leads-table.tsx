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
import Link from 'next/link'
import { StatusBadgeSelect } from '@/components/status-badge-select'
import { whatsappMessage } from '@/lib/site'

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

function whatsappPhoneUrl(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, '')
  const numero = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${numero}`
}

function whatsappUrl(lead: Lead) {
  const numero = lead.whatsapp.replace(/\D/g, '')
  const fullNumero = numero.startsWith('55') ? numero : `55${numero}`
  const msg = encodeURIComponent(whatsappMessage(lead.nome))
  return `https://wa.me/${fullNumero}?text=${msg}`
}

function EmptyCell() {
  return (
    <span className="text-muted-foreground">Não informado</span>
  )
}

function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function RetornoCell({ lead }: { lead: Lead }) {
  if (!lead.proximo_retorno) return <EmptyCell />
  const today = todayISO()
  const overdue = lead.proximo_retorno < today
  const isToday = lead.proximo_retorno === today
  return (
    <span title={lead.nota_retorno ?? undefined}>
      <Badge variant={overdue ? 'destructive' : isToday ? 'default' : 'secondary'}>
        {overdue ? 'Atrasado ' : isToday ? 'Hoje ' : ''}
        {formatDateBR(lead.proximo_retorno)}
      </Badge>
    </span>
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
          <TableHead>Valor</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Retorno</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>
              <Link
                href={`/leads/${lead.id}`}
                className="text-primary hover:underline font-medium"
              >
                {lead.nome}
              </Link>
            </TableCell>
            <TableCell>
              <a
                href={whatsappPhoneUrl(lead.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {formatPhone(lead.whatsapp)}
              </a>
            </TableCell>
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
            <TableCell>{lead.source ?? <EmptyCell />}</TableCell>
            <TableCell>
              <RetornoCell lead={lead} />
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
