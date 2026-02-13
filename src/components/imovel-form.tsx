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
  titulo: z.string().min(2, 'Título obrigatório'),
  preco: z.number().positive('Preço deve ser positivo'),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  quartos: z.number().min(0),
  banheiros: z.number().min(0),
  vagas: z.number().min(0),
  area: z.number().positive('Área deve ser positiva'),
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
    const supabase = createClient()
    const fotos = data.fotos_url
      ? data.fotos_url.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const { error } = await supabase.from('imoveis').insert({
      titulo: data.titulo,
      preco: data.preco,
      bairro: data.bairro,
      quartos: data.quartos,
      banheiros: data.banheiros,
      vagas: data.vagas,
      area: data.area,
      fotos_url: fotos,
    })
    if (error) {
      form.setError('root', { message: error.message })
      return
    }
    router.push('/imoveis')
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
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Apartamento 3 quartos" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Centro" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quartos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quartos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="banheiros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banheiros</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vagas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vagas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área (m²)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fotos_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URLs das fotos (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="URL1, URL2, URL3..."
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
