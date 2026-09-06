import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-6 border-b border-border pb-5 md:mb-8 md:pb-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0 flex-1 basis-64">
          <h1 className="break-words font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.01em] md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-base leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="max-w-full">{actions}</div>}
      </div>
    </header>
  )
}
