import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { scrollToTarget } from '@/utils/navigation'

export default function Footer() {
  const { settings } = useClinicSettings()
  const location = useLocation()
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  const handleNavClick = (to: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith('/#')) {
      const targetId = to.replace('/#', '')
      if (location.pathname === '/') {
        e.preventDefault()
        scrollToTarget(targetId)
      } else {
        e.preventDefault()
        navigate(to)
      }
    }
  }

  return (
    <footer className="bg-[#18181B] text-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Marca */}
          <div className="space-y-4">
            <div className="flex flex-col leading-none">
              <span
                className="font-display text-2xl font-light tracking-[0.12em] text-[#FAFAF8]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                LG
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#C4976A] font-light">
                Clinic
              </span>
            </div>
            <p className="text-sm text-[#71717A] leading-relaxed max-w-xs">
              Clínica de estética e cuidados pessoais.<br />
              Cuidado com precisão e atenção individualizada.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#71717A]">Navegação</h3>
            <nav className="flex flex-col gap-3" aria-label="Links do rodapé">
              <Link
                to="/#servicos"
                onClick={(e) => handleNavClick('/#servicos', e)}
                className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
              >
                Serviços
              </Link>
              <Link
                to="/#sobre"
                onClick={(e) => handleNavClick('/#sobre', e)}
                className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
              >
                Sobre
              </Link>
              <Link
                to="/#contato"
                onClick={(e) => handleNavClick('/#contato', e)}
                className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
              >
                Contato
              </Link>
              <Link
                to="/agendamento"
                className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
              >
                Agendamento
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#71717A]">Contato</h3>
            <div className="flex flex-col gap-3">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\D/g, '')}`}
                  className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
                >
                  {settings.phone}
                </a>
              )}
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
                >
                  WhatsApp
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
                >
                  {settings.email}
                </a>
              )}
              {settings?.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#FAFAF8] hover:text-[#C4976A] hover:translate-x-1 transition-all duration-200"
                >
                  @{settings.instagram.replace('@', '')}
                </a>
              )}
              {settings?.address && (
                <address className="not-italic text-sm text-[#71717A] leading-relaxed">
                  {settings.address}
                  {settings.city && `, ${settings.city}`}
                  {settings.state && ` — ${settings.state}`}
                </address>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-[#2D2D2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[#71717A]">
            © {year} LG Clinic. Todos os direitos reservados.
          </p>
          <Link
            to="/admin/login"
            className="text-xs text-[#3F3F46] hover:text-[#71717A] transition-colors"
            aria-label="Acesso administrativo"
          >
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  )
}
