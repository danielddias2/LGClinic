import { useState, useEffect, useId } from 'react'
import type { AdminClient } from '@/types'
import { createClient, updateClient } from '@/services/clinicService'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'

interface ClientModalProps {
  isOpen: boolean
  client: AdminClient | null
  onClose: () => void
  onSuccess: (saved: AdminClient, isEdit: boolean) => void
}

interface FormState {
  name: string
  phone: string
  email: string
}

function formatPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function ClientModal({
  isOpen,
  client,
  onClose,
  onSuccess,
}: ClientModalProps) {
  const isEdit = client !== null

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
  })

  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors]           = useState<Record<string, string>>({})

  const modalTitleId = useId()

  useEffect(() => {
    if (!isOpen) return

    if (client) {
      setForm({
        name: client.name || '',
        phone: formatPhoneMask(client.phone || ''),
        email: client.email || '',
      })
    } else {
      setForm({
        name: '',
        phone: '',
        email: '',
      })
    }

    setErrors({})
    setSubmitError(null)
  }, [isOpen, client])

  if (!isOpen) return null

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}

    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = 'O nome do cliente é obrigatório (mínimo 2 caracteres).'
    }

    const digits = form.phone.replace(/\D/g, '')
    if (!digits || digits.length < 10) {
      nextErrors.phone = 'Informe um telefone válido com DDD (mínimo 10 dígitos).'
    }

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email.trim())) {
        nextErrors.email = 'Informe um e-mail válido ou deixe em branco.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSubmitting(true)

    try {
      if (isEdit && client) {
        const saved = await updateClient({
          p_client_id: client.id,
          p_name: form.name.trim(),
          p_phone: form.phone.trim(),
          p_email: form.email.trim() || null,
        })
        onSuccess(saved, true)
      } else {
        const saved = await createClient({
          p_name: form.name.trim(),
          p_phone: form.phone.trim(),
          p_email: form.email.trim() || null,
        })
        onSuccess(saved, false)
      }
      onClose()
    } catch (err) {
      setSubmitError(getFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#FAFAF8] border border-[#E8E0D6] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E0D6]">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] font-medium mb-1">
              {isEdit ? 'Editar Cadastro' : 'Novo Cadastro'}
            </p>
            <h2
              id={modalTitleId}
              className="font-display text-2xl font-light text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isEdit ? client?.name : 'Cadastrar Cliente'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[#A1A1AA] hover:text-[#18181B] p-1.5 text-sm transition-colors disabled:opacity-50"
            aria-label="Fechar formulário"
          >
            ✕
          </button>
        </div>

        {/* Alerta de Erro de Envio */}
        {submitError && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-sm"
          >
            {submitError}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nome */}
          <div className="space-y-1">
            <label
              htmlFor="client-name"
              className="block text-xs uppercase tracking-[0.1em] text-[#71717A] font-medium"
            >
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              id="client-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }))
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="Ex: Maria Clara Ferreira"
              className={[
                'w-full px-3.5 py-2.5 text-sm border bg-white text-[#18181B] focus:outline-none transition-colors rounded-sm',
                errors.name
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[#E8E0D6] focus:border-[#C4976A]',
              ].join(' ')}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-0.5">{errors.name}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <label
              htmlFor="client-phone"
              className="block text-xs uppercase tracking-[0.1em] text-[#71717A] font-medium"
            >
              Telefone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="client-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => {
                const formatted = formatPhoneMask(e.target.value)
                setForm((prev) => ({ ...prev, phone: formatted }))
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
              }}
              placeholder="(94) 99999-0000"
              className={[
                'w-full px-3.5 py-2.5 text-sm border bg-white text-[#18181B] font-mono focus:outline-none transition-colors rounded-sm',
                errors.phone
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[#E8E0D6] focus:border-[#C4976A]',
              ].join(' ')}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-0.5">{errors.phone}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <label
              htmlFor="client-email"
              className="block text-xs uppercase tracking-[0.1em] text-[#71717A] font-medium"
            >
              E-mail <span className="text-[#A1A1AA] text-[10px] font-normal">(opcional)</span>
            </label>
            <input
              id="client-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, email: e.target.value }))
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              placeholder="cliente@exemplo.com"
              className={[
                'w-full px-3.5 py-2.5 text-sm border bg-white text-[#18181B] focus:outline-none transition-colors rounded-sm',
                errors.email
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[#E8E0D6] focus:border-[#C4976A]',
              ].join(' ')}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E0D6]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium border border-[#E8E0D6] text-[#71717A] hover:text-[#18181B] hover:border-[#18181B] transition-colors rounded-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              size="sm"
              isLoading={submitting}
            >
              {isEdit ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
