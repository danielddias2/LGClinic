import { useState, useEffect, useCallback } from 'react'
import { getAppointmentsAdmin, updateAppointmentStatus } from '@/services/clinicService'
import type { AdminAppointment, AppointmentStatus, LoadingState } from '@/types'

interface UseAdminAppointmentsResult {
  appointments: AdminAppointment[]
  loading: boolean
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
  setAppointments: React.Dispatch<React.SetStateAction<AdminAppointment[]>>
  updateStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>
}

/**
 * Hook para buscar e gerenciar todos os agendamentos na área administrativa.
 * Conectado exclusivamente às RPCs get_appointments_admin e update_appointment_status.
 */
export function useAdminAppointments(): UseAdminAppointmentsResult {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [state, setState]               = useState<LoadingState>('idle')
  const [error, setError]               = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await getAppointmentsAdmin()
      setAppointments(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos')
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = useCallback(
    async (appointmentId: string, status: AppointmentStatus) => {
      await updateAppointmentStatus(appointmentId, status)
      setAppointments((prev) =>
        prev.map((app) =>
          app.appointment_id === appointmentId ? { ...app, status } : app
        )
      )
    },
    []
  )

  return {
    appointments,
    loading: state === 'loading',
    state,
    error,
    refetch: load,
    setAppointments,
    updateStatus,
  }
}
