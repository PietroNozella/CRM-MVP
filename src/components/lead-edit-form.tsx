'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types'
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
  nome: z.string().min(2, 'Nome obrigatório'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
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
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({
        nome: data.nome,
        whatsapp: data.whatsapp,
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
    if (error) {
      form.setError('root', { message: error.message })
      return
    }
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        {form.formState.isSubmitSuccessful && !form.formState.errors.root && (
          <p className="text-sm text-green-700">Salvo.</p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Salvar alterações
        </Button>
      </form>
    </Form>
  )
}
