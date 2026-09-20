import { useState, useMemo, useCallback } from 'react'
import type { AdminAppointment, AppointmentStatus } from '@/types'
import { useAdminAppointments } from '@/hooks/useAdminAppointments'
import {
  formatDateDisplay,
  formatTimeDisplay,
  getTodayString,
  formatDuration,
} from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

type FilterStatus = 'all' | AppointmentStatus

const STATUS_CONFIG: Record<
  AppointmentStatus,
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
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  const ny = date.getFullYear()
  const nm = String(date.getMonth() + 1).padStart(2, '0')
  const nd = String(date.getDate()).padStart(2, '0')
  return `${ny}-${nm}-${nd}`
}

function extractLocalDateString(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullNumber}`
}

export default function AdminAgenda() {
  const { appointments, state, error, refetch, updateStatus } = useAdminAppointments()

  // Navegação por dia (padrão: hoje)
  const today = useMemo(() => getTodayString(), [])
  const [selectedDate, setSelectedDate] = useState<string>(today)

  // Filtros de status e busca
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  // Modal de Detalhes
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null)

  // Feedback de ações
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }, [])

  // Atualização de status
  async function handleStatusChange(
    appointment: AdminAppointment,
    newStatus: AppointmentStatus
  ) {
    setUpdatingId(appointment.appointment_id)
    setActionError(null)

    try {
      await updateStatus(appointment.appointment_id, newStatus)
      const label = STATUS_CONFIG[newStatus].label.toLowerCase()
      showToast(`Agendamento de "${appointment.client_name}" marcado como ${label}.`)

      // Se o modal estiver aberto para esse agendamento, atualiza os dados locais do modal
      setSelectedAppointment((prev) =>
        prev && prev.appointment_id === appointment.appointment_id
          ? { ...prev, status: newStatus }
          : prev
      )
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setUpdatingId(null)
    }
  }

  // Agendamentos do dia selecionado
  const dayAppointments = useMemo(() => {
    return appointments.filter(
      (app) => extractLocalDateString(app.start_at) === selectedDate
    )
  }, [appointments, selectedDate])

  // Contadores por status no dia selecionado
  const counts = useMemo(() => {
    return {
      all: dayAppointments.length,
      pending: dayAppointments.filter((a) => a.status === 'pending').length,
      confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
      completed: dayAppointments.filter((a) => a.status === 'completed').length,
      cancelled: dayAppointments.filter((a) => a.status === 'cancelled').length,
    }
  }, [dayAppointments])

  // Agendamentos filtrados por status e busca
  const filteredAppointments = useMemo(() => {
    return dayAppointments
      .filter((app) => {
        // Filtro de status
        if (statusFilter !== 'all' && app.status !== statusFilter) {
          return false
        }

        // Filtro de busca
        if (search.trim()) {
          const q = search.toLowerCase().trim()
          const matchClient = app.client_name.toLowerCase().includes(q)
          const matchService = app.service_name.toLowerCase().includes(q)
          const matchPhone = app.client_phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
          const matchEmail = (app.client_email || '').toLowerCase().includes(q)
          if (!matchClient && !matchService && !matchPhone && !matchEmail) {
            return false
          }
        }

        return true
      })
      .sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      )
  }, [dayAppointments, statusFilter, search])

  const isToday = selectedDate === today

  return (
    <div className="p-6 sm:p-10 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Toast flutuante de sucesso */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-[#FAFAF8] px-5 py-3 rounded shadow-lg flex items-center gap-3 border border-[#C4976A] text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#C4976A]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#A1A1AA] hover:text-[#FAFAF8] ml-2 text-xs"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* Alerta de erro de ação */}
      {actionError && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded flex items-center justify-between"
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-4 text-xs"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E0D6]">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] mb-1 font-medium">
            Painel Administrativo
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Agenda de Atendimentos
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            Acompanhe e gerencie a programação de consultas e procedimentos da clínica por dia.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 text-xs font-medium border border-[#E8E0D6] bg-white text-[#18181B] hover:bg-[#FAFAF8] transition-colors rounded-sm flex items-center gap-1.5"
            title="Atualizar agendamentos"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={state === 'loading' ? 'animate-spin text-[#C4976A]' : 'text-[#71717A]'}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Barra de Navegação por Dia */}
      <div className="bg-[#FAFAF8] border border-[#E8E0D6] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Controles de Navegação Anterior / Hoje / Próximo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate((prev) => shiftDate(prev, -1))}
            className="p-2 border border-[#E8E0D6] bg-white text-[#18181B] hover:border-[#C4976A] hover:text-[#C4976A] transition-colors rounded-sm"
            title="Dia anterior"
            aria-label="Dia anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={() => setSelectedDate(today)}
            className={[
              'px-4 py-2 text-xs font-medium border transition-colors rounded-sm',
              isToday
                ? 'bg-[#18181B] text-[#FAFAF8] border-[#18181B]'
                : 'bg-white text-[#71717A] border-[#E8E0D6] hover:text-[#18181B] hover:border-[#18181B]',
            ].join(' ')}
          >
            Hoje
          </button>

          <button
            onClick={() => setSelectedDate((prev) => shiftDate(prev, 1))}
            className="p-2 border border-[#E8E0D6] bg-white text-[#18181B] hover:border-[#C4976A] hover:text-[#C4976A] transition-colors rounded-sm"
            title="Próximo dia"
            aria-label="Próximo dia"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Informação da Data Atual e Seletor de Calendário */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-left md:text-right">
            <span className="block text-xs uppercase tracking-[0.1em] text-[#C4976A] font-medium">
              {isToday ? 'Hoje' : 'Data selecionada'}
            </span>
            <span
              className="text-base sm:text-lg font-normal text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatDateDisplay(selectedDate)}
            </span>
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value)
                }
              }}
              className="px-3 py-2 text-xs border border-[#E8E0D6] bg-white text-[#18181B] focus:outline-none focus:border-[#C4976A] rounded-sm cursor-pointer"
              aria-label="Selecionar data no calendário"
            />
          </div>
        </div>
      </div>

      {/* Estados de Carregamento e Erro Inicial */}
      {state === 'loading' && appointments.length === 0 && (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando agendamentos da clínica…" />
        </div>
      )}

      {state === 'error' && appointments.length === 0 && (
        <div className="py-12">
          <ErrorMessage
            message={getFriendlyError(error ?? '')}
            onRetry={refetch}
          />
        </div>
      )}

      {/* Área Principal de Conteúdo */}
      {(state === 'success' || appointments.length > 0) && (
        <div className="space-y-6">
          {/* Barra de Filtros: Status Tabs + Busca */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Tabs de Status */}
            <div className="flex flex-wrap items-center gap-1 bg-[#EAE8E3] p-1 rounded-sm">
              <button
                onClick={() => setStatusFilter('all')}
                className={[
                  'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                  statusFilter === 'all'
                    ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                    : 'text-[#71717A] hover:text-[#18181B]',
                ].join(' ')}
              >
                Todos ({counts.all})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={[
                  'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                  statusFilter === 'pending'
                    ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                    : 'text-[#71717A] hover:text-[#18181B]',
                ].join(' ')}
              >
                Pendentes ({counts.pending})
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={[
                  'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                  statusFilter === 'confirmed'
                    ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                    : 'text-[#71717A] hover:text-[#18181B]',
                ].join(' ')}
              >
                Confirmados ({counts.confirmed})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={[
                  'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                  statusFilter === 'completed'
                    ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                    : 'text-[#71717A] hover:text-[#18181B]',
                ].join(' ')}
              >
                Concluídos ({counts.completed})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={[
                  'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                  statusFilter === 'cancelled'
                    ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                    : 'text-[#71717A] hover:text-[#18181B]',
                ].join(' ')}
              >
                Cancelados ({counts.cancelled})
              </button>
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#A1A1AA] pointer-events-none">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar paciente, serviço ou telefone…"
                className="w-full pl-9 pr-8 py-2 text-xs border border-[#E8E0D6] bg-white text-[#18181B] focus:outline-none focus:border-[#C4976A] transition-colors rounded-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-3 flex items-center text-xs text-[#A1A1AA] hover:text-[#18181B]"
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Listagem de Agendamentos */}
          {dayAppointments.length === 0 ? (
            /* Estado Vazio do Dia */
            <div className="bg-[#FAFAF8] border border-[#E8E0D6] p-12 sm:p-16 text-center max-w-2xl mx-auto space-y-5">
              <div className="w-14 h-14 mx-auto border border-[#C4976A] flex items-center justify-center text-[#C4976A]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h2
                  className="font-display text-2xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Nenhum agendamento para este dia
                </h2>
                <p className="text-sm text-[#71717A] max-w-md mx-auto leading-relaxed">
                  Não há consultas ou procedimentos programados para{' '}
                  <strong className="text-[#18181B] font-medium">{formatDateDisplay(selectedDate)}</strong>.
                </p>
              </div>
              {!isToday && (
                <div className="pt-2">
                  <Button onClick={() => setSelectedDate(today)} variant="secondary" size="sm">
                    Ir para hoje
                  </Button>
                </div>
              )}
            </div>
          ) : filteredAppointments.length === 0 ? (
            /* Estado Vazio por Filtro / Busca */
            <div className="p-12 text-center border border-dashed border-[#E8E0D6] bg-[#FAFAF8] space-y-3">
              <p className="text-sm text-[#71717A]">
                Nenhum agendamento encontrado para os filtros selecionados neste dia.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
                className="text-xs text-[#C4976A] underline underline-offset-4 hover:text-[#18181B]"
              >
                Limpar filtros de status e busca
              </button>
            </div>
          ) : (
            /* Lista de Cards de Agendamentos */
            <div className="space-y-4">
              {filteredAppointments.map((app) => {
                const isUpdating = updatingId === app.appointment_id
                const statusMeta = STATUS_CONFIG[app.status]

                return (
                  <div
                    key={app.appointment_id}
                    className="bg-[#FAFAF8] border border-[#E8E0D6] hover:border-[#C4976A] transition-all p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    {/* Linha Superior: Horário, Procedimento e Badge de Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E0D6]">
                      <div className="flex items-center gap-3">
                        {/* Horário */}
                        <div className="bg-[#18181B] text-[#FAFAF8] px-3 py-1.5 rounded-sm text-center shrink-0">
                          <span className="font-mono text-sm font-medium tracking-tight">
                            {formatTimeDisplay(app.start_at)}
                          </span>
                          <span className="text-[10px] text-[#A1A1AA] block leading-none mt-0.5">
                            até {formatTimeDisplay(app.end_at)}
                          </span>
                        </div>

                        {/* Nome do Serviço e Duração */}
                        <div>
                          <h3
                            className="font-display text-xl font-light text-[#18181B]"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {app.service_name}
                          </h3>
                          <span className="text-xs text-[#71717A]">
                            Duração: {formatDuration(app.duration_minutes)}
                          </span>
                        </div>
                      </div>

                      {/* Badge de Status */}
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium tracking-wide rounded-full border',
                            statusMeta.badge,
                          ].join(' ')}
                        >
                          <span className={['w-1.5 h-1.5 rounded-full', statusMeta.dot].join(' ')} />
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    {/* Informações do Paciente e Observações */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
                          Paciente
                        </span>
                        <span className="text-sm font-medium text-[#18181B] block">
                          {app.client_name}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
                          Contato
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#18181B] font-mono">
                            {app.client_phone}
                          </span>
                          <a
                            href={formatWhatsAppLink(app.client_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#C4976A] hover:text-[#18181B] font-medium inline-flex items-center gap-1 transition-colors"
                            title="Conversar pelo WhatsApp"
                          >
                            <span>WhatsApp</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                        {app.client_email && (
                          <span className="text-xs text-[#71717A] block mt-0.5">
                            {app.client_email}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
                          Observações
                        </span>
                        {app.notes ? (
                          <p className="text-xs text-[#18181B] italic bg-[#F5EFE8] p-2 rounded border border-[#E8E0D6] line-clamp-2">
                            "{app.notes}"
                          </p>
                        ) : (
                          <span className="text-xs text-[#A1A1AA]">
                            Nenhuma observação registrada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações Rápidas de Transição de Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E0D6]">
                      <button
                        onClick={() => setSelectedAppointment(app)}
                        className="text-xs text-[#71717A] hover:text-[#18181B] underline underline-offset-4 transition-colors"
                      >
                        Ver detalhes completos
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Ações para Status: Pendente */}
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app, 'confirmed')}
                              disabled={isUpdating}
                              className="px-3.5 py-1.5 text-xs font-medium bg-[#18181B] text-[#FAFAF8] hover:bg-[#C4976A] transition-colors rounded-sm disabled:opacity-50"
                            >
                              {isUpdating ? 'Salvando…' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(app, 'cancelled')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 text-xs font-medium border border-[#E8E0D6] text-zinc-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors rounded-sm disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {/* Ações para Status: Confirmado */}
                        {app.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app, 'completed')}
                              disabled={isUpdating}
                              className="px-3.5 py-1.5 text-xs font-medium bg-emerald-700 text-[#FAFAF8] hover:bg-emerald-800 transition-colors rounded-sm disabled:opacity-50"
                            >
                              {isUpdating ? 'Salvando…' : 'Concluir'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(app, 'cancelled')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 text-xs font-medium border border-[#E8E0D6] text-zinc-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors rounded-sm disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {/* Ações para Status: Concluído */}
                        {app.status === 'completed' && (
                          <button
                            onClick={() => handleStatusChange(app, 'confirmed')}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-xs font-medium border border-[#E8E0D6] text-[#71717A] hover:text-[#18181B] hover:border-[#18181B] transition-colors rounded-sm disabled:opacity-50"
                            title="Reabrir agendamento como confirmado"
                          >
                            {isUpdating ? 'Salvando…' : 'Reabrir como confirmado'}
                          </button>
                        )}

                        {/* Ações para Status: Cancelado */}
                        {app.status === 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(app, 'pending')}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-xs font-medium border border-[#E8E0D6] text-[#71717A] hover:text-[#18181B] hover:border-[#18181B] transition-colors rounded-sm disabled:opacity-50"
                            title="Reativar agendamento como pendente"
                          >
                            {isUpdating ? 'Salvando…' : 'Reativar como pendente'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes do Agendamento */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-[#FAFAF8] border border-[#E8E0D6] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E0D6]">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] font-medium block mb-1">
                  Detalhes do Agendamento
                </span>
                <h2
                  className="font-display text-2xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {selectedAppointment.service_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-[#A1A1AA] hover:text-[#18181B] p-1.5 text-sm"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            {/* Informações Estruturadas */}
            <div className="space-y-4 text-xs">
              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-white border border-[#E8E0D6]">
                <span className="text-[#71717A]">Status atual:</span>
                <span
                  className={[
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border',
                    STATUS_CONFIG[selectedAppointment.status].badge,
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-1.5 h-1.5 rounded-full',
                      STATUS_CONFIG[selectedAppointment.status].dot,
                    ].join(' ')}
                  />
                  {STATUS_CONFIG[selectedAppointment.status].label}
                </span>
              </div>

              {/* Horário & Duração */}
              <div className="p-4 bg-white border border-[#E8E0D6] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Data:</span>
                  <span className="font-medium text-[#18181B]">
                    {formatDateDisplay(extractLocalDateString(selectedAppointment.start_at))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Horário:</span>
                  <span className="font-mono font-medium text-[#18181B]">
                    {formatTimeDisplay(selectedAppointment.start_at)} às{' '}
                    {formatTimeDisplay(selectedAppointment.end_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Duração prevista:</span>
                  <span className="text-[#18181B]">
                    {formatDuration(selectedAppointment.duration_minutes)}
                  </span>
                </div>
              </div>

              {/* Paciente */}
              <div className="p-4 bg-white border border-[#E8E0D6] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Paciente:</span>
                  <span className="font-medium text-[#18181B]">
                    {selectedAppointment.client_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717A]">Telefone / WhatsApp:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#18181B]">
                      {selectedAppointment.client_phone}
                    </span>
                    <a
                      href={formatWhatsAppLink(selectedAppointment.client_phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C4976A] hover:underline"
                    >
                      Abrir conversa
                    </a>
                  </div>
                </div>
                {selectedAppointment.client_email && (
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">E-mail:</span>
                    <span className="text-[#18181B]">
                      {selectedAppointment.client_email}
                    </span>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="p-4 bg-white border border-[#E8E0D6] space-y-1">
                <span className="text-[#71717A] block mb-1">Notas do paciente:</span>
                {selectedAppointment.notes ? (
                  <p className="text-[#18181B] italic bg-[#F5EFE8] p-3 rounded border border-[#E8E0D6] leading-relaxed">
                    "{selectedAppointment.notes}"
                  </p>
                ) : (
                  <p className="text-[#A1A1AA] italic">Nenhuma observação informada.</p>
                )}
              </div>

              {/* Dados Técnicos */}
              <div className="pt-2 text-[10px] text-[#A1A1AA] space-y-1 border-t border-[#E8E0D6]">
                <div>ID: {selectedAppointment.appointment_id}</div>
                <div>
                  Registrado em:{' '}
                  {formatDateDisplay(extractLocalDateString(selectedAppointment.created_at))} às{' '}
                  {formatTimeDisplay(selectedAppointment.created_at)}
                </div>
              </div>
            </div>

            {/* Ações dentro do Modal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-[#E8E0D6]">
              {selectedAppointment.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleStatusChange(selectedAppointment, 'confirmed')}
                    size="sm"
                  >
                    Confirmar agendamento
                  </Button>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment, 'cancelled')}
                    className="px-4 py-2 text-xs font-medium border border-red-300 text-red-700 hover:bg-red-50 transition-colors rounded-sm"
                  >
                    Cancelar agendamento
                  </button>
                </>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment, 'completed')}
                    className="px-4 py-2 text-xs font-medium bg-emerald-700 text-[#FAFAF8] hover:bg-emerald-800 transition-colors rounded-sm"
                  >
                    Marcar como concluído
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment, 'cancelled')}
                    className="px-4 py-2 text-xs font-medium border border-red-300 text-red-700 hover:bg-red-50 transition-colors rounded-sm"
                  >
                    Cancelar agendamento
                  </button>
                </>
              )}

              {selectedAppointment.status === 'completed' && (
                <button
                  onClick={() => handleStatusChange(selectedAppointment, 'confirmed')}
                  className="px-4 py-2 text-xs font-medium border border-[#E8E0D6] text-[#18181B] hover:bg-white transition-colors rounded-sm"
                >
                  Reabrir como confirmado
                </button>
              )}

              {selectedAppointment.status === 'cancelled' && (
                <button
                  onClick={() => handleStatusChange(selectedAppointment, 'pending')}
                  className="px-4 py-2 text-xs font-medium border border-[#E8E0D6] text-[#18181B] hover:bg-white transition-colors rounded-sm"
                >
                  Reativar como pendente
                </button>
              )}

              <Button
                onClick={() => setSelectedAppointment(null)}
                variant="secondary"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
