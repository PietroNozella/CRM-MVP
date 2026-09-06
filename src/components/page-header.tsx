import type { ReactNode } from 'react'

export function PageHeader({
  index,
  title,
  description,
  actions,
}: {
  index: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-8 border-b border-border pb-5 md:mb-10 md:pb-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="eyebrow">{index} / PRUMO</p>
          <h1 className="mt-3 break-words text-3xl font-semibold leading-none tracking-[-0.04em] md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
