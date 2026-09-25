import type { Service, LoadingState } from '@/types'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { formatCurrency, formatDuration } from '@/utils/formatters'

interface StepServiceProps {
  services: Service[]
  state: LoadingState
  selected: Service | null
  onSelect: (service: Service) => void
  onNext: () => void
}

export default function StepService({
  services,
  state,
  selected,
  onSelect,
  onNext,
}: StepServiceProps) {
  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A] mb-2">
          Etapa 1 de 5
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl font-light text-[#18181B] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Qual serviço você deseja?
        </h2>
      </div>

      {/* Estados */}
      {state === 'loading' && <Loader label="Carregando serviços…" />}

      {state === 'error' && (
        <ErrorMessage message="Não foi possível carregar os serviços. Tente novamente em instantes." />
      )}

      {state === 'success' && services.length === 0 && (
        <div className="py-16 text-center space-y-4">
          <p className="text-sm text-[#71717A]">
            Nenhum serviço disponível para agendamento online no momento.
          </p>
          <a
            href="/#contato"
            className="inline-block text-sm text-[#C4976A] underline underline-offset-4 hover:text-[#18181B] transition-colors"
          >
            Entre em contato para mais informações →
          </a>
        </div>
      )}

      {/* Grid de serviços */}
      {state === 'success' && services.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          role="listbox"
          aria-label="Selecione um serviço"
        >
          {services.map((service) => {
            const isSelected = selected?.id === service.id
            return (
              <button
                key={service.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(service)}
                className={[
                  'text-left p-6 border transition-all duration-200 card-interactive',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4976A] focus-visible:ring-offset-1',
                  isSelected
                    ? 'border-[#C4976A] bg-[#F5EFE8] ring-1 ring-[#C4976A]'
                    : 'border-[#E8E0D6] bg-[#FAFAF8] hover:border-[#C4976A] hover:bg-[#F5EFE8]',
                ].join(' ')}
              >
                {/* Linha decorativa */}
                <div
                  className={[
                    'h-px mb-5 transition-all duration-300',
                    isSelected ? 'w-8 bg-[#C4976A]' : 'w-5 bg-[#E8E0D6]',
                  ].join(' ')}
                  aria-hidden="true"
                />

                <h3
                  className="font-display text-xl font-light text-[#18181B] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {service.name}
                </h3>

                {service.description && (
                  <p className="text-sm text-[#71717A] leading-relaxed mb-4">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-1">
                  {service.price != null && (
                    <span className="text-sm font-medium text-[#18181B]">
                      {formatCurrency(service.price)}
                    </span>
                  )}
                  {service.duration_minutes != null && (
                    <span className="text-xs text-[#71717A]">
                      {formatDuration(service.duration_minutes)}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Navegação */}
      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!selected} size="lg">
          Continuar
        </Button>
      </div>
    </div>
  )
}
