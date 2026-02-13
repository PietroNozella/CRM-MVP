'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Home, UserPlus, Building2 } from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/leads/novo', label: 'Novo Lead', icon: UserPlus },
  { href: '/imoveis', label: 'Imóveis', icon: Home },
  { href: '/imoveis/novo', label: 'Novo Imóvel', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
      <h2 className="font-semibold text-lg px-3 mb-4">CRM Imobiliário</h2>
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
    </aside>
  )
}
