'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
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
  status: z.enum(['novo', 'em_atendimento', 'visita', 'fechado']),
  interesse: z.string().optional(),
  valor_maximo: z.optional(z.number().positive()),
})

type FormData = z.infer<typeof schema>

export function LeadForm() {
  const router = useRouter()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      whatsapp: '',
      email: '',
      status: 'novo',
      interesse: '',
      valor_maximo: undefined,
    },
  })

  async function onSubmit(data: FormData) {
    const supabase = createClient()
    const { error } = await supabase.from('leads').insert({
      nome: data.nome,
      whatsapp: data.whatsapp,
      email: data.email || null,
      status: data.status,
      interesse: data.interesse || null,
      valor_maximo:
        data.valor_maximo && !Number.isNaN(data.valor_maximo)
          ? data.valor_maximo
          : null,
    })
    if (error) {
      form.setError('root', { message: error.message })
      return
    }
    router.push('/leads')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-md space-y-4"
      >
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
                <Input {...field} placeholder="5511999999999" />
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['novo', 'em_atendimento', 'visita', 'fechado'].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    )
                  )}
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
              <FormLabel>Interesse (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Apto 3 quartos" />
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
              <FormLabel>Valor máximo (opcional)</FormLabel>
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
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Salvar
        </Button>
      </form>
    </Form>
  )
}
