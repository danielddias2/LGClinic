import { useEffect, useState, useCallback } from 'react'
import { getAvailableSlots } from '@/services/clinicService'
import type { AvailableSlot, LoadingState } from '@/types'

interface UseAvailableSlotsResult {
  slots: AvailableSlot[]
  state: LoadingState
  error: string | null
  refetch: () => void
}

/**
 * Busca horários disponíveis para um serviço em uma data específica.
 * Re-busca automaticamente quando serviceId ou date mudam.
 * A disponibilidade é determinada exclusivamente pelo backend.
 */
export function useAvailableSlots(
  serviceId: string,
  date: string,
): UseAvailableSlotsResult {
  const [slots, setSlots]   = useState<AvailableSlot[]>([])
  const [state, setState]   = useState<LoadingState>('idle')
  const [error, setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!serviceId || !date) return
    setState('loading')
    setError(null)
    try {
      const data = await getAvailableSlots(serviceId, date)
      setSlots(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setState('error')
      setSlots([])
    }
  }, [serviceId, date])

  useEffect(() => {
    load()
  }, [load])

  return { slots, state, error, refetch: load }
}
