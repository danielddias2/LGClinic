import { Link } from 'react-router-dom'
import type { Service, AvailableSlot } from '@/types'
import { formatDateDisplay, formatTimeDisplay } from '@/utils/formatters'

interface StepSuccessProps {
  service: Service
  date: string
  slot: AvailableSlot
}

export default function StepSuccess({ service, date, slot }: StepSuccessProps) {
  return (
    <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-10">

      {/* Ícone de confirmação */}
      <div
        className="w-16 h-16 flex items-center justify-center border border-[#C4976A]"
        aria-hidden="true"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#C4976A]"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Mensagem */}
      <div className="space-y-3 max-w-sm">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A]">
          Confirmado
        </p>
        <h2
          className="font-display text-4xl font-light text-[#18181B]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Agendamento realizado
        </h2>
        <p className="text-sm text-[#71717A] leading-relaxed">
          Seu agendamento foi registrado com sucesso.
          Aguardamos você!
        </p>
      </div>

      {/* Resumo do agendamento */}
      <div className="w-full max-w-xs border border-[#E8E0D6] divide-y divide-[#E8E0D6] text-left">
        <div className="px-5 py-3.5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#71717A] mb-1">Serviço</p>
          <p className="text-sm text-[#18181B]">{service.name}</p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#71717A] mb-1">Data</p>
          <p className="text-sm text-[#18181B]">{formatDateDisplay(date)}</p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#71717A] mb-1">Horário</p>
          <p className="text-sm text-[#18181B]">{formatTimeDisplay(slot.start_at)}</p>
        </div>
      </div>

      {/* Ação */}
      <Link
        to="/"
        className="btn-nav-dark inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 text-sm font-semibold tracking-wide rounded"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
