import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { scrollToTarget } from '@/utils/navigation'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Serviços', to: '/#servicos' },
  { label: 'Sobre', to: '/#sobre' },
  { label: 'Contato', to: '/#contato' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fecha menu mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.style.overflow = ''
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Impede scroll no body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleNavClick = useCallback(
    (to: string, e: React.MouseEvent<HTMLAnchorElement>) => {
      // 1. No mobile: desbloqueia o body e fecha o menu imediatamente
      if (mobileOpen) {
        document.body.style.overflow = ''
        setMobileOpen(false)
      }

      // 2. Destino é o topo ('/')
      if (to === '/') {
        if (location.pathname === '/') {
          e.preventDefault()
          scrollToTarget('inicio')
        }
        return
      }

      // 3. Destino é uma âncora ('/#sobre', '/#servicos', '/#contato')
      if (to.startsWith('/#')) {
        const targetId = to.replace('/#', '')
        if (location.pathname === '/') {
          // Já estamos na Home: rolagem suave direta sem recarregar a página
          e.preventDefault()
          scrollToTarget(targetId)
        } else {
          // Em outra página: navega para a Home com a âncora via React Router
          e.preventDefault()
          navigate(to)
        }
      }
    },
    [mobileOpen, location.pathname, navigate]
  )

  return (
    <header
      className={[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E0D6]'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logotipo */}
          <Link
            to="/"
            onClick={(e) => handleNavClick('/', e)}
            className="flex flex-col leading-none"
            aria-label="LG Clinic — página inicial"
          >
            <span
              className="font-display text-xl sm:text-2xl font-light tracking-[0.12em] text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              LG
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C4976A] font-light">
              Clinic
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(link.to, e)}
                className="nav-link-subtle text-sm tracking-wide text-[#18181B] hover:text-[#C4976A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:flex">
            <Link
              to="/agendamento"
              className="btn-nav-dark inline-flex items-center px-5 py-2.5 text-sm font-semibold tracking-wide rounded hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Agendar consulta
            </Link>
          </div>

          {/* Botão menu mobile */}
          <button
            className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 -mr-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <span
              className={[
                'block h-px w-6 bg-[#18181B] transition-all duration-200 origin-center',
                mobileOpen ? 'translate-y-[7px] rotate-45' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px w-6 bg-[#18181B] transition-all duration-200',
                mobileOpen ? 'opacity-0' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px w-6 bg-[#18181B] transition-all duration-200 origin-center',
                mobileOpen ? '-translate-y-[7px] -rotate-45' : '',
              ].join(' ')}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-nav"
        aria-hidden={!mobileOpen}
        className={[
          'md:hidden fixed inset-0 top-16 bg-[#FAFAF8] z-40 transition-all duration-300 ease-out flex flex-col',
          mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none',
        ].join(' ')}
      >
        <nav className="flex flex-col px-5 pt-8 gap-6" aria-label="Navegação mobile">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(e) => handleNavClick(link.to, e)}
              className="text-lg font-light tracking-wide text-[#18181B] border-b border-[#E8E0D6] pb-4 hover:text-[#C4976A] hover:pl-1 transition-all duration-200"
              style={{
                transitionDelay: mobileOpen ? `${index * 40}ms` : '0ms',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/agendamento"
            onClick={() => {
              document.body.style.overflow = ''
              setMobileOpen(false)
            }}
            className="btn-nav-dark mt-4 inline-flex items-center justify-center w-full px-6 py-4 text-base font-semibold tracking-wide rounded active:scale-[0.99] transition-transform duration-150"
          >
            Agendar consulta
          </Link>
        </nav>
      </div>
    </header>
  )
}
