'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types'
import { normalizeBrazilPhone } from '@/lib/site'
import { LEAD_STATUSES } from '@/lib/pipeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do contato'),
  whatsapp: z.string().refine(value => normalizeBrazilPhone(value) !== null, 'Informe um telefone brasileiro com DDD'),
  email: z.string().email().optional().or(z.literal('')),
  status: z.enum(['novo', 'em_atendimento', 'em_negociacao', 'fechado']),
  interesse: z.string().optional(),
  valor_maximo: z.optional(z.number().positive()),
  proximo_retorno: z.string().optional().or(z.literal('')),
  nota_retorno: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function LeadEditForm({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      email: lead.email ?? '',
      status: lead.status,
      interesse: lead.interesse ?? '',
      valor_maximo: lead.valor_maximo ?? undefined,
      proximo_retorno: lead.proximo_retorno ?? '',
      nota_retorno: lead.nota_retorno ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    setSaved(false)
    form.clearErrors('root')
    try {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({
        nome: data.nome,
        whatsapp: normalizeBrazilPhone(data.whatsapp)!,
        email: data.email || null,
        status: data.status,
        interesse: data.interesse || null,
        valor_maximo:
          data.valor_maximo && !Number.isNaN(data.valor_maximo)
            ? data.valor_maximo
            : null,
        proximo_retorno: data.proximo_retorno || null,
        nota_retorno: data.nota_retorno || null,
      })
      .eq('id', lead.id)
      .select('id')
      .single()
    if (error) throw error
    form.reset(data)
    setSaved(true)
    router.refresh()
    } catch {
      form.setError('root', { message: 'Não foi possível salvar. Suas alterações foram mantidas; tente novamente.' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={form.formState.isSubmitting} className="grid min-w-0 gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etapa</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proximo_retorno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Próximo retorno (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nota_retorno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nota do retorno (opcional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <Input {...field} type="tel" inputMode="tel" autoComplete="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (opcional)</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interesse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interesse / serviço (opcional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valor_maximo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">
            {form.formState.errors.root.message}
          </p>
        )}
        <p role="status" className="font-mono text-xs text-muted-foreground sm:col-span-2">{form.formState.isSubmitting ? 'Salvando…' : form.formState.isDirty ? 'Alterações não salvas' : saved ? 'Alterações salvas.' : ''}</p>
        <Button type="submit" className="sm:col-span-2 sm:w-fit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
          {form.formState.isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        </fieldset>
      </form>
    </Form>
  )
}
