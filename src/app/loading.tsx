export default function Loading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="h-24 rounded bg-muted animate-pulse" />
      <div className="h-24 rounded bg-muted animate-pulse" />
    </div>
  )
}
