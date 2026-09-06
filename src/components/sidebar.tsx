'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, UserPlus, Upload, SquareKanban, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SITE_NAME } from '@/lib/site'

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

  return (
    <aside className="w-full border-b bg-card p-3 md:w-64 md:shrink-0 md:border-b-0 md:border-r md:p-4 flex flex-col gap-2">
      <h2 className="font-semibold text-lg px-3 mb-2 md:mb-4">{SITE_NAME}</h2>
      <nav aria-label="Navegação principal" className="grid grid-cols-3 gap-1 md:flex md:flex-col md:gap-2">
      {nav.map(({ href, label, icon: Icon }, index) => (
        <Button
          key={href}
          variant={(pathname === href || (href === '/leads' && /^\/leads\/[0-9a-f-]+$/i.test(pathname))) ? 'secondary' : 'ghost'}
          asChild
          className={`${index > 2 ? 'hidden md:inline-flex' : ''} min-h-11 px-2 md:justify-start`}
          aria-current={pathname === href ? 'page' : undefined}
        >
          <Link href={href}>
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </Link>
        </Button>
      ))}
      </nav>
      <div className="mt-auto pt-4 border-t hidden md:block">
        {email && (
          <p className="text-xs text-muted-foreground px-3 mb-2 truncate">
            {email}
          </p>
        )}
        <Button variant="ghost" onClick={onLogout} disabled={signingOut} className="justify-start w-full">
          <LogOut className="mr-2 h-4 w-4" />
          {signingOut ? 'Saindo…' : 'Sair'}
        </Button>
      </div>
      <details ref={moreRef} className="md:hidden">
        <summary className="min-h-11 cursor-pointer rounded-md px-3 py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2">Mais opções</summary>
        <nav aria-label="Mais opções" className="grid gap-1">
          {nav.slice(3).map(({ href, label, icon: Icon }) => (
            <Button key={href} asChild variant="ghost" className="justify-start">
              <Link href={href} aria-current={pathname === href ? 'page' : undefined}><Icon aria-hidden="true" />{label}</Link>
            </Button>
          ))}
          {email && <p className="break-all px-3 py-2 text-xs text-muted-foreground">{email}</p>}
          <Button variant="ghost" onClick={onLogout} disabled={signingOut} className="justify-start"><LogOut aria-hidden="true" />{signingOut ? 'Saindo…' : 'Sair'}</Button>
        </nav>
      </details>
      {error && <p role="alert" className="px-3 text-sm text-destructive">{error}</p>}
    </aside>
  )
}
