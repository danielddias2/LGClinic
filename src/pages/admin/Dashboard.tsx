import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard, extractLocalDateString } from '@/hooks/useDashboard'
import type { AdminAppointment } from '@/types'
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDuration,
  getTodayString,
} from '@/utils/formatters'
import ErrorMessage from '@/components/ui/ErrorMessage'

// ── Error Boundary de Proteção contra Tela Branca ─────────────────
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

class DashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const msg = error instanceof Error ? error.message : 'Erro de renderização'
    return { hasError: true, errorMessage: msg }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[LG Clinic Dashboard] Erro capturado pelo ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
          <div className="p-6 bg-red-50 border border-red-200 rounded text-center space-y-4">
            <h2 className="text-lg font-medium text-red-800">
              Não foi possível carregar a visão do Dashboard
            </h2>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              Ocorreu uma inconsistência inesperada ao processar os dados em tela: {this.state.errorMessage}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#18181B] text-[#FAFAF8] text-xs font-medium rounded hover:bg-[#C4976A] transition-colors"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ── Funções de Formatação Defensivas (Nunca lançam exceção) ────────
function safeFormatTime(iso?: string | null): string {
  if (!iso) return '--:--'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '--:--'
    return formatTimeDisplay(iso)
  } catch {
    return '--:--'
  }
}

function safeScheduleLabel(iso?: string | null): string {
  if (!iso) return 'Horário a definir'
  try {
    const today = getTodayString()
    const appDate = extractLocalDateString(iso)
    const timeStr = safeFormatTime(iso)

    if (appDate === today) {
      return `Hoje às ${timeStr}`
    }

    // Calcula amanhã com base no fuso local
    const [y, m, d] = today.split('-').map(Number)
    const tomorrow = new Date(y, m - 1, d + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

    if (appDate === tomorrowStr) {
      return `Amanhã às ${timeStr}`
    }

    // Outras datas futuras
    const parts = appDate.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]} às ${timeStr}`
    }

    return timeStr
  } catch {
    return '--:--'
  }
}

function safeFormatWhatsApp(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullNumber}`
}

const STATUS_MAP: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: 'Pendente',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    badge: 'bg-[#FAF3EB] text-[#A26D3B] border-[#EAD7C3]',
    dot: 'bg-[#C4976A]',
  },
  completed: {
    label: 'Concluído',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dot: 'bg-zinc-400',
  },
  no_show: {
    label: 'Não compareceu',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
}

function getStatusMeta(status?: string | null) {
  if (!status) {
    return {
      label: 'Não informado',
      badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      dot: 'bg-zinc-400',
    }
  }

  return (
    STATUS_MAP[status] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      dot: 'bg-zinc-400',
    }
  )
}

