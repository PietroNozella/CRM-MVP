'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadStatus } from '@/types'
import { LEAD_STATUSES } from '@/lib/pipeline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  novo: 'border-[#A7C7B6] bg-[#E1EEE6] text-[#244C3D]',
  em_atendimento:
    'border-[#ADC7D8] bg-[#E3EEF4] text-[#274E69]',
  em_negociacao:
    'border-[#DAB98B] bg-[#F3E8D3] text-[#7A4A12]',
  fechado:
    'border-[#CBC8BE] bg-[#EAE6DC] text-[#555C57]',
}

export function StatusBadgeSelect({
  leadId,
  currentStatus,
  leadName,
}: {
  leadId: string
  currentStatus: LeadStatus
  leadName?: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function onStatusChange(value: LeadStatus) {
    if (saving || value === currentStatus) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const { error } = await createClient().from('leads')
        .update({ status: value }).eq('id', leadId).select('id').single()
      if (error) throw error
      setSaved(true)
      router.refresh()
    } catch {
      setError('Não foi possível mudar a etapa. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0">
    <Select value={currentStatus} onValueChange={onStatusChange} disabled={saving}>
      <SelectTrigger
        aria-label={leadName ? `Etapa de ${leadName}` : 'Etapa do contato'}
        className={cn(
          'min-h-11 min-w-0 px-3 font-mono text-[0.68rem] uppercase tracking-[0.06em] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          STATUS_BADGE_CLASSES[currentStatus]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <span role="status" className="sr-only">{saving ? 'Salvando etapa…' : saved ? 'Etapa atualizada.' : ''}</span>
    {error && <p role="alert" className="mt-1 max-w-56 text-sm text-destructive">{error}</p>}
    </div>
  )
}
