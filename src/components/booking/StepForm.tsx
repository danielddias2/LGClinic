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
  const [touched, setTouched] = useState({ name: false, phone: false })

  const nameError  = touched.name  && !data.name.trim()  ? 'Nome é obrigatório'     : null
  const phoneError = touched.phone && !data.phone.trim() ? 'Telefone é obrigatório' : null

  function handleNext() {
    setTouched({ name: true, phone: true })
    if (!data.name.trim() || !data.phone.trim()) return
    onNext()
  }

  function update(field: keyof ClientData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [field]: e.target.value })
  }

  function touch(field: 'name' | 'phone') {
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
            value={data.email}
            onChange={update('email')}
            placeholder="seu@email.com"
            className={`${inputBase} ${inputOk}`}
          />
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
            value={data.notes}
            onChange={update('notes')}
            placeholder="Alguma informação adicional para a profissional…"
            className={`${inputBase} ${inputOk} resize-none`}
          />
        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
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
