import { useState, useEffect, useId } from 'react'
import type { Service } from '@/types'
import { createService, updateService } from '@/services/clinicService'
import { slugify, isValidSlug, formatCurrency } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import Button from '@/components/ui/Button'

interface ServiceModalProps {
  isOpen: boolean
  service: Service | null
  onClose: () => void
  onSuccess: (saved: Service, isEdit: boolean) => void
}

interface FormState {
  name: string
  slug: string
  duration_minutes: string
  price: string
  description: string
  image_url: string
}

export default function ServiceModal({
  isOpen,
  service,
  onClose,
  onSuccess,
}: ServiceModalProps) {
  const isEdit = service !== null

  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    duration_minutes: '30',
    price: '',
    description: '',
    image_url: '',
  })

  const [touchedSlug, setTouchedSlug] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors]           = useState<Record<string, string>>({})

  const modalTitleId = useId()

  // Sincroniza formulário com serviço a editar ou reseta ao abrir para novo
  useEffect(() => {
    if (!isOpen) return

    if (service) {
      setForm({
        name: service.name || '',
        slug: service.slug || '',
        duration_minutes: String(service.duration_minutes || 30),
        price: service.price != null ? String(service.price) : '',
        description: service.description || '',
        image_url: service.image_url || '',
      })
      setTouchedSlug(true)
    } else {
      setForm({
        name: '',
        slug: '',
        duration_minutes: '30',
        price: '',
        description: '',
        image_url: '',
      })
      setTouchedSlug(false)
    }
    setSubmitError(null)
    setErrors({})
  }, [isOpen, service])

  // Fecha no Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, submitting, onClose])

  if (!isOpen) return null

  // Atualiza nome e auto-sugere slug se ainda não foi editado manualmente
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value
    setForm((prev) => ({
      ...prev,
      name: newName,
      slug: !touchedSlug && !isEdit ? slugify(newName) : prev.slug,
    }))
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTouchedSlug(true)
    const raw = e.target.value.toLowerCase().replace(/\s+/g, '-')
    setForm((prev) => ({ ...prev, slug: raw }))
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: '' }))
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}

    // Nome obrigatório
    if (!form.name.trim()) {
      errs.name = 'Nome do serviço é obrigatório.'
    }

    // Slug obrigatório e válido
    const cleanSlug = form.slug.trim()
    if (!cleanSlug) {
      errs.slug = 'Slug identificador é obrigatório.'
    } else if (!isValidSlug(cleanSlug)) {
      errs.slug = 'Slug inválido. Use apenas letras minúsculas, números e hífens (ex: limpeza-de-pele).'
    }

    // Duração maior que zero
    const dur = parseInt(form.duration_minutes, 10)
    if (isNaN(dur) || dur <= 0) {
      errs.duration_minutes = 'Duração deve ser maior que zero minutos.'
    }

    // Preço não negativo
    if (form.price.trim() !== '') {
      const p = parseFloat(form.price.replace(',', '.'))
      if (isNaN(p) || p < 0) {
        errs.price = 'Preço não pode ser negativo.'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    const dur = parseInt(form.duration_minutes, 10)
    const prc = form.price.trim() !== '' ? parseFloat(form.price.replace(',', '.')) : null
    const desc = form.description.trim() || null
    const img  = form.image_url.trim() || null
    const cleanSlug = form.slug.trim()

    try {
      if (isEdit && service) {
        const updated = await updateService({
          p_service_id: service.id,
          p_name: form.name.trim(),
          p_slug: cleanSlug,
          p_duration_minutes: dur,
          p_price: prc,
          p_description: desc,
          p_image_url: img,
        })
        onSuccess(updated, true)
      } else {
        const created = await createService({
          p_name: form.name.trim(),
          p_slug: cleanSlug,
          p_duration_minutes: dur,
          p_price: prc,
          p_description: desc,
          p_image_url: img,
        })
        onSuccess(created, false)
      }
      onClose()
    } catch (err) {
      setSubmitError(getFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const parsedPrice = parseFloat(form.price.replace(',', '.'))
  const hasValidPrice = !isNaN(parsedPrice) && parsedPrice >= 0

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div
        className="bg-[#FAFAF8] border border-[#E8E0D6] w-full max-w-lg shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-[#E8E0D6] flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] mb-1">
              {isEdit ? 'Editar procedimento' : 'Novo procedimento'}
            </p>
            <h2
              id={modalTitleId}
              className="font-display text-2xl font-light text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isEdit ? form.name || 'Editar serviço' : 'Cadastrar serviço'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[#71717A] hover:text-[#18181B] p-1 -mr-2 transition-colors disabled:opacity-50"
            aria-label="Fechar formulário"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {submitError && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed"
            >
              {submitError}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <label
              htmlFor="svc-name"
              className="block text-[10px] tracking-[0.18em] uppercase text-[#71717A] font-medium"
            >
              Nome do serviço <span className="text-red-500">*</span>
            </label>
            <input
              id="svc-name"
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={handleNameChange}
              placeholder="Ex: Harmonização Facial, Limpeza de Pele..."
              className={[
                'w-full px-3.5 py-2.5 text-sm border bg-white text-[#18181B] transition-colors',
                'focus:outline-none focus:border-[#C4976A]',
                errors.name ? 'border-red-400' : 'border-[#E8E0D6]',
              ].join(' ')}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="svc-slug"
                className="block text-[10px] tracking-[0.18em] uppercase text-[#71717A] font-medium"
              >
                Slug identificador (URL) <span className="text-red-500">*</span>
              </label>
              {!touchedSlug && form.name && (
                <span className="text-[10px] text-[#C4976A] tracking-wider">
                  gerado automaticamente
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="svc-slug"
                type="text"
                required
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="ex: limpeza-de-pele"
                className={[
                  'w-full px-3.5 py-2.5 text-sm font-mono border bg-white text-[#18181B] transition-colors',
                  'focus:outline-none focus:border-[#C4976A]',
                  errors.slug ? 'border-red-400' : 'border-[#E8E0D6]',
                ].join(' ')}
              />
            </div>
            {errors.slug ? (
              <p className="text-xs text-red-600">{errors.slug}</p>
            ) : (
              <p className="text-[11px] text-[#A1A1AA]">
                Usado para identificação única do procedimento. Apenas minúsculas, números e traços.
              </p>
            )}
          </div>

          {/* Duração e Preço em 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duração */}
            <div className="space-y-1.5">
              <label
                htmlFor="svc-duration"
                className="block text-[10px] tracking-[0.18em] uppercase text-[#71717A] font-medium"
              >
                Duração (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                id="svc-duration"
                type="number"
                min="5"
                step="5"
                required
                value={form.duration_minutes}
                onChange={(e) => {
                  setForm({ ...form, duration_minutes: e.target.value })
                  if (errors.duration_minutes) setErrors({ ...errors, duration_minutes: '' })
                }}
                className={[
                  'w-full px-3.5 py-2.5 text-sm border bg-white text-[#18181B] transition-colors',
                  'focus:outline-none focus:border-[#C4976A]',
                  errors.duration_minutes ? 'border-red-400' : 'border-[#E8E0D6]',
                ].join(' ')}
              />
              {errors.duration_minutes && (
                <p className="text-xs text-red-600">{errors.duration_minutes}</p>
              )}
            </div>

            {/* Preço */}
            <div className="space-y-1.5">
              <label
                htmlFor="svc-price"
                className="block text-[10px] tracking-[0.18em] uppercase text-[#71717A] font-medium"
              >
                Preço (R$) <span className="font-normal text-[#A1A1AA] lowercase">(opcional)</span>
              </label>
              <input
                id="svc-price"
                type="text"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value })
                  if (errors.price) setErrors({ ...errors, price: '' })
                }}
                placeholder="Ex: 250,00"
                className={[
                  'w-full px-3.5 py-2.5 text-sm border bg-white text-[#18181B] transition-colors',
                  'focus:outline-none focus:border-[#C4976A]',
                  errors.price ? 'border-red-400' : 'border-[#E8E0D6]',
                ].join(' ')}
              />
              {errors.price ? (
                <p className="text-xs text-red-600">{errors.price}</p>
              ) : hasValidPrice ? (
                <p className="text-[11px] text-[#18181B] font-medium">
                  Exibição: {formatCurrency(parsedPrice)}
                </p>
              ) : (
                <p className="text-[11px] text-[#A1A1AA]">
                  Deixe vazio para &quot;Sob consulta&quot;
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label
              htmlFor="svc-desc"
              className="block text-[10px] tracking-[0.18em] uppercase text-[#71717A] font-medium"
            >
              Descrição detalhada <span className="font-normal text-[#A1A1AA] lowercase">(opcional)</span>
            </label>
            <textarea
              id="svc-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explique os benefícios, indicações e particularidades do procedimento..."
              className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D6] bg-white text-[#18181B] focus:outline-none focus:border-[#C4976A] resize-none transition-colors"
            />
          </div>

          {/* URL da imagem */}
          <div className="space-y-1.5">
            <label
              htmlFor="svc-img"
              className="block text-[10px] tracking-[0.18em] uppercase text-[#71717A] font-medium"
            >
              URL da imagem ilustrativa <span className="font-normal text-[#A1A1AA] lowercase">(opcional)</span>
            </label>
            <input
              id="svc-img"
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://exemplo.com/foto-servico.jpg"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E8E0D6] bg-white text-[#18181B] focus:outline-none focus:border-[#C4976A] transition-colors"
            />
          </div>

          {/* Ações */}
          <div className="pt-3 border-t border-[#E8E0D6] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm text-[#71717A] hover:text-[#18181B] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button type="submit" isLoading={submitting} size="md">
              {isEdit ? 'Salvar alterações' : 'Criar serviço'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
