import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Redireciona se já autenticado
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin'
        navigate(from, { replace: true })
      }
    })
  }, [navigate, location])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.')
      return
    }

    const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin'
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-5">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center space-y-1">
          <div
            className="font-display text-3xl font-light tracking-[0.12em] text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            LG
          </div>
          <div className="text-[9px] tracking-[0.3em] uppercase text-[#C4976A] font-light">
            Clinic · Área Administrativa
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs tracking-[0.1em] uppercase text-[#71717A]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-[#E8E0D6] bg-white text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#C4976A] transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs tracking-[0.1em] uppercase text-[#71717A]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-[#E8E0D6] bg-white text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#C4976A] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
