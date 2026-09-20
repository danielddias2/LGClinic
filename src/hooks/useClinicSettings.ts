import { useEffect, useState, useCallback } from 'react'
import { getClinicSettings } from '@/services/clinicService'
import type { ClinicSettings, LoadingState } from '@/types'

interface UseClinicSettingsResult {
  settings: ClinicSettings | null
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
}

export function useClinicSettings(): UseClinicSettingsResult {
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await getClinicSettings()
      setSettings(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { settings, state, error, refetch: load }
}
