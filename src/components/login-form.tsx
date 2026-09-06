'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SITE_NAME } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{SITE_NAME}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm font-medium mb-2 block">Email</label>
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
              <label htmlFor="login-password" className="text-sm font-medium mb-2 block">Senha</label>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="button" variant="ghost" aria-pressed={showPassword} aria-controls="login-password" onClick={() => setShowPassword(!showPassword)} className="mt-1 px-0">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</Button>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
