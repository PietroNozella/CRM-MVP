'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, UserPlus, Upload, SquareKanban, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SITE_NAME } from '@/lib/site'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funil', label: 'Funil', icon: SquareKanban },
  { href: '/leads', label: 'Contatos', icon: Users },
  { href: '/leads/novo', label: 'Novo Contato', icon: UserPlus },
  { href: '/leads/importar', label: 'Importar', icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  async function onLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (pathname === '/login') return null

  return (
    <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
      <h2 className="font-semibold text-lg px-3 mb-4">{SITE_NAME}</h2>
      {nav.map(({ href, label, icon: Icon }) => (
        <Button
          key={href}
          variant={pathname === href ? 'secondary' : 'ghost'}
          asChild
          className="justify-start"
        >
          <Link href={href}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Link>
        </Button>
      ))}
      <div className="mt-auto pt-4 border-t">
        {email && (
          <p className="text-xs text-muted-foreground px-3 mb-2 truncate">
            {email}
          </p>
        )}
        <Button variant="ghost" onClick={onLogout} className="justify-start w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
