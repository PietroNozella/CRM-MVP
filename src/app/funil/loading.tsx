import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <span className="sr-only">Carregando funil…</span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-72" />)}
      </div>
    </div>
  )
}
