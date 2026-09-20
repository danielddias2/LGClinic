const STEPS = [
  { n: 1, label: 'Serviço' },
  { n: 2, label: 'Data'    },
  { n: 3, label: 'Horário' },
  { n: 4, label: 'Dados'   },
  { n: 5, label: 'Revisão' },
]

interface BookingProgressProps {
  currentStep: number // 1–5
}

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  const pct = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      {/* ── Mobile: barra + texto ── */}
      <div className="sm:hidden mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#71717A]">
            Passo {currentStep} de {STEPS.length}
          </span>
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#18181B] font-medium">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-px bg-[#E8E0D6] relative">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-[#C4976A] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Desktop: dots + labels + linhas ── */}
      <div
        className="hidden sm:flex items-start mb-14"
        role="list"
        aria-label="Etapas do agendamento"
      >
        {STEPS.map((step, i) => {
          const done    = step.n < currentStep
          const current = step.n === currentStep
          return (
            <div key={step.n} className="flex items-start flex-1 last:flex-none" role="listitem">
              <div className="flex flex-col items-center gap-2">
                {/* Círculo */}
                <div
                  aria-current={current ? 'step' : undefined}
                  className={[
                    'w-8 h-8 flex items-center justify-center text-xs font-medium transition-colors duration-300',
                    done    ? 'bg-[#C4976A] text-[#FAFAF8]'           : '',
                    current ? 'bg-[#18181B] text-[#FAFAF8]'           : '',
                    !done && !current ? 'bg-[#E8E0D6] text-[#71717A]' : '',
                  ].join(' ')}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : step.n}
                </div>
                {/* Label */}
                <span className={[
                  'text-[10px] tracking-[0.1em] whitespace-nowrap',
                  current ? 'text-[#18181B] font-medium' : 'text-[#71717A]',
                ].join(' ')}>
                  {step.label}
                </span>
              </div>

              {/* Linha conectora */}
              {i < STEPS.length - 1 && (
                <div className={[
                  'flex-1 h-px mt-4 mx-3 transition-colors duration-500',
                  done ? 'bg-[#C4976A]' : 'bg-[#E8E0D6]',
                ].join(' ')} aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
