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
import { whatsappMessage, formatPhoneBR, whatsappLink } from '@/lib/site'
import { todayISO } from '@/lib/dates'

function whatsappPhoneUrl(whatsapp: string) {
  return whatsappLink(whatsapp) ?? undefined
}

function whatsappUrl(lead: Lead) {
  return whatsappLink(lead.whatsapp, whatsappMessage(lead.nome))
}

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function Dash() {
  return <span className="text-muted-foreground">—</span>
}

export function RetornoCell({ lead }: { lead: Lead }) {
  if (!lead.proximo_retorno)
    return <span className="text-muted-foreground">Sem retorno</span>
  const today = todayISO()
  const overdue = lead.proximo_retorno < today
  const isToday = lead.proximo_retorno === today
  return (
    <div>
      <Badge variant={overdue ? 'destructive' : isToday ? 'default' : 'secondary'}>
        {overdue ? 'Atrasado ' : isToday ? 'Hoje ' : ''}
        {formatDateBR(lead.proximo_retorno)}
      </Badge>
      {lead.nota_retorno && (
        <span className="block text-sm text-muted-foreground mt-1 break-words md:max-w-48">
          {lead.nota_retorno}
        </span>
      )}
    </div>
  )
}

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead className="hidden lg:table-cell">Email</TableHead>
          <TableHead>Etapa</TableHead>
          <TableHead className="hidden md:table-cell">Interesse</TableHead>
          <TableHead className="hidden lg:table-cell">Valor</TableHead>
          <TableHead className="hidden lg:table-cell">Origem</TableHead>
          <TableHead>Retorno</TableHead>
          <TableHead><span className="sr-only">Ações</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
              Nenhum contato encontrado. Limpe os filtros ou adicione um contato.
            </TableCell>
          </TableRow>
        )}
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
                {formatPhoneBR(lead.whatsapp)}
              </a>
            </TableCell>
            <TableCell className="hidden lg:table-cell">{lead.email ?? <Dash />}</TableCell>
            <TableCell>
              <StatusBadgeSelect leadId={lead.id} currentStatus={lead.status} leadName={lead.nome} />
            </TableCell>
            <TableCell className="hidden md:table-cell">{lead.interesse ?? <Dash />}</TableCell>
            <TableCell className="hidden lg:table-cell">
              {lead.valor_maximo != null ? (
                money.format(lead.valor_maximo)
              ) : (
                <Dash />
              )}
            </TableCell>
            <TableCell className="hidden lg:table-cell">{lead.source ?? <Dash />}</TableCell>
            <TableCell>
              <RetornoCell lead={lead} />
            </TableCell>
            <TableCell>
              {whatsappUrl(lead) ? <Button size="sm" variant="outline" asChild>
                <a
                  href={whatsappUrl(lead)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chamar ${lead.nome} no WhatsApp`}
                >
                  <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                  Chamar
                </a>
              </Button> : <Button asChild variant="outline"><Link href={`/leads/${lead.id}#dados-contato`}>Corrigir telefone</Link></Button>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
