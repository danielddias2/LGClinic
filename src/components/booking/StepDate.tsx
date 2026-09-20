import type { Service } from '@/types'
import Button from '@/components/ui/Button'
import { getTodayString, formatDateDisplay } from '@/utils/formatters'

interface StepDateProps {
  service: Service
  selectedDate: string
  onDateChange: (date: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepDate({
  service,
  selectedDate,
  onDateChange,
  onNext,
  onBack,
}: StepDateProps) {
  const today = getTodayString()

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A] mb-2">
          Etapa 2 de 5
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl font-light text-[#18181B] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Escolha uma data
        </h2>
        <p className="text-sm text-[#71717A] mt-2">{service.name}</p>
      </div>

      {/* Input de data */}
      <div className="max-w-sm space-y-3">
        <label
          htmlFor="booking-date"
          className="block text-[10px] tracking-[0.2em] uppercase text-[#71717A]"
        >
          Data do agendamento
        </label>
        <input
          id="booking-date"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={[
            'w-full px-4 py-3 text-sm border bg-white text-[#18181B]',
            'focus:outline-none focus:border-[#C4976A] transition-colors',
            selectedDate ? 'border-[#C4976A]' : 'border-[#E8E0D6]',
          ].join(' ')}
        />

        {/* Data formatada */}
        {selectedDate && (
          <p className="text-sm text-[#71717A] pt-1">
            {formatDateDisplay(selectedDate)}
          </p>
        )}
      </div>

      {/* Aviso de disponibilidade */}
      <p className="text-xs text-[#71717A] max-w-sm leading-relaxed">
        Os horários disponíveis serão apresentados na próxima etapa
        com base na data escolhida.
      </p>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          ← Voltar
        </button>
        <Button onClick={onNext} disabled={!selectedDate} size="lg">
          Ver horários disponíveis
        </Button>
      </div>
    </div>
  )
}
