import { Link } from 'react-router-dom'
import type { AdminAppointment, ExtendedAppointmentStatus } from '@/types'
import {
  formatTimeDisplay,
  formatDuration,
  getTodayString,
} from '@/utils/formatters'
import { extractLocalDateString } from '@/hooks/useDashboard'

interface UpcomingAppointmentsProps {
  appointments: AdminAppointment[]
  isLoading?: boolean
}

const STATUS_MAP: Record<
  ExtendedAppointmentStatus,
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

function formatWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullNumber}`
}

function formatScheduleRelative(iso: string): string {
  const today = getTodayString()
  const appointmentDate = extractLocalDateString(iso)
  const timeStr = formatTimeDisplay(iso)

  if (appointmentDate === today) {
    return `Hoje às ${timeStr}`
  }

  // Se for amanhã
  const [y, m, d] = today.split('-').map(Number)
  const tomorrowDate = new Date(y, m - 1, d + 1)
  const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`

  if (appointmentDate === tomorrowStr) {
    return `Amanhã às ${timeStr}`
  }

  // Outra data futura
  const [, appMonth, appDay] = appointmentDate.split('-')
  return `${appDay}/${appMonth} às ${timeStr}`
}

export default function UpcomingAppointments({
  appointments,
  isLoading = false,
}: UpcomingAppointmentsProps) {
  return (
    <div className="bg-white border border-[#E8E0D6] rounded shadow-xs overflow-hidden flex flex-col h-full">
      {/* Cabeçalho da Seção */}
      <div className="p-5 sm:p-6 border-b border-[#E8E0D6] flex items-center justify-between gap-4 bg-[#FAFAF8]">
        <div>
          <h2
            className="font-display text-xl font-normal text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Próximos atendimentos
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Atendimentos agendados com status pendente ou confirmado.
          </p>
        </div>
        <Link
          to="/admin/agenda"
          className="text-xs font-medium text-[#C4976A] hover:text-[#18181B] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:underline"
        >
          Ver agenda completa →
        </Link>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="divide-y divide-[#E8E0D6] p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-40 bg-[#E8E0D6]/60 rounded" />
                  <div className="h-3 w-28 bg-[#E8E0D6]/40 rounded" />
                </div>
                <div className="h-6 w-20 bg-[#E8E0D6]/40 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && appointments.length === 0 && (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F5EFE8] flex items-center justify-center text-[#C4976A]" aria-hidden="true">
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
              Não há atendimentos pendentes ou confirmados nos horários subsequentes.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/agenda"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium bg-[#18181B] text-[#FAFAF8] hover:bg-[#C4976A] transition-colors rounded"
              >
                Gerenciar Agenda
              </Link>
            </div>
          </div>
        )}

        {/* Lista de Atendimentos */}
        {!isLoading && appointments.length > 0 && (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAFAF8] text-[10px] tracking-[0.15em] uppercase text-[#71717A] border-b border-[#E8E0D6]">
                  <tr>
                    <th className="py-3 px-6 font-medium">Horário</th>
                    <th className="py-3 px-6 font-medium">Paciente</th>
                    <th className="py-3 px-6 font-medium">Procedimento</th>
                    <th className="py-3 px-6 font-medium">Status</th>
                    <th className="py-3 px-6 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D6]">
                  {appointments.map((app) => {
                    const statusCfg = STATUS_MAP[app.status as ExtendedAppointmentStatus] || {
                      label: app.status,
                      badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
                      dot: 'bg-zinc-400',
                    }

                    return (
                      <tr
                        key={app.appointment_id}
                        className="hover:bg-[#FAFAF8]/80 transition-colors"
                      >
                        {/* Horário */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className="font-medium text-[#18181B] block">
                            {formatScheduleRelative(app.start_at)}
                          </span>
                          {app.duration_minutes != null && (
                            <span className="text-[11px] text-[#71717A]">
                              {formatDuration(app.duration_minutes)}
                            </span>
                          )}
                        </td>

                        {/* Cliente */}
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

                        {/* Serviço */}
                        <td className="py-3.5 px-6 text-[#18181B]">
                          <span className="line-clamp-1">
                            {app.service_name || 'Procedimento'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span
                            className={[
                              'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border',
                              statusCfg.badge,
                            ].join(' ')}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                              aria-hidden="true"
                            />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3">
                            {app.client_phone && (
                              <a
                                href={formatWhatsAppLink(app.client_phone)}
                                target="_blank"
                                rel="noreferrer"
                                title="Abrir WhatsApp com paciente"
                                className="text-emerald-700 hover:text-emerald-800 transition-colors p-1"
                                aria-label={`Enviar mensagem para ${app.client_name}`}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.216 8.216 0 0 1-1.26-4.47c0-4.54 3.7-8.24 8.24-8.24m4.53 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.31" />
                                </svg>
                              </a>
                            )}
                            <Link
                              to="/admin/agenda"
                              className="text-xs font-medium text-[#18181B] hover:text-[#C4976A] transition-colors"
                            >
                              Ver na agenda
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[#E8E0D6]">
              {appointments.map((app) => {
                const statusCfg = STATUS_MAP[app.status as ExtendedAppointmentStatus] || {
                  label: app.status,
                  badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
                  dot: 'bg-zinc-400',
                }

                return (
                  <div key={app.appointment_id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#18181B] block">
                          {formatScheduleRelative(app.start_at)}
                        </span>
                        <h4 className="text-sm font-medium text-[#18181B] mt-0.5">
                          {app.client_name || 'Paciente'}
                        </h4>
                      </div>
                      <span
                        className={[
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-medium rounded-full border shrink-0',
                          statusCfg.badge,
                        ].join(' ')}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                          aria-hidden="true"
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#71717A] pt-1">
                      <span className="line-clamp-1">
                        {app.service_name}
                        {app.duration_minutes != null && ` · ${formatDuration(app.duration_minutes)}`}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        {app.client_phone && (
                          <a
                            href={formatWhatsAppLink(app.client_phone)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:text-emerald-800"
                            aria-label="WhatsApp"
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
    </div>
  )
}
