import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center px-5 py-24 text-center">
      <div className="max-w-md space-y-6 animate-hero-fade-up">
        <p className="text-xs tracking-[0.25em] uppercase text-[#C4976A] font-medium">
          Erro 404
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-light text-[#18181B]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Página não encontrada
        </h1>
        <p className="text-sm text-[#71717A] leading-relaxed font-light">
          O endereço que você tentou acessar não existe, foi alterado ou está temporariamente indisponível.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Voltar ao início
            </Button>
          </Link>
          <Link to="/agendamento" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Agendar consulta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
