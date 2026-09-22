import type { DashboardMetrics } from '@/types'

interface AppointmentDistributionProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

export default function AppointmentDistribution({
  metrics,
  isLoading = false,
}: AppointmentDistributionProps) {
  const total = metrics.totalAppointmentsCount

  // Cálculo de porcentagens para a barra de distribuição
  const pendingPct = total > 0 ? (metrics.pendingCount / total) * 100 : 0
  const confirmedPct = total > 0 ? (metrics.confirmedCount / total) * 100 : 0
  const completedPct = total > 0 ? (metrics.completedCount / total) * 100 : 0
  const cancelledPct = total > 0 ? (metrics.cancelledCount / total) * 100 : 0
  const noShowPct = total > 0 ? (metrics.noShowCount / total) * 100 : 0

  const items = [
    {
      label: 'Confirmados',
      count: metrics.confirmedCount,
      color: 'bg-[#C4976A]',
      textColor: 'text-[#18181B]',
      pct: confirmedPct,
    },
    {
      label: 'Pendentes',
      count: metrics.pendingCount,
      color: 'bg-amber-500',
      textColor: 'text-amber-800',
      pct: pendingPct,
    },
    {
      label: 'Concluídos',
      count: metrics.completedCount,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-800',
      pct: completedPct,
    },
    {
      label: 'Cancelados',
      count: metrics.cancelledCount,
      color: 'bg-zinc-400',
      textColor: 'text-zinc-600',
      pct: cancelledPct,
    },
    ...(metrics.noShowCount > 0
      ? [
          {
            label: 'Não compareceu',
            count: metrics.noShowCount,
            color: 'bg-rose-500',
            textColor: 'text-rose-700',
            pct: noShowPct,
          },
        ]
      : []),
  ]

  return (
    <div className="bg-white border border-[#E8E0D6] rounded p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="font-display text-lg font-normal text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Distribuição de agendamentos
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Total histórico: {total} {total === 1 ? 'atendimento' : 'atendimentos'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-3 w-full bg-[#E8E0D6]/60 rounded-full" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-[#E8E0D6]/40 rounded" />
            ))}
          </div>
        </div>
      ) : total === 0 ? (
        <div className="py-6 text-center text-xs text-[#71717A]">
          Nenhum agendamento registrado até o momento.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Barra proporcional visual */}
          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden flex" title="Distribuição proporcional">
            {confirmedPct > 0 && (
              <div
                style={{ width: `${confirmedPct}%` }}
                className="bg-[#C4976A] transition-all duration-500"
                title={`Confirmados: ${metrics.confirmedCount} (${confirmedPct.toFixed(0)}%)`}
              />
            )}
            {pendingPct > 0 && (
              <div
                style={{ width: `${pendingPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Pendentes: ${metrics.pendingCount} (${pendingPct.toFixed(0)}%)`}
              />
            )}
            {completedPct > 0 && (
              <div
                style={{ width: `${completedPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Concluídos: ${metrics.completedCount} (${completedPct.toFixed(0)}%)`}
              />
            )}
            {cancelledPct > 0 && (
              <div
                style={{ width: `${cancelledPct}%` }}
                className="bg-zinc-300 transition-all duration-500"
                title={`Cancelados: ${metrics.cancelledCount} (${cancelledPct.toFixed(0)}%)`}
              />
            )}
            {noShowPct > 0 && (
              <div
                style={{ width: `${noShowPct}%` }}
                className="bg-rose-400 transition-all duration-500"
                title={`Não compareceu: ${metrics.noShowCount} (${noShowPct.toFixed(0)}%)`}
              />
            )}
          </div>

          {/* Legenda de Status com contadores */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {items.map((item) => (
              <div
                key={item.label}
                className="p-2.5 bg-[#FAFAF8] border border-[#E8E0D6]/70 rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                  <span className="text-xs text-[#71717A] truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#18181B] pl-2">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
