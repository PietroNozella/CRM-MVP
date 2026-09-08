import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-4xl space-y-6" aria-busy="true">
      <span className="sr-only">Carregando importação de contatos…</span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-56" />
      <Skeleton className="h-72" />
    </div>
  )
}
