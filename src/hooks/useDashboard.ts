import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getAppointmentsAdmin,
  getClientsAdmin,
  getClinicSettings,
} from '@/services/clinicService'
import type {
  AdminAppointment,
  AdminClient,
  ClinicSettings,
  DashboardMetrics,
  LoadingState,
} from '@/types'
import { getTodayString } from '@/utils/formatters'

/**
 * Extrai a data local no formato 'YYYY-MM-DD' a partir de um timestamp ISO/timestamptz.
 * Protegido contra valores nulos, vazios ou inválidos (nunca lança exceção).
 */
export function extractLocalDateString(iso?: string | null): string {
  if (!iso || typeof iso !== 'string') return ''
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

export interface UseDashboardResult {
  metrics: DashboardMetrics
  upcomingAppointments: AdminAppointment[]
  clinicSettings: ClinicSettings | null
  totalClients: AdminClient[]
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardResult {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [clients, setClients] = useState<AdminClient[]>([])
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null)
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setState('loading')
    setError(null)

    try {
      // Executa as consultas com allSettled para evitar que a falha de uma derrube as outras
      const [appointmentsResult, clientsResult, settingsResult] =
        await Promise.allSettled([
          getAppointmentsAdmin(),
          getClientsAdmin(),
          getClinicSettings(),
        ])

      let hasAnySuccess = false
      const errorMessages: string[] = []

      // 1. Agendamentos
      if (appointmentsResult.status === 'fulfilled') {
        const raw = appointmentsResult.value
        setAppointments(Array.isArray(raw) ? raw : [])
        hasAnySuccess = true
      } else {
        console.error(
          '[LG Clinic Dashboard] Erro ao carregar agendamentos:',
          appointmentsResult.reason
        )
        errorMessages.push('agendamentos')
      }

      // 2. Clientes
      if (clientsResult.status === 'fulfilled') {
        const raw = clientsResult.value
        setClients(Array.isArray(raw) ? raw : [])
        hasAnySuccess = true
      } else {
        console.error(
          '[LG Clinic Dashboard] Erro ao carregar clientes:',
          clientsResult.reason
        )
        errorMessages.push('clientes')
      }

      // 3. Configurações da Clínica
      if (settingsResult.status === 'fulfilled') {
        setClinicSettings(settingsResult.value ?? null)
        hasAnySuccess = true
      } else {
        console.error(
          '[LG Clinic Dashboard] Erro ao carregar configurações:',
          settingsResult.reason
        )
        errorMessages.push('configurações')
      }

      // Se ao menos uma consulta teve sucesso, o painel renderiza normalmente
      if (hasAnySuccess) {
        setState('success')
        if (errorMessages.length > 0) {
          setError(
            `Aviso: Não foi possível sincronizar todos os dados (${errorMessages.join(', ')}).`
          )
        }
      } else {
        setState('error')
        setError('Não foi possível conectar aos serviços do Supabase. Verifique sua conexão e credenciais.')
      }
    } catch (err) {
      console.error('[LG Clinic Dashboard] Erro inesperado no ciclo de carga:', err)
      setState('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado ao carregar o dashboard.'
      )
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Cálculo de métricas gerais (100% resiliente a dados nulos)
  const metrics = useMemo<DashboardMetrics>(() => {
    const today = getTodayString()

    if (!Array.isArray(appointments)) {
      return {
        todayAppointmentsCount: 0,
        pendingCount: 0,
        confirmedCount: 0,
        totalClientsCount: Array.isArray(clients) ? clients.length : 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
        totalAppointmentsCount: 0,
      }
    }

    const todayAppointments = appointments.filter((a) => {
      if (!a || !a.start_at) return false
      return extractLocalDateString(a.start_at) === today
    })

    const pending = appointments.filter((a) => a?.status === 'pending')
    const confirmed = appointments.filter((a) => a?.status === 'confirmed')
    const completed = appointments.filter((a) => a?.status === 'completed')
    const cancelled = appointments.filter((a) => a?.status === 'cancelled')
    const noShow = appointments.filter((a) => (a?.status as string) === 'no_show')

    return {
      todayAppointmentsCount: todayAppointments.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      totalClientsCount: Array.isArray(clients) ? clients.length : 0,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      noShowCount: noShow.length,
      totalAppointmentsCount: appointments.length,
    }
  }, [appointments, clients])

  // Filtro de próximos atendimentos relevantes:
  // Regra: status ∈ {pending, confirmed} AND start_at > agora
  const upcomingAppointments = useMemo<AdminAppointment[]>(() => {
    if (!Array.isArray(appointments) || appointments.length === 0) return []

    const now = Date.now()

    const activeList = appointments.filter((a) => {
      if (!a || !a.start_at) return false

      // Somente status 'pending' ou 'confirmed' conforme especificação
      const isPendingOrConfirmed = a.status === 'pending' || a.status === 'confirmed'
      if (!isPendingOrConfirmed) return false

      const appStartTime = new Date(a.start_at).getTime()
      if (isNaN(appStartTime)) return false

      // Somente agendamentos que ainda acontecerão a partir do momento atual (start_at > agora)
      return appStartTime > now
    })

    // Ordenação cronológica crescente (do mais próximo para o futuro: start_at ASC)
    activeList.sort((a, b) => {
      const timeA = new Date(a.start_at).getTime()
      const timeB = new Date(b.start_at).getTime()
      return timeA - timeB
    })

    return activeList.slice(0, 6)
  }, [appointments])

  return {
    metrics,
    upcomingAppointments,
    clinicSettings,
    totalClients: clients,
    state,
    error,
    refetch: loadData,
  }
}
