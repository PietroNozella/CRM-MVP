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
      <p className="py-10 text-center text-sm text-muted-foreground">
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
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium hover:underline"
                >
                  {lead.nome}
                </Link>
                <StatusBadgeSelect
                  leadId={lead.id}
                  currentStatus={lead.status}
                />
              </div>
              <RetornoCell lead={lead} />
              <div className="flex gap-2">
                {href && (
                  <Button size="sm" variant="outline" asChild className="min-h-11 flex-1">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                      Chamar
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild className="min-h-11 flex-1">
                  <Link href={`/leads/${lead.id}`}>
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
