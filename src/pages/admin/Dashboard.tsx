import { useDashboard } from '@/hooks/useDashboard'
import MetricCard from '@/components/dashboard/MetricCard'
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments'
import AppointmentDistribution from '@/components/dashboard/AppointmentDistribution'
import QuickActions from '@/components/dashboard/QuickActions'
import { formatDateDisplay, getTodayString } from '@/utils/formatters'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function AdminDashboard() {
  const {
    metrics,
    upcomingAppointments,
    clinicSettings,
    state,
    error,
    refetch,
  } = useDashboard()

  const todayStr = getTodayString()
  const todayFormatted = formatDateDisplay(todayStr)
  const isLoading = state === 'loading'

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E0D6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] font-medium">
              Painel Geral
            </span>
            {clinicSettings?.booking_enabled !== undefined && (
              <span
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border',
                  clinicSettings.booking_enabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200',
                ].join(' ')}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    clinicSettings.booking_enabled ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  aria-hidden="true"
                />
                {clinicSettings.booking_enabled ? 'Agendamento ativo' : 'Agendamento pausado'}
              </span>
            )}
          </div>

          <h1
            className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-[#71717A] mt-1">
            {clinicSettings?.clinic_name || 'LG Clinic'}
            {clinicSettings?.professional_name && ` · ${clinicSettings.professional_name}`}
            {' — '}
            Visão geral dos atendimentos e da clínica.
          </p>
        </div>

        {/* Indicador de Data e Botão de Atualização */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#71717A] block font-medium">
              Hoje
            </span>
            <span className="text-xs text-[#18181B] font-medium">
              {todayFormatted}
            </span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Recarregar dados"
            className="p-2.5 bg-white border border-[#E8E0D6] rounded text-[#71717A] hover:text-[#18181B] hover:border-[#C4976A] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4976A]"
            aria-label="Atualizar dados do painel"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isLoading ? 'animate-spin' : ''}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error State */}
      {state === 'error' && (
        <div className="py-6">
          <ErrorMessage
            message={error || 'Não foi possível carregar os dados do painel.'}
            onRetry={refetch}
          />
        </div>
      )}

      {/* Cards Principais (Grid 4 colunas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Agendamentos Hoje */}
        <MetricCard
          label="Agendamentos hoje"
          value={metrics.todayAppointmentsCount}
          subtext="Total agendado para esta data"
          href="/admin/agenda"
          highlight={metrics.todayAppointmentsCount > 0}
          isLoading={isLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />

        {/* Card 2: Pendentes */}
        <MetricCard
          label="Pendentes"
          value={metrics.pendingCount}
          subtext="Aguardando confirmação"
          href="/admin/agenda"
          isLoading={isLoading}
          badgeText={metrics.pendingCount > 0 ? `${metrics.pendingCount} pendente(s)` : undefined}
          badgeVariant="amber"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        {/* Card 3: Confirmados */}
        <MetricCard
          label="Confirmados"
          value={metrics.confirmedCount}
          subtext="Atendimentos confirmados"
          href="/admin/agenda"
          isLoading={isLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />

        {/* Card 4: Clientes */}
        <MetricCard
          label="Clientes cadastrados"
          value={metrics.totalClientsCount}
          subtext="Total de pacientes na base"
          href="/admin/clientes"
          isLoading={isLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </div>

      {/* Grid Principal (Próximos Atendimentos + Lateral) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Próximos Atendimentos (2 colunas no desktop) */}
        <div className="lg:col-span-2">
          <UpcomingAppointments
            appointments={upcomingAppointments}
            isLoading={isLoading}
          />
        </div>

        {/* Coluna Lateral: Resumo de Distribuição e Ações Rápidas (1 coluna no desktop) */}
        <div className="space-y-6">
          <AppointmentDistribution
            metrics={metrics}
            isLoading={isLoading}
          />

          <QuickActions />
        </div>
      </div>
    </div>
  )
}
