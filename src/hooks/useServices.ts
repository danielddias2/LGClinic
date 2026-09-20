import { useEffect, useState } from 'react'
import { getActiveServices } from '@/services/clinicService'
import type { Service, LoadingState } from '@/types'

interface UseServicesResult {
  services: Service[]
  state: LoadingState
  error: string | null
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([])
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState('loading')
      try {
        const data = await getActiveServices()
        if (!cancelled) {
          setServices(data)
          setState('success')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido')
          setState('error')
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { services, state, error }
}
