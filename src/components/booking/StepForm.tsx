import { useState } from 'react'
import type { ClientData } from '@/types'
import Button from '@/components/ui/Button'

interface StepFormProps {
  data: ClientData
  onChange: (data: ClientData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepForm({ data, onChange, onNext, onBack }: StepFormProps) {
  const [touched, setTouched] = useState({ name: false, phone: false, email: false })
  const [honeypot, setHoneypot] = useState('')

  const trimmedName = data.name.trim()
  const digitsOnlyPhone = data.phone.replace(/\D/g, '')
  const trimmedEmail = (data.email || '').trim()

  const nameError = touched.name && !trimmedName ? 'Nome é obrigatório' : null
  const phoneError = touched.phone
    ? !trimmedName && !data.phone.trim()
      ? 'Telefone é obrigatório'
      : digitsOnlyPhone.length > 0 && digitsOnlyPhone.length < 10
      ? 'Telefone deve incluir DDD e ao menos 8 ou 9 dígitos'
      : !data.phone.trim()
      ? 'Telefone é obrigatório'
      : null
    : null

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailError = touched.email && trimmedEmail && !emailRegex.test(trimmedEmail)
    ? 'E-mail em formato inválido'
    : null

  function handleNext() {
    setTouched({ name: true, phone: true, email: true })
    if (honeypot) {
      // Bot detectado: não avança silenciosamente
      return
    }
    if (!trimmedName || !data.phone.trim() || digitsOnlyPhone.length < 10) return
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) return
    onNext()
  }

  function update(field: keyof ClientData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [field]: e.target.value })
  }

  function touch(field: 'name' | 'phone' | 'email') {
    return () => setTouched((t) => ({ ...t, [field]: true }))
  }

  const inputBase = [
    'w-full px-4 py-3 text-sm border bg-white text-[#18181B]',
    'placeholder:text-[#A1A1AA] focus:outline-none transition-colors',
  ].join(' ')

  const inputOk  = 'border-[#E8E0D6] focus:border-[#C4976A]'
  const inputErr = 'border-red-400 focus:border-red-400'

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A] mb-2">
          Etapa 4 de 5
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl font-light text-[#18181B] leading-snug"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Seus dados
        </h2>
        <p className="text-sm text-[#71717A] mt-2">
          Preencha as informações para confirmar o agendamento.
        </p>
      </div>

      {/* Campo Honeypot para proteção contra bots (invisível para humanos) */}
      <div className="opacity-0 absolute -z-50 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="b_hp_check">Não preencha este campo</label>
        <input
          id="b_hp_check"
          type="text"
          name="b_hp_check"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Formulário */}
      <div className="max-w-md space-y-5">

        {/* Nome */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-name"
            className="block text-[10px] tracking-[0.2em] uppercase text-[#71717A]"
          >
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            id="form-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={data.name}
            onChange={update('name')}
            onBlur={touch('name')}
            placeholder="Seu nome completo"
            className={`${inputBase} ${nameError ? inputErr : inputOk}`}
          />
          {nameError && (
            <p role="alert" className="text-xs text-red-600">{nameError}</p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-phone"
            className="block text-[10px] tracking-[0.2em] uppercase text-[#71717A]"
          >
            Telefone <span className="text-red-500">*</span>
          </label>
          <input
            id="form-phone"
            type="tel"
            autoComplete="tel"
            maxLength={20}
            value={data.phone}
            onChange={update('phone')}
            onBlur={touch('phone')}
            placeholder="(00) 00000-0000"
            className={`${inputBase} ${phoneError ? inputErr : inputOk}`}
          />
          {phoneError && (
            <p role="alert" className="text-xs text-red-600">{phoneError}</p>
          )}
        </div>

        {/* E-mail */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-email"
            className="block text-[10px] tracking-[0.2em] uppercase text-[#71717A]"
          >
            E-mail{' '}
            <span className="normal-case font-normal text-[#A1A1AA]" style={{ letterSpacing: 'normal' }}>
              (opcional)
            </span>
          </label>
          <input
            id="form-email"
            type="email"
            autoComplete="email"
            maxLength={100}
            value={data.email}
            onChange={update('email')}
            onBlur={touch('email')}
            placeholder="seu@email.com"
            className={`${inputBase} ${emailError ? inputErr : inputOk}`}
          />
          {emailError && (
            <p role="alert" className="text-xs text-red-600">{emailError}</p>
          )}
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label
            htmlFor="form-notes"
            className="block text-[10px] tracking-[0.2em] uppercase text-[#71717A]"
          >
            Observações{' '}
            <span className="normal-case font-normal text-[#A1A1AA]" style={{ letterSpacing: 'normal' }}>
              (opcional)
            </span>
          </label>
          <textarea
            id="form-notes"
            rows={3}
            maxLength={500}
            value={data.notes}
            onChange={update('notes')}
            placeholder="Alguma informação adicional para a profissional…"
            className={`${inputBase} ${inputOk} resize-none`}
          />
        </div>
      </div>

      {/* Navegação */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[#71717A] hover:text-[#18181B] transition-colors py-2 text-center sm:text-left"
        >
          ← Voltar
        </button>
        <Button onClick={handleNext} size="lg">
          Revisar agendamento
        </Button>
      </div>
    </div>
  )
}
