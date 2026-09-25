import { useEffect, useState, useCallback } from 'react'
import { getClinicSettings } from '@/services/clinicService'
import type { ClinicSettings, LoadingState } from '@/types'

interface UseClinicSettingsResult {
  settings: ClinicSettings | null
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
}

let cachedSettings: ClinicSettings | null = null

export function useClinicSettings(): UseClinicSettingsResult {
  const [settings, setSettings] = useState<ClinicSettings | null>(() => cachedSettings)
  const [state, setState] = useState<LoadingState>(() => (cachedSettings ? 'success' : 'idle'))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!cachedSettings) {
      setState('loading')
    }
    setError(null)
    try {
      const data = await getClinicSettings()
      cachedSettings = data
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
