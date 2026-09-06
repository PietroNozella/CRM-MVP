'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-md space-y-4 py-10">
      <h1 className="text-xl font-bold">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente.
      </p>
      <Button onClick={reset} className="min-h-11">
        Tentar novamente
      </Button>
    </div>
  )
}
