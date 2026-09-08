import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Carregando contato…</span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]" aria-hidden="true">
        <Skeleton className="h-[30rem]" />
        <Skeleton className="h-[38rem]" />
      </div>
    </div>
  )
}
