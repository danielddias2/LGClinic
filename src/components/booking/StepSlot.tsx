import type { Service, AvailableSlot } from '@/types'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { formatDateDisplay, formatTimeDisplay } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'

interface StepSlotProps {
  service: Service
  date: string
  selected: AvailableSlot | null
  onSelect: (slot: AvailableSlot) => void
  onNext: () => void
  onBack: () => void
  /** Erro de conflito de horário vindo de uma tentativa anterior de agendamento */
  conflictError: string | null
}

export default function StepSlot({
  service,
  date,
  selected,
  onSelect,
  onNext,
  onBack,
  conflictError,
}: StepSlotProps) {
  const { slots, state, error, refetch } = useAvailableSlots(service.id, date)

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A] mb-2">
          Etapa 3 de 5
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl font-light text-[#18181B] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Escolha um horário
        </h2>
        <p className="text-sm text-[#71717A] mt-2">
          {service.name} · {formatDateDisplay(date)}
        </p>
      </div>

      {/* Alerta de conflito (slot ocupado na tentativa anterior) */}
      {conflictError && (
        <div
          role="alert"
          className="p-4 border border-amber-300 bg-amber-50 text-sm text-amber-800 leading-relaxed"
        >
          {conflictError}
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && <Loader label="Verificando disponibilidade…" />}

      {/* Erro de RPC */}
      {state === 'error' && (
        <ErrorMessage
          message={getFriendlyError(error ?? '')}
          onRetry={refetch}
        />
      )}

      {/* Sem horários */}
      {state === 'success' && slots.length === 0 && (
        <div className="py-16 text-center space-y-4">
          <p className="text-sm text-[#71717A]">
            Nenhum horário disponível para esta data.
          </p>
          <button
            onClick={onBack}
            className="text-sm text-[#C4976A] underline underline-offset-4 hover:text-[#18181B] transition-colors"
          >
            Escolher outra data
          </button>
        </div>
      )}

      {/* Grid de horários */}
      {state === 'success' && slots.length > 0 && (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
          role="listbox"
          aria-label="Horários disponíveis"
        >
          {slots.map((slot) => {
            const isSelected = selected?.start_at === slot.start_at
            return (
              <button
                key={slot.start_at}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(slot)}
                className={[
                  'py-3 text-sm text-center border transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4976A] focus-visible:ring-offset-1',
                  isSelected
                    ? 'border-[#C4976A] bg-[#C4976A] text-[#18181B] font-semibold'
                    : 'border-[#E8E0D6] text-[#18181B] hover:border-[#C4976A] hover:bg-[#F5EFE8]',
                ].join(' ')}
              >
                {formatTimeDisplay(slot.start_at)}
              </button>
            )
          })}
        </div>
      )}

      {/* Navegação */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[#71717A] hover:text-[#18181B] transition-colors py-2 text-center sm:text-left"
        >
          ← Voltar
        </button>
        <Button onClick={onNext} disabled={!selected} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  )
}
