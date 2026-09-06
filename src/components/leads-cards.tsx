'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, StickyNote } from 'lucide-react'
import type { Lead } from '@/types'
import { StatusBadgeSelect } from '@/components/status-badge-select'
import { RetornoCell } from '@/components/leads-table'
import { whatsappMessage, whatsappLink } from '@/lib/site'

export function LeadsCards({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground md:hidden">
        Nenhum contato encontrado. Limpe os filtros ou adicione um contato.
      </p>
    )
  }
  return (
    <div className="space-y-3 md:hidden">
      {leads.map((lead) => {
        const href = whatsappLink(lead.whatsapp, whatsappMessage(lead.nome))
        return (
          <Card key={lead.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <Link
                  href={`/leads/${lead.id}`}
                  className="block break-words font-medium hover:underline"
                >
                  {lead.nome}
                </Link>
                <StatusBadgeSelect
                  leadId={lead.id}
                  currentStatus={lead.status}
                  leadName={lead.nome}
                />
              </div>
              <RetornoCell lead={lead} />
              <div className="flex gap-2">
                {href ? (
                  <Button size="sm" asChild className="min-h-11 flex-1">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Chamar ${lead.nome} no WhatsApp`}
                    >
                      <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                      Chamar
                    </a>
                  </Button>
                ) : <Button asChild variant="outline" className="min-h-11 flex-1"><Link href={`/leads/${lead.id}#dados-contato`}>Corrigir telefone</Link></Button>}
                <Button size="sm" variant="outline" asChild className="min-h-11 flex-1">
                  <Link href={`/leads/${lead.id}#nova-nota`}>
                    <StickyNote className="h-4 w-4 mr-1" />
                    Anotar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
