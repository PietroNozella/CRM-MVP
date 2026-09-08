import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-7" aria-busy="true">
      <span className="sr-only">Carregando contatos…</span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-44 md:h-52" />
      <Skeleton className="h-3 w-36" />
      <div className="grid gap-3 lg:grid-cols-2 xl:block" aria-hidden="true">
        <Skeleton className="h-64 xl:h-96" />
        <Skeleton className="h-64 xl:hidden" />
      </div>
    </div>
  )
}
