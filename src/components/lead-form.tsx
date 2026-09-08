'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { normalizeBrazilPhone } from '@/lib/site'
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
import { LEAD_STATUSES } from '@/lib/pipeline'

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
      proximo_retorno: '',
      nota_retorno: '',
    },
  })

  async function onSubmit(data: FormData) {
    form.clearErrors('root')
    try {
    const supabase = createClient()
    const { data: created, error } = await supabase
      .from('leads')
      .insert({
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
      .select('id')
      .single()
    if (error || !created) throw error ?? new Error('Contato não retornado')
    router.push(`/leads/${created.id}`)
    router.refresh()
    } catch {
      form.setError('root', { message: 'Não foi possível salvar o contato. Confira os dados e tente novamente.' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
        <section className="rounded-lg border bg-card p-5 md:p-6">
          <p className="section-index">01 / DADOS</p>
          <h2 className="mt-2 text-lg font-semibold">Informações principais</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <FormField control={form.control} name="nome" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="whatsapp" render={({ field }) => (
              <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email (opcional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="interesse" render={({ field }) => (
              <FormItem><FormLabel>Interesse / serviço (opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: Corte + barba, revisão, orçamento" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="valor_maximo" render={({ field }) => (
              <FormItem><FormLabel>Valor (opcional)</FormLabel><FormControl><Input type="number" inputMode="decimal" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </section>

        <section className="rounded-lg border border-t-2 border-t-accent bg-card p-5 md:p-6 xl:sticky xl:top-6">
          <p className="section-index">02 / DIREÇÃO</p>
          <h2 className="mt-2 text-lg font-semibold">Próximo passo</h2>
          <div className="mt-6 space-y-5">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Etapa</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="proximo_retorno" render={({ field }) => (
              <FormItem><FormLabel>Próximo retorno (opcional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="nota_retorno" render={({ field }) => (
              <FormItem><FormLabel>Nota do retorno (opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: Confirmar orçamento" /></FormControl><FormMessage /></FormItem>
            )} />
            {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting} loadingLabel="Salvando…">
              Salvar contato
            </Button>
          </div>
        </section>
      </form>
    </Form>
  )
}
