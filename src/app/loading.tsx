import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true">
      <span className="sr-only">Carregando painel…</span>
      <div aria-hidden="true">
        <Skeleton className="h-3 w-44" />
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 max-w-full" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="hidden h-11 w-36 sm:block" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3" aria-hidden="true">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]" aria-hidden="true">
        <Skeleton className="h-[34rem]" />
        <div className="space-y-5">
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  )
}
