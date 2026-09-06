export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando">
      <div className="h-3 w-24 bg-muted animate-pulse" />
      <div className="h-12 w-64 max-w-full bg-muted animate-pulse" />
      <div className="h-px bg-border" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-lg bg-muted animate-pulse" />
        <div className="h-72 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  )
}
