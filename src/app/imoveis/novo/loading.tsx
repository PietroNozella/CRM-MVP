import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-4xl space-y-6" aria-busy="true">
      <span className="sr-only">Carregando formulário de imóvel…</span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]" aria-hidden="true">
        <Skeleton className="h-[34rem]" />
        <Skeleton className="h-[29rem]" />
      </div>
    </div>
  )
}
