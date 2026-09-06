import { cn } from '@/lib/utils'

export function PrumoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={cn('h-8 w-8 shrink-0', className)}
      fill="none"
    >
      <path d="M16 3v16" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="4" r="2.5" fill="currentColor" />
      <path d="m16 17 7 7-7 5-7-5 7-7Z" fill="currentColor" />
      <path d="M4 8h6M22 8h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <PrumoMark />
      {!compact && (
        <span className="text-lg font-semibold tracking-[0.2em]">PRUMO</span>
      )}
    </span>
  )
}
