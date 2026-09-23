import { Link } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

// ── Hero ──────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center bg-[#FAFAF8] pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center py-20 lg:py-0">

          {/* Texto */}
          <div className="space-y-8">
            {/* Tag */}
            <p className="text-xs tracking-[0.25em] uppercase text-[#C4976A]">
              Clínica de Estética e Cuidados Pessoais
            </p>

            {/* Título */}
            <h1
              id="hero-heading"
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cuidado com
              <br />
              <em className="not-italic text-[#C4976A]">precisão</em>
              <br />
              e atenção.
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-[#71717A] leading-relaxed max-w-md font-light">
              A LG Clinic oferece tratamentos estéticos com foco na experiência
              individualizada. Cada atendimento é pensado para você.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/agendamento"
                className="btn-nav-dark inline-flex items-center justify-center px-8 py-4 text-sm font-semibold tracking-wide text-white bg-[#18181B] hover:bg-[#2D2D2F] hover:text-white transition-colors duration-200 rounded"
                style={{ color: '#ffffff', backgroundColor: '#18181b' }}
              >
                Agendar consulta
              </Link>
              <a
                href="#servicos"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium tracking-wide text-[#18181B] border border-[#18181B] hover:border-[#C4976A] hover:text-[#C4976A] transition-colors duration-200"
              >
                Ver serviços
              </a>
            </div>
          </div>

          {/* Imagem placeholder */}
          <div className="relative hidden lg:block">
            <div
              className="aspect-[3/4] bg-[#F5EFE8] flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="text-center space-y-3 text-[#C4976A]">
                <div className="text-5xl font-light" style={{ fontFamily: 'var(--font-display)' }}>
                  Dra. Luana
                </div>
                <div className="text-xs tracking-[0.2em] uppercase text-[#71717A]">
                  Foto da profissional
                </div>
              </div>
            </div>
            {/* Detalhe decorativo */}
            <div
              className="absolute -bottom-4 -left-4 w-24 h-24 border border-[#C4976A] -z-10"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Sobre ─────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section
      id="sobre"
      className="bg-[#F5EFE8] py-24 sm:py-32"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Imagem placeholder mobile/desktop */}
          <div
            className="aspect-square sm:aspect-[4/5] bg-[#E8DDD4] flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-[#A89880]">
              Foto da Dra. Luana Gratão
            </span>
          </div>

          {/* Texto */}
          <div className="space-y-8">
            <p className="text-xs tracking-[0.25em] uppercase text-[#C4976A]">
              A profissional
            </p>
            <h2
              id="about-heading"
              className="font-display text-4xl sm:text-5xl font-light text-[#18181B] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dra. Luana Gratão
            </h2>
            <div className="space-y-4 text-[#71717A] font-light leading-relaxed">
              <p>
                Especialista em estética e cuidados pessoais, a Dra. Luana Gratão
                fundamenta sua prática em protocolos clínicos precisos e na escuta
                ativa de cada paciente.
              </p>
              <p>
                Na LG Clinic, cada atendimento é planejado individualmente —
                do diagnóstico inicial à escolha dos procedimentos mais adequados
                para o seu perfil.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="#contato"
                className="inline-flex items-center text-sm font-medium tracking-wide text-[#18181B] border-b border-[#C4976A] pb-0.5 hover:text-[#C4976A] transition-colors"
              >
                Entrar em contato
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Serviços ──────────────────────────────────────────────────
function ServicesSection() {
  const { services, state } = useServices()

  return (
    <section
      id="servicos"
      className="bg-[#FAFAF8] py-24 sm:py-32"
      aria-labelledby="services-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Cabeçalho */}
        <div className="max-w-xl mb-16 space-y-4">
          <p className="text-xs tracking-[0.25em] uppercase text-[#C4976A]">
            Serviços
          </p>
          <h2
            id="services-heading"
            className="font-display text-4xl sm:text-5xl font-light text-[#18181B] leading-snug"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tratamentos disponíveis
          </h2>
          <p className="text-[#71717A] font-light leading-relaxed">
            Escolha o serviço mais adequado para você e agende online com facilidade.
          </p>
        </div>

        {/* Estados */}
        {state === 'loading' && <Loader label="Carregando serviços…" />}

        {state === 'error' && (
          <ErrorMessage message="Não foi possível carregar os serviços. Tente novamente em instantes." />
        )}

        {state === 'success' && services.length === 0 && (
          <p className="text-[#71717A] text-sm py-8">
            Nenhum serviço disponível no momento. Entre em contato para mais informações.
          </p>
        )}

        {state === 'success' && services.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E0D6]">
            {services.map((service) => (
              <li
                key={service.id}
                className="bg-[#FAFAF8] p-8 sm:p-10 space-y-4 hover:bg-[#F5EFE8] transition-colors duration-200 group"
              >
                {/* Linha decorativa */}
                <div className="w-8 h-px bg-[#C4976A] group-hover:w-12 transition-all duration-300" aria-hidden="true" />

                <h3 className="font-display text-xl font-light text-[#18181B]" style={{ fontFamily: 'var(--font-display)' }}>
                  {service.name}
                </h3>

                {service.description && (
                  <p className="text-sm text-[#71717A] leading-relaxed font-light">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {service.price != null && (
                    <span className="text-sm text-[#18181B] font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(service.price)}
                    </span>
                  )}
                  {service.duration_minutes && (
                    <span className="text-xs text-[#71717A]">
                      {service.duration_minutes} min
                    </span>
                  )}
                </div>

                <Link
                  to={`/agendamento?servico=${service.id}`}
                  className="inline-flex items-center text-xs tracking-[0.15em] uppercase text-[#C4976A] hover:text-[#18181B] transition-colors mt-2"
                  aria-label={`Agendar ${service.name}`}
                >
                  Agendar →
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* CTA global */}
        {state === 'success' && (
          <div className="mt-12 text-center">
            <Link
              to="/agendamento"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium tracking-wide text-[#18181B] border border-[#18181B] hover:bg-[#18181B] hover:text-[#FAFAF8] transition-colors duration-200"
            >
              Ver agenda completa
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// ── CTA Agendamento ────────────────────────────────────────────
function BookingCtaSection() {
  return (
    <section className="bg-[#18181B] py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 text-center space-y-8">
        <p className="text-xs tracking-[0.25em] uppercase text-[#C4976A]">
          Agendamento online
        </p>
        <h2
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#FAFAF8] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Agende no seu tempo,<br />
          sem complicações.
        </h2>
        <p className="text-[#71717A] text-base font-light max-w-md mx-auto leading-relaxed">
          Escolha o serviço, selecione um horário disponível e confirme seu
          agendamento diretamente pelo site.
        </p>
        <Link
          to="/agendamento"
          className="inline-flex items-center justify-center px-10 py-4 text-sm font-medium tracking-wide text-[#18181B] bg-[#C4976A] hover:bg-[#FAFAF8] transition-colors duration-200"
        >
          Agendar consulta
        </Link>
      </div>
    </section>
  )
}

// ── Contato ───────────────────────────────────────────────────
function ContactSection() {
  const { settings, state } = useClinicSettings()

  return (
    <section
      id="contato"
      className="bg-[#F5EFE8] py-24 sm:py-32"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Texto */}
          <div className="space-y-6">
            <p className="text-xs tracking-[0.25em] uppercase text-[#C4976A]">Contato</p>
            <h2
              id="contact-heading"
              className="font-display text-4xl sm:text-5xl font-light text-[#18181B] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Fale com a gente
            </h2>
            <p className="text-[#71717A] font-light leading-relaxed">
              Tem dúvidas sobre algum procedimento ou quer saber mais sobre a
              clínica? Entre em contato pelos canais abaixo.
            </p>

            {state === 'success' && settings && (
              <dl className="space-y-5 pt-4">
                {settings.phone && (
                  <div>
                    <dt className="text-xs tracking-[0.2em] uppercase text-[#71717A] mb-1">Telefone</dt>
                    <dd>
                      <a
                        href={`tel:${settings.phone.replace(/\D/g, '')}`}
                        className="text-sm text-[#18181B] hover:text-[#C4976A] transition-colors"
                      >
                        {settings.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {settings.whatsapp && (
                  <div>
                    <dt className="text-xs tracking-[0.2em] uppercase text-[#71717A] mb-1">WhatsApp</dt>
                    <dd>
                      <a
                        href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#18181B] hover:text-[#C4976A] transition-colors"
                      >
                        {settings.whatsapp}
                      </a>
                    </dd>
                  </div>
                )}
                {settings.email && (
                  <div>
                    <dt className="text-xs tracking-[0.2em] uppercase text-[#71717A] mb-1">E-mail</dt>
                    <dd>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-sm text-[#18181B] hover:text-[#C4976A] transition-colors"
                      >
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                )}
                {settings.instagram && (
                  <div>
                    <dt className="text-xs tracking-[0.2em] uppercase text-[#71717A] mb-1">Instagram</dt>
                    <dd>
                      <a
                        href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#18181B] hover:text-[#C4976A] transition-colors"
                      >
                        @{settings.instagram.replace('@', '')}
                      </a>
                    </dd>
                  </div>
                )}
                {settings.address && (
                  <div>
                    <dt className="text-xs tracking-[0.2em] uppercase text-[#71717A] mb-1">Endereço</dt>
                    <dd className="text-sm text-[#18181B] leading-relaxed">
                      {settings.address}
                      {settings.city && `, ${settings.city}`}
                      {settings.state && ` — ${settings.state}`}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {state === 'loading' && (
              <div className="pt-4 text-xs text-[#71717A]">Carregando informações…</div>
            )}
          </div>

          {/* Mapa placeholder */}
          <div
            className="aspect-square sm:aspect-[4/3] bg-[#E8DDD4] flex items-center justify-center"
            aria-label="Localização da LG Clinic no mapa"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-[#A89880]">
              Mapa — em breve
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Página Home ───────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <BookingCtaSection />
      <ContactSection />
    </>
  )
}
