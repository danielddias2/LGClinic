import { useState, useEffect, useCallback } from 'react'
import {
  getClientsAdmin,
  createClient as apiCreateClient,
  updateClient as apiUpdateClient,
  deleteClient as apiDeleteClient,
} from '@/services/clinicService'
import type {
  AdminClient,
  CreateClientPayload,
  UpdateClientPayload,
  LoadingState,
} from '@/types'

interface UseAdminClientsResult {
  clients: AdminClient[]
  loading: boolean
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
  setClients: React.Dispatch<React.SetStateAction<AdminClient[]>>
  createClient: (payload: CreateClientPayload) => Promise<AdminClient>
  updateClient: (payload: UpdateClientPayload) => Promise<AdminClient>
  deleteClient: (clientId: string) => Promise<void>
}

/**
 * Hook para gerenciar clientes na área administrativa.
 * Conectado exclusivamente às RPCs do Supabase.
 */
export function useAdminClients(): UseAdminClientsResult {
  const [clients, setClients] = useState<AdminClient[]>([])
  const [state, setState]     = useState<LoadingState>('idle')
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await getClientsAdmin()
      setClients(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes')
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createClient = useCallback(async (payload: CreateClientPayload): Promise<AdminClient> => {
    const created = await apiCreateClient(payload)
    if (created && created.id) {
      setClients((prev) => [created, ...prev])
    } else {
      await load()
    }
    return created
  }, [load])

  const updateClient = useCallback(async (payload: UpdateClientPayload): Promise<AdminClient> => {
    const updated = await apiUpdateClient(payload)
    if (updated && updated.id) {
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      )
    } else {
      await load()
    }
    return updated
  }, [load])

  const deleteClient = useCallback(async (clientId: string): Promise<void> => {
    await apiDeleteClient(clientId)
    setClients((prev) => prev.filter((c) => c.id !== clientId))
  }, [])

  return {
    clients,
    loading: state === 'loading',
    state,
    error,
    refetch: load,
    setClients,
    createClient,
    updateClient,
    deleteClient,
  }
}
