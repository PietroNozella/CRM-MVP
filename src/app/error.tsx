'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-xl border-l-4 border-l-accent bg-card p-6 md:p-8">
      <p className="eyebrow">Erro / INTERROMPIDO</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Algo deu errado</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente.
      </p>
      <Button onClick={reset} className="mt-5 min-h-11">
        Tentar novamente
      </Button>
    </div>
  )
}
