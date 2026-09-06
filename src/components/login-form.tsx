'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Brand, PrumoMark } from '@/components/brand'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setError(error.code === 'invalid_credentials' ? 'Email ou senha inválidos.' : error.status === 429 ? 'Muitas tentativas. Aguarde um pouco e tente novamente.' : 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.')
        return
      }
      router.replace('/')
      router.refresh()
    } catch {
      setError('Não foi possível entrar agora. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-4.5rem)] overflow-hidden rounded-lg border bg-card shadow-[0_20px_60px_rgba(24,32,27,0.08)] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden min-h-[640px] overflow-hidden bg-[#18201B] p-10 text-[#F4F1E9] lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Brand className="relative z-10" />
        <div aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 w-px bg-white/15">
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#E65A2F]" />
          <span className="absolute bottom-14 left-1/2 -translate-x-1/2"><PrumoMark className="h-16 w-16 text-[#E65A2F]" /></span>
        </div>
        <div className="relative z-10 max-w-md">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/45">Sistema de relacionamento</p>
          <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.055em] xl:text-6xl">
            Organize contatos.<br />Mantenha o próximo passo à vista.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-sm">
          <Brand className="mb-14 text-primary lg:hidden" />
          <p className="eyebrow">Acesso seguro</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Entre no PRUMO</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Retome sua agenda e continue as conversas importantes.</p>
          <form onSubmit={onSubmit} className="mt-9 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Email</label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Senha</label>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="button" variant="link" aria-pressed={showPassword} aria-controls="login-password" onClick={() => setShowPassword(!showPassword)} className="mt-1 h-auto min-h-0 px-0 py-2 text-xs">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</Button>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
