import { useEffect, useState } from 'react'
import { getActiveServices } from '@/services/clinicService'
import type { Service, LoadingState } from '@/types'

interface UseServicesResult {
  services: Service[]
  state: LoadingState
  error: string | null
}

let cachedServices: Service[] | null = null

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>(() => cachedServices || [])
  const [state, setState] = useState<LoadingState>(() => (cachedServices ? 'success' : 'idle'))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cachedServices) {
        setState('loading')
      }
      try {
        const data = await getActiveServices()
        if (!cancelled) {
          cachedServices = data
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
