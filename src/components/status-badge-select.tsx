'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LeadStatus } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

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

export function StatusBadgeSelect({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: LeadStatus
}) {
  const router = useRouter()

  async function onStatusChange(value: LeadStatus) {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ status: value })
      .eq('id', leadId)
    if (!error) router.refresh()
  }

  return (
    <Select value={currentStatus} onValueChange={onStatusChange}>
      <SelectTrigger
        className={cn(
          'h-auto min-w-0 border-0 p-1.5 focus:ring-0 focus:ring-offset-0',
          STATUS_BADGE_CLASSES[currentStatus]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
