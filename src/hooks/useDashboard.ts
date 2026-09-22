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
 * Mantém paridade estrita com o padrão utilizado em Agenda.tsx.
 */
export function extractLocalDateString(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
      const [appointmentsData, clientsData, settingsData] = await Promise.all([
        getAppointmentsAdmin(),
        getClientsAdmin(),
        getClinicSettings(),
      ])

      setAppointments(appointmentsData)
      setClients(clientsData)
      setClinicSettings(settingsData)
      setState('success')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível carregar os dados do painel.'
      )
      setState('error')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Cálculo das métricas gerais
  const metrics = useMemo<DashboardMetrics>(() => {
    const today = getTodayString()

    const todayAppointments = appointments.filter(
      (a) => extractLocalDateString(a.start_at) === today
    )

    const pending = appointments.filter((a) => a.status === 'pending')
    const confirmed = appointments.filter((a) => a.status === 'confirmed')
    const completed = appointments.filter((a) => a.status === 'completed')
    const cancelled = appointments.filter((a) => a.status === 'cancelled')
    const noShow = appointments.filter((a) => (a.status as string) === 'no_show')

    return {
      todayAppointmentsCount: todayAppointments.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      totalClientsCount: clients.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      noShowCount: noShow.length,
      totalAppointmentsCount: appointments.length,
    }
  }, [appointments, clients])

  // Filtro de próximos atendimentos relevantes (somente 'pending' ou 'confirmed')
  const upcomingAppointments = useMemo<AdminAppointment[]>(() => {
    const today = getTodayString()
    const nowTimestamp = Date.now()

    // Filtra agendamentos relevantes futuros ou de hoje com status ativo
    const activeAppointments = appointments.filter((a) => {
      const isRelevantStatus = a.status === 'pending' || a.status === 'confirmed'
      if (!isRelevantStatus) return false

      const appDateStr = extractLocalDateString(a.start_at)
      const appStartTime = new Date(a.start_at).getTime()

      // Inclui agendamentos de hoje (mesmo se recém-iniciados) ou de datas futuras
      return appDateStr >= today || appStartTime >= nowTimestamp - 30 * 60 * 1000
    })

    // Ordena do mais próximo para o mais distante no tempo
    activeAppointments.sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    )

    return activeAppointments.slice(0, 6)
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
