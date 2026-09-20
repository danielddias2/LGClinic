import { useState, useEffect, useCallback } from 'react'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { updateClinicSettings } from '@/services/clinicService'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function AdminConfiguracoes() {
  const { settings, state, error, refetch } = useClinicSettings()

  const [clinicName, setClinicName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sincroniza o formulário quando as configurações carregam
  useEffect(() => {
    if (settings?.clinic_name !== undefined && settings?.clinic_name !== null) {
      setClinicName(settings.clinic_name)
    }
  }, [settings])

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = clinicName.trim()
    if (!trimmed) {
      setActionError('O nome da clínica não pode ficar em branco.')
      return
    }

    setIsSaving(true)
    setActionError(null)
    setSuccessMessage(null)

    try {
      await updateClinicSettings({ p_clinic_name: trimmed })
      setSuccessMessage('Configurações salvas com sucesso!')
      showToast('Nome da clínica atualizado com sucesso.')
      // Recarrega os dados para confirmar que o valor persistiu
      await refetch()
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    settings?.clinic_name !== undefined &&
    clinicName.trim() !== (settings?.clinic_name || '').trim()

  return (
    <div className="p-6 sm:p-10 lg:p-12 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Toast flutuante de sucesso */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-[#FAFAF8] px-5 py-3 rounded shadow-lg flex items-center gap-3 border border-[#C4976A] text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#C4976A]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#A1A1AA] hover:text-[#FAFAF8] ml-2 text-xs"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E0D6]">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] mb-1 font-medium">
            Painel Administrativo
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Configurações
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            Gerencie as informações institucionais e operacionais da clínica.
          </p>
        </div>
      </div>

      {/* Estados de Carregamento e Erro Inicial */}
      {state === 'loading' && (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando configurações…" />
        </div>
      )}

      {state === 'error' && (
        <div className="py-16">
          <ErrorMessage
            message={error || 'Não foi possível carregar as configurações da clínica.'}
            onRetry={refetch}
          />
        </div>
      )}

      {/* Conteúdo Principal quando carregado */}
      {state === 'success' && (
        <div className="space-y-6">
          {/* Mensagem de erro de ação */}
          {actionError && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded flex items-center justify-between"
            >
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-red-700 hover:text-red-900 font-bold ml-4 text-xs"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* Mensagem de sucesso de ação */}
          {successMessage && (
            <div
              role="status"
              className="p-4 bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Card do formulário */}
          <div className="bg-white border border-[#E8E0D6] rounded shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#E8E0D6] bg-[#FAFAF8]">
              <h2
                className="font-display text-xl font-normal text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Identidade da Clínica
              </h2>
              <p className="text-xs text-[#71717A] mt-1">
                Defina o nome principal exibido nos cabeçalhos, rodapés e comunicações com pacientes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2 max-w-xl">
                <label
                  htmlFor="clinic_name"
                  className="block text-xs tracking-[0.1em] uppercase text-[#71717A] font-medium"
                >
                  Nome da Clínica <span className="text-red-600">*</span>
                </label>
                <input
                  id="clinic_name"
                  type="text"
                  required
                  disabled={isSaving}
                  value={clinicName}
                  onChange={(e) => {
                    setClinicName(e.target.value)
                    if (actionError) setActionError(null)
                  }}
                  placeholder="Ex.: LG Clinic"
                  className="w-full px-4 py-3 text-sm border border-[#E8E0D6] bg-white text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#C4976A] transition-colors rounded disabled:bg-[#F5F4F2] disabled:cursor-not-allowed"
                />
                <p className="text-xs text-[#71717A]">
                  Este nome é o identificador público da sua clínica em toda a plataforma.
                </p>
              </div>

              {/* Informações complementares da clínica */}
              {settings && (
                <div className="pt-6 border-t border-[#E8E0D6] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-[#FAFAF8] border border-[#E8E0D6] rounded">
                    <span className="text-[#71717A] block font-medium uppercase tracking-[0.05em] mb-1">
                      Profissional Responsável
                    </span>
                    <span className="text-[#18181B] font-medium text-sm">
                      {settings.professional_name || 'Não informado'}
                    </span>
                  </div>

                  <div className="p-4 bg-[#FAFAF8] border border-[#E8E0D6] rounded">
                    <span className="text-[#71717A] block font-medium uppercase tracking-[0.05em] mb-1">
                      Agendamento Online
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-sm text-[#18181B]">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          settings.booking_enabled ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      {settings.booking_enabled ? 'Ativo' : 'Desativado'}
                    </span>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="pt-4 flex items-center gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  disabled={isSaving || !clinicName.trim()}
                >
                  Salvar alterações
                </Button>

                {hasChanges && !isSaving && (
                  <span className="text-xs text-[#C4976A] font-medium">
                    Alterações pendentes de salvamento
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
