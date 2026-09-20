import { useState, useEffect, useCallback } from 'react'
import { getServicesAdmin } from '@/services/clinicService'
import type { Service, LoadingState } from '@/types'

interface UseAdminServicesResult {
  services: Service[]
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
  setServices: React.Dispatch<React.SetStateAction<Service[]>>
}

/**
 * Hook para buscar e gerenciar todos os serviços cadastrados na área administrativa.
 * Retorna todos os serviços (ativos e inativos).
 */
export function useAdminServices(): UseAdminServicesResult {
  const [services, setServices] = useState<Service[]>([])
  const [state, setState]       = useState<LoadingState>('idle')
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await getServicesAdmin()
      setServices(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços')
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { services, state, error, refetch: load, setServices }
}
