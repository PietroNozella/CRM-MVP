import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-7" aria-busy="true">
      <span className="sr-only">Carregando imóveis…</span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:block" aria-hidden="true">
        <Skeleton className="h-64 xl:h-96" />
        <Skeleton className="h-64 xl:hidden" />
      </div>
    </div>
  )
}