// ── Componente Principal do Dashboard ─────────────────────────────
function DashboardContent() {
  const {
    metrics,
    upcomingAppointments,
    clinicSettings,
    state,
    error,
    refetch,
  } = useDashboard()

  const todayStr = getTodayString()
  let todayFormatted = ''
  try {
    todayFormatted = formatDateDisplay(todayStr)
  } catch {
    todayFormatted = todayStr
  }

  const isLoading = state === 'loading'

  // Total histórico para barra de distribuição
  const totalApps = metrics?.totalAppointmentsCount || 0
  const pendingPct = totalApps > 0 ? (metrics.pendingCount / totalApps) * 100 : 0
  const confirmedPct = totalApps > 0 ? (metrics.confirmedCount / totalApps) * 100 : 0
  const completedPct = totalApps > 0 ? (metrics.completedCount / totalApps) * 100 : 0
  const cancelledPct = totalApps > 0 ? (metrics.cancelledCount / totalApps) * 100 : 0
  const noShowPct = totalApps > 0 ? (metrics.noShowCount / totalApps) * 100 : 0

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── 1. HEADER SUPERIOR ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E0D6]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] font-medium">
              Painel Administrativo
            </span>
            {clinicSettings?.booking_enabled !== undefined && (
              <span
                className={[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-medium rounded-full border',
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
                {clinicSettings.booking_enabled ? 'Agendamento online ativo' : 'Agendamento pausado'}
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
              Data de hoje
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
            aria-label="Atualizar dados do dashboard"
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

      {/* Mensagem de Erro Caso Falhe */}
      {state === 'error' && (
        <div className="py-2">
          <ErrorMessage
            message={error || 'Não foi possível carregar as informações do dashboard.'}
            onRetry={refetch}
          />
        </div>
      )}

      {/* ── 2. CARDS PRINCIPAIS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Agendamentos Hoje */}
        <Link
          to="/admin/agenda"
          className={[
            'p-5 sm:p-6 bg-white border rounded shadow-xs flex flex-col justify-between transition-all duration-150 group',
            metrics.todayAppointmentsCount > 0
              ? 'border-[#C4976A] ring-1 ring-[#C4976A]/20'
              : 'border-[#E8E0D6] hover:border-[#C4976A]',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#71717A]">
              Agendamentos hoje
            </span>
            <div className="w-8 h-8 rounded bg-[#F5EFE8] text-[#C4976A] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-9 w-16 bg-[#E8E0D6]/60 rounded animate-pulse" />
            ) : (
              <div>
                <span
                  className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {metrics.todayAppointmentsCount}
                </span>
                <p className="text-xs text-[#71717A] mt-1">
                  Atendimentos marcados para esta data
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Card 2: Pendentes */}
        <Link
          to="/admin/agenda"
          className="p-5 sm:p-6 bg-white border border-[#E8E0D6] hover:border-[#C4976A] rounded shadow-xs flex flex-col justify-between transition-all duration-150 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#71717A]">
              Pendentes
            </span>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-9 w-16 bg-[#E8E0D6]/60 rounded animate-pulse" />
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {metrics.pendingCount}
                  </span>
                  {metrics.pendingCount > 0 && (
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Requer atenção
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#71717A] mt-1">
                  Aguardando confirmação na agenda
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Card 3: Confirmados */}
        <Link
          to="/admin/agenda"
          className="p-5 sm:p-6 bg-white border border-[#E8E0D6] hover:border-[#C4976A] rounded shadow-xs flex flex-col justify-between transition-all duration-150 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#71717A]">
              Confirmados
            </span>
            <div className="w-8 h-8 rounded bg-[#FAF3EB] text-[#C4976A] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-9 w-16 bg-[#E8E0D6]/60 rounded animate-pulse" />
            ) : (
              <div>
                <span
                  className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {metrics.confirmedCount}
                </span>
                <p className="text-xs text-[#71717A] mt-1">
                  Pacientes confirmados no calendário
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Card 4: Clientes */}
        <Link
          to="/admin/clientes"
          className="p-5 sm:p-6 bg-white border border-[#E8E0D6] hover:border-[#C4976A] rounded shadow-xs flex flex-col justify-between transition-all duration-150 group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#71717A]">
              Clientes cadastrados
            </span>
            <div className="w-8 h-8 rounded bg-[#FAFAF8] text-[#71717A] group-hover:text-[#C4976A] flex items-center justify-center shrink-0 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-9 w-16 bg-[#E8E0D6]/60 rounded animate-pulse" />
            ) : (
              <div>
                <span
                  className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {metrics.totalClientsCount}
                </span>
                <p className="text-xs text-[#71717A] mt-1">
                  Base total de pacientes na clínica
                </p>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* ── 3. GRID CENTRAL (PRÓXIMOS ATENDIMENTOS + LATERAL) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna Principal: Próximos Atendimentos (2/3 da largura) */}
        <div className="lg:col-span-2 bg-white border border-[#E8E0D6] rounded shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#E8E0D6] flex items-center justify-between gap-4 bg-[#FAFAF8]">
            <div>
              <h2
                className="font-display text-xl font-normal text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Próximos atendimentos
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Atendimentos futuros com status pendente ou confirmado.
              </p>
            </div>
            <Link
              to="/admin/agenda"
              className="text-xs font-medium text-[#C4976A] hover:text-[#18181B] transition-colors whitespace-nowrap"
            >
              Ver agenda completa →
            </Link>
          </div>

          {/* Estado de Carregamento */}
          {isLoading && (
            <div className="divide-y divide-[#E8E0D6] p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4 animate-pulse">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-[#E8E0D6]/60 rounded" />
                    <div className="h-3 w-28 bg-[#E8E0D6]/40 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-[#E8E0D6]/40 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Estado Sem Dados */}
          {!isLoading && upcomingAppointments.length === 0 && (
            <div className="py-16 px-6 text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-full bg-[#F5EFE8] flex items-center justify-center text-[#C4976A]"
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3
                className="font-display text-lg font-light text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Nenhum atendimento próximo
              </h3>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed">
                Não há atendimentos pendentes ou confirmados agendados para os próximos horários.
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/agenda"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium bg-[#18181B] text-[#FAFAF8] hover:bg-[#C4976A] transition-colors rounded"
                >
                  Abrir Agenda
                </Link>
              </div>
            </div>
          )}

          {/* Lista com Dados Carregados */}
          {!isLoading && upcomingAppointments.length > 0 && (
            <div>
              {/* Tabela para Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAF8] text-[10px] tracking-[0.15em] uppercase text-[#71717A] border-b border-[#E8E0D6]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Horário</th>
                      <th className="py-3 px-6 font-medium">Paciente</th>
                      <th className="py-3 px-6 font-medium">Procedimento</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D6]">
                    {upcomingAppointments.map((app: AdminAppointment) => {
                      const statusMeta = getStatusMeta(app?.status)
                      const waLink = safeFormatWhatsApp(app?.client_phone)

                      return (
                        <tr
                          key={app.appointment_id}
                          className="hover:bg-[#FAFAF8]/80 transition-colors"
                        >
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span className="font-medium text-[#18181B] block">
                              {safeScheduleLabel(app.start_at)}
                            </span>
                            {app.duration_minutes != null && (
                              <span className="text-[11px] text-[#71717A]">
                                {formatDuration(app.duration_minutes)}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-6">
                            <div className="font-medium text-[#18181B]">
                              {app.client_name || 'Paciente sem nome'}
                            </div>
                            {app.client_phone && (
                              <span className="text-xs text-[#71717A]">
                                {app.client_phone}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-6 text-[#18181B]">
                            <span className="line-clamp-1">
                              {app.service_name || 'Procedimento'}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span
                              className={[
                                'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border',
                                statusMeta.badge,
                              ].join(' ')}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                                aria-hidden="true"
                              />
                              {statusMeta.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-3">
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 hover:text-emerald-800 transition-colors text-xs font-medium"
                                  title="WhatsApp"
                                >
                                  WhatsApp
                                </a>
                              )}
                              <Link
                                to="/admin/agenda"
                                className="text-xs font-medium text-[#18181B] hover:text-[#C4976A] transition-colors"
                              >
                                Ver
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards para Mobile (< 640px) */}
              <div className="sm:hidden divide-y divide-[#E8E0D6]">
                {upcomingAppointments.map((app: AdminAppointment) => {
                  const statusMeta = getStatusMeta(app?.status)
                  const waLink = safeFormatWhatsApp(app?.client_phone)

                  return (
                    <div key={app.appointment_id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-[#18181B] block">
                            {safeScheduleLabel(app.start_at)}
                          </span>
                          <h4 className="text-sm font-medium text-[#18181B] mt-0.5">
                            {app.client_name || 'Paciente'}
                          </h4>
                        </div>
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-medium rounded-full border shrink-0',
                            statusMeta.badge,
                          ].join(' ')}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                            aria-hidden="true"
                          />
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#71717A] pt-1">
                        <span className="line-clamp-1">
                          {app.service_name || 'Procedimento'}
                          {app.duration_minutes != null && ` · ${formatDuration(app.duration_minutes)}`}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 font-medium"
                            >
                              WhatsApp
                            </a>
                          )}
                          <Link
                            to="/admin/agenda"
                            className="font-medium text-[#C4976A] hover:text-[#18181B]"
                          >
                            Agenda
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Lateral: Distribuição + Ações Rápidas (1/3 da largura) */}
        <div className="space-y-6">
          {/* Distribuição de Agendamentos */}
          <div className="bg-white border border-[#E8E0D6] rounded p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3
                className="font-display text-lg font-normal text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Distribuição de agendamentos
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Total histórico registrado: {totalApps}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 w-full bg-[#E8E0D6]/60 rounded-full" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-9 bg-[#E8E0D6]/40 rounded" />
                  ))}
                </div>
              </div>
            ) : totalApps === 0 ? (
              <p className="text-xs text-[#71717A] py-4 text-center">
                Nenhum agendamento registrado até o momento.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Barra Proporcional */}
                <div
                  className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden flex"
                  title="Distribuição percentual de status"
                >
                  {confirmedPct > 0 && (
                    <div
                      style={{ width: `${confirmedPct}%` }}
                      className="bg-[#C4976A] transition-all"
                      title={`Confirmados: ${metrics.confirmedCount}`}
                    />
                  )}
                  {pendingPct > 0 && (
                    <div
                      style={{ width: `${pendingPct}%` }}
                      className="bg-amber-400 transition-all"
                      title={`Pendentes: ${metrics.pendingCount}`}
                    />
                  )}
                  {completedPct > 0 && (
                    <div
                      style={{ width: `${completedPct}%` }}
                      className="bg-emerald-500 transition-all"
                      title={`Concluídos: ${metrics.completedCount}`}
                    />
                  )}
                  {cancelledPct > 0 && (
                    <div
                      style={{ width: `${cancelledPct}%` }}
                      className="bg-zinc-300 transition-all"
                      title={`Cancelados: ${metrics.cancelledCount}`}
                    />
                  )}
                  {noShowPct > 0 && (
                    <div
                      style={{ width: `${noShowPct}%` }}
                      className="bg-rose-400 transition-all"
                      title={`Não compareceu: ${metrics.noShowCount}`}
                    />
                  )}
                </div>

                {/* Grade de Contadores por Status */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#FAFAF8] border border-[#E8E0D6]/70 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C4976A]" />
                      <span className="text-[#71717A]">Confirmados</span>
                    </div>
                    <span className="font-semibold text-[#18181B]">{metrics.confirmedCount}</span>
                  </div>

                  <div className="p-2 bg-[#FAFAF8] border border-[#E8E0D6]/70 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[#71717A]">Pendentes</span>
                    </div>
                    <span className="font-semibold text-[#18181B]">{metrics.pendingCount}</span>
                  </div>

                  <div className="p-2 bg-[#FAFAF8] border border-[#E8E0D6]/70 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="text-[#71717A]">Concluídos</span>
                    </div>
                    <span className="font-semibold text-[#18181B]">{metrics.completedCount}</span>
                  </div>

                  <div className="p-2 bg-[#FAFAF8] border border-[#E8E0D6]/70 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-400" />
                      <span className="text-[#71717A]">Cancelados</span>
                    </div>
                    <span className="font-semibold text-[#18181B]">{metrics.cancelledCount}</span>
                  </div>

                  {metrics.noShowCount > 0 && (
                    <div className="p-2 bg-[#FAFAF8] border border-[#E8E0D6]/70 rounded flex items-center justify-between col-span-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[#71717A]">Não compareceu</span>
                      </div>
                      <span className="font-semibold text-[#18181B]">{metrics.noShowCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white border border-[#E8E0D6] rounded p-5 sm:p-6 shadow-xs space-y-3">
            <div>
              <h3
                className="font-display text-lg font-normal text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ações rápidas
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Navegação direta para as seções administrativas.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <Link
                to="/admin/agenda"
                className="p-2.5 rounded border border-transparent hover:border-[#E8E0D6] hover:bg-[#FAFAF8] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F5EFE8] text-[#C4976A] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#18181B] block group-hover:text-[#C4976A] transition-colors">
                      Agenda
                    </span>
                    <span className="text-[10px] text-[#71717A] block">
                      Consultar e gerenciar atendimentos
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#71717A] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                to="/admin/clientes"
                className="p-2.5 rounded border border-transparent hover:border-[#E8E0D6] hover:bg-[#FAFAF8] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F5EFE8] text-[#C4976A] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#18181B] block group-hover:text-[#C4976A] transition-colors">
                      Clientes
                    </span>
                    <span className="text-[10px] text-[#71717A] block">
                      Cadastrar pacientes e histórico
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#71717A] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                to="/admin/servicos"
                className="p-2.5 rounded border border-transparent hover:border-[#E8E0D6] hover:bg-[#FAFAF8] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F5EFE8] text-[#C4976A] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#18181B] block group-hover:text-[#C4976A] transition-colors">
                      Serviços
                    </span>
                    <span className="text-[10px] text-[#71717A] block">
                      Procedimentos, valores e durações
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#71717A] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                to="/admin/configuracoes"
                className="p-2.5 rounded border border-transparent hover:border-[#E8E0D6] hover:bg-[#FAFAF8] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F5EFE8] text-[#C4976A] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#18181B] block group-hover:text-[#C4976A] transition-colors">
                      Configurações
                    </span>
                    <span className="text-[10px] text-[#71717A] block">
                      Nome da clínica e status online
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#71717A] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  )
}
