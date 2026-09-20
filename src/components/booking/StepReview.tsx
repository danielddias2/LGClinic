import type { Service, AvailableSlot, ClientData } from '@/types'
import Button from '@/components/ui/Button'
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDuration,
  formatCurrency,
} from '@/utils/formatters'

interface StepReviewProps {
  service: Service
  date: string
  slot: AvailableSlot
  client: ClientData
  isSubmitting: boolean
  error: string | null
  onConfirm: () => void
  onBack: () => void
  onChangeSlot: () => void
}

export default function StepReview({
  service,
  date,
  slot,
  client,
  isSubmitting,
  error,
  onConfirm,
  onBack,
  onChangeSlot,
}: StepReviewProps) {
  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A] mb-2">
          Etapa 5 de 5
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl font-light text-[#18181B] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Confirmar agendamento
        </h2>
        <p className="text-sm text-[#71717A] mt-2">
          Revise os dados antes de confirmar.
        </p>
      </div>

      {/* Resumo */}
      <div className="max-w-md border border-[#E8E0D6] divide-y divide-[#E8E0D6]">

        {/* Serviço */}
        <div className="px-6 py-4 space-y-1">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#71717A]">Serviço</p>
          <p className="text-sm font-medium text-[#18181B]">{service.name}</p>
          <div className="flex gap-4">
            {service.duration_minutes != null && (
              <span className="text-xs text-[#71717A]">{formatDuration(service.duration_minutes)}</span>
            )}
            {service.price != null && (
              <span className="text-xs text-[#71717A]">{formatCurrency(service.price)}</span>
            )}
          </div>
        </div>

        {/* Data e horário */}
        <div className="px-6 py-4 space-y-1">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#71717A]">Data e horário</p>
          <p className="text-sm font-medium text-[#18181B]">
            {formatDateDisplay(date)}
          </p>
          <p className="text-sm text-[#71717A]">{formatTimeDisplay(slot.start_at)}</p>
        </div>

        {/* Dados pessoais */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#71717A]">Seus dados</p>
          <dl className="space-y-1.5">
            <div className="flex gap-2">
              <dt className="text-xs text-[#71717A] w-16 shrink-0">Nome</dt>
              <dd className="text-sm text-[#18181B]">{client.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-xs text-[#71717A] w-16 shrink-0">Telefone</dt>
              <dd className="text-sm text-[#18181B]">{client.phone}</dd>
            </div>
            {client.email && (
              <div className="flex gap-2">
                <dt className="text-xs text-[#71717A] w-16 shrink-0">E-mail</dt>
                <dd className="text-sm text-[#18181B]">{client.email}</dd>
              </div>
            )}
            {client.notes && (
              <div className="flex gap-2">
                <dt className="text-xs text-[#71717A] w-16 shrink-0">Obs.</dt>
                <dd className="text-sm text-[#18181B] leading-relaxed">{client.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Erro de submissão */}
      {error && (
        <div
          role="alert"
          className="max-w-md p-4 border border-red-200 bg-red-50 space-y-3"
        >
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onChangeSlot}
              className="text-sm font-medium text-[#C4976A] hover:text-[#18181B] transition-colors"
            >
              Escolher outro horário
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="text-sm font-medium text-[#18181B] hover:text-[#C4976A] transition-colors disabled:opacity-50"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm text-[#71717A] hover:text-[#18181B] transition-colors disabled:opacity-50"
        >
          ← Voltar
        </button>
        <Button onClick={onConfirm} isLoading={isSubmitting} size="lg">
          Confirmar agendamento
        </Button>
      </div>
    </div>
  )
}
