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

const schema = z.object({
  titulo: z.string().trim().min(2, 'Informe o título do imóvel'),
  preco: z.number().positive('Informe um preço maior que zero'),
  bairro: z.string().trim().min(2, 'Informe o bairro'),
  quartos: z.number().min(0),
  banheiros: z.number().min(0),
  vagas: z.number().min(0),
  area: z.number().positive('Informe uma área maior que zero'),
  fotos_url: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function ImovelForm() {
  const router = useRouter()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      preco: 0,
      bairro: '',
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      area: 0,
      fotos_url: '',
    },
  })

  async function onSubmit(data: FormData) {
    form.clearErrors('root')
    try {
      const fotos = data.fotos_url
        ? data.fotos_url.split(',').map(value => value.trim()).filter(Boolean)
        : []
      const { error } = await createClient().from('imoveis').insert({
        titulo: data.titulo,
        preco: data.preco,
        bairro: data.bairro,
        quartos: data.quartos,
        banheiros: data.banheiros,
        vagas: data.vagas,
        area: data.area,
        fotos_url: fotos,
      })
      if (error) throw error
      router.push('/imoveis')
      router.refresh()
    } catch {
      form.setError('root', { message: 'Não foi possível salvar o imóvel. Confira os dados e tente novamente.' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
        <section className="rounded-lg border bg-card p-5 md:p-6">
          <p className="section-index">01 / DADOS</p>
          <h2 className="mt-2 text-lg font-semibold">Informações principais</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <FormField control={form.control} name="titulo" render={({ field }) => (
              <FormItem className="sm:col-span-2 md:col-span-1 lg:col-span-2"><FormLabel>Título</FormLabel><FormControl><Input {...field} autoComplete="off" placeholder="Ex: Apartamento com 3 quartos" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bairro" render={({ field }) => (
              <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} autoComplete="address-level3" placeholder="Ex: Centro" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="preco" render={({ field }) => (
              <FormItem><FormLabel>Preço</FormLabel><FormControl><Input type="number" inputMode="decimal" min="0" step="0.01" {...field} value={field.value || ''} onChange={event => field.onChange(event.target.value ? Number(event.target.value) : 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
              <FormItem><FormLabel>Área (m²)</FormLabel><FormControl><Input type="number" inputMode="decimal" min="0" step="0.01" {...field} value={field.value || ''} onChange={event => field.onChange(event.target.value ? Number(event.target.value) : 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fotos_url" render={({ field }) => (
              <FormItem className="sm:col-span-2 md:col-span-1 lg:col-span-2"><FormLabel>URLs das fotos (opcional)</FormLabel><FormControl><Input {...field} inputMode="url" placeholder="Separe vários links por vírgula" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </section>

        <section className="rounded-lg border border-t-2 border-t-accent bg-card p-5 md:p-6 xl:sticky xl:top-6">
          <p className="section-index">02 / CARACTERÍSTICAS</p>
          <h2 className="mt-2 text-lg font-semibold">Composição</h2>
          <div className="mt-6 space-y-5">
            {(['quartos', 'banheiros', 'vagas'] as const).map(name => (
              <FormField key={name} control={form.control} name={name} render={({ field }) => (
                <FormItem><FormLabel className="capitalize">{name}</FormLabel><FormControl><Input type="number" inputMode="numeric" min="0" step="1" {...field} onChange={event => field.onChange(Number(event.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
              )} />
            ))}
            {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting} loadingLabel="Salvando…">Salvar imóvel</Button>
          </div>
        </section>
      </form>
    </Form>
  )
}
