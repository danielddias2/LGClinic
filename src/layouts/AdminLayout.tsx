import { useEffect, useState } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Loader from '@/components/ui/Loader'

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Agenda', to: '/admin/agenda' },
  { label: 'Clientes', to: '/admin/clientes' },
  { label: 'Serviços', to: '/admin/servicos' },
  { label: 'Configurações', to: '/admin/configuracoes' },
]

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Fecha menu mobile na mudança de rota
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Aguardando verificação de sessão
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader label="Verificando acesso…" />
      </div>
    )
  }

  // Não autenticado → redireciona para login
  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F4F2]">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#18181B] text-[#FAFAF8] px-5 py-4 flex items-center justify-between border-b border-[#2D2D2F] sticky top-0 z-40">
        <Link to="/" className="flex flex-col leading-none">
          <span
            className="font-display text-lg font-light tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            LG
          </span>
          <span className="text-[8px] tracking-[0.3em] uppercase text-[#C4976A] font-light">
            Clinic · Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="text-[#FAFAF8] p-2 rounded hover:bg-[#2D2D2F] transition-colors"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#18181B] border-b border-[#2D2D2F] px-4 py-3 space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'block px-4 py-3 text-base rounded-lg transition-colors font-semibold',
                  isActive
                    ? 'bg-[#C4976A] text-[#18181B] font-bold shadow-xs'
                    : 'bg-[#18181B] text-white hover:bg-[#2D2D2F] hover:text-white',
                ].join(' ')}
                style={isActive ? undefined : { color: '#ffffff', backgroundColor: '#18181b' }}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-[#2D2D2F]">
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full px-4 py-3 text-base text-white hover:bg-[#2D2D2F] rounded-lg text-left transition-colors font-semibold"
              style={{ color: '#ffffff' }}
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#18181B] text-[#FAFAF8] shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-8 border-b border-[#2D2D2F]">
          <Link to="/" className="flex flex-col leading-none">
            <span
              className="font-display text-xl font-light tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              LG
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C4976A] font-light">
              Clinic · Admin
            </span>
          </Link>
        </div>
        <nav className="flex flex-col px-4 py-6 gap-1.5 flex-1" aria-label="Navegação administrativa">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'px-3.5 py-2.5 text-sm rounded-lg transition-colors duration-150 font-semibold',
                  isActive
                    ? 'bg-[#C4976A] text-[#18181B] font-bold shadow-xs'
                    : 'bg-[#18181B] text-white hover:bg-[#2D2D2F] hover:text-white',
                ].join(' ')}
                style={isActive ? undefined : { color: '#ffffff', backgroundColor: '#18181b' }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 pb-6">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full px-3.5 py-2.5 text-sm text-white hover:bg-[#2D2D2F] rounded-lg text-left transition-colors font-semibold"
            style={{ color: '#ffffff' }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
