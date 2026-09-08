'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, UserPlus, Upload, SquareKanban, LogOut, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/brand'

const nav = [
  { href: '/', label: 'Hoje', icon: LayoutDashboard },
  { href: '/leads', label: 'Contatos', icon: Users },
  { href: '/funil', label: 'Funil', icon: SquareKanban },
  { href: '/leads/novo', label: 'Novo contato', icon: UserPlus },
  { href: '/leads/importar', label: 'Importar contatos', icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const moreRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (moreRef.current) moreRef.current.open = false
    if (pathname === '/login') return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [pathname])

  useEffect(() => {
    function closeMenu(event: PointerEvent | KeyboardEvent) {
      const menu = moreRef.current
      if (!menu?.open) return
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return
        menu.open = false
        menu.querySelector('summary')?.focus()
      } else if (event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false
      }
    }
    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeMenu)
    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeMenu)
    }
  }, [])

  async function onLogout() {
    setSigningOut(true)
    setError(null)
    try {
      const { error } = await createClient().auth.signOut()
      if (error) throw error
      router.replace('/login')
      router.refresh()
    } catch {
      setError('Não foi possível sair. Tente novamente.')
    } finally {
      setSigningOut(false)
    }
  }

  if (pathname === '/login') return null

  function isActive(href: string) {
    return pathname === href ||
      (href === '/leads' && /^\/leads\/[0-9a-f-]+$/i.test(pathname))
  }

  return (
    <aside className="relative z-40 w-full shrink-0 bg-brand-deep text-brand-cream [&_:focus-visible]:outline-brand-cream [&_:focus-visible]:ring-brand-cream md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:flex-col">
      <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 md:min-h-24 md:px-6">
        <Brand className="text-brand-cream" />
        <details ref={moreRef} className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-medium hover:bg-white/10">
            <Menu aria-hidden="true" className="h-4 w-4" />
            Menu
          </summary>
          <nav aria-label="Navegação principal" className="absolute right-0 top-12 grid max-h-[calc(100dvh-5rem)] w-64 gap-1 overflow-y-auto rounded-xl border border-white/10 bg-brand-deep p-2 shadow-floating">
            {nav.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" className={`justify-start ${isActive(href) ? 'bg-brand-cream text-brand-deep hover:bg-brand-cream' : 'text-brand-cream hover:bg-white/10 hover:text-white'}`}>
                <Link href={href} onClick={() => { if (moreRef.current) moreRef.current.open = false }} aria-current={isActive(href) ? 'page' : undefined}>
                  <Icon aria-hidden="true" />{label}
                </Link>
              </Button>
            ))}
            <div className="my-1 h-px bg-white/10" />
            {email && <p className="break-all px-3 py-2 font-mono text-[0.65rem] text-white/55">{email}</p>}
            <Button variant="ghost" onClick={onLogout} loading={signingOut} loadingLabel="Saindo…" className="justify-start text-brand-cream hover:bg-white/10 hover:text-white">
              <LogOut aria-hidden="true" />Sair
            </Button>
          </nav>
        </details>
      </div>

      <nav aria-label="Navegação principal" className="hidden min-h-0 overflow-y-auto px-4 py-6 md:block">
        <p className="mb-3 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/55">Área de trabalho</p>
        <div className="grid gap-1">
          {nav.map(({ href, label, icon: Icon }, index) => (
            <Button
              key={href}
              variant="ghost"
              asChild
              className={`relative justify-start overflow-hidden px-3 text-xs ${isActive(href) ? 'bg-accent text-brand-deep hover:bg-accent/90' : 'text-brand-cream/75 hover:bg-white/10 hover:text-white'} ${index === 3 ? 'mt-5' : ''}`}
            >
              <Link href={href} aria-current={isActive(href) ? 'page' : undefined}>
                <Icon aria-hidden="true" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      <div className="mt-auto hidden border-t border-white/10 p-4 md:block">
        {email && <p className="mb-2 truncate px-3 font-mono text-[0.6875rem] text-white/65" title={email}>{email}</p>}
        <Button variant="ghost" onClick={onLogout} loading={signingOut} loadingLabel="Saindo…" className="w-full justify-start text-brand-cream/70 hover:bg-white/10 hover:text-white">
          <LogOut aria-hidden="true" />Sair
        </Button>
      </div>
      {error && <p role="alert" className="px-5 pb-4 text-sm text-[hsl(var(--overdue-on-dark))]">{error}</p>}
    </aside>
  )
}
