import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Service, AvailableSlot, ClientData } from '@/types'
import { useServices } from '@/hooks/useServices'
import { useClinicSettings } from '@/hooks/useClinicSettings'
import { createPublicAppointment } from '@/services/clinicService'
import { getFriendlyError } from '@/utils/errorMessages'
import {
  getCachedClientData,
  setCachedClientData,
  clearCachedClientData,
} from '@/utils/bookingCache'
import BookingProgress from '@/components/booking/BookingProgress'
import StepService from '@/components/booking/StepService'
import StepDate from '@/components/booking/StepDate'
import StepSlot from '@/components/booking/StepSlot'
import StepForm from '@/components/booking/StepForm'
import StepReview from '@/components/booking/StepReview'
import StepSuccess from '@/components/booking/StepSuccess'

// ── Tipos de estado ───────────────────────────────────────────

const INITIAL_CLIENT: ClientData = { name: '', phone: '', email: '', notes: '' }

interface BookingState {
  step: number               // 1–5
  service: Service | null
  date: string               // 'YYYY-MM-DD'
  slot: AvailableSlot | null
  client: ClientData
  isSubmitting: boolean
  submitError: string | null
  conflictError: string | null // exibido em StepSlot após falha por conflito
  isSuccess: boolean
}

const INITIAL_STATE: BookingState = {
  step: 1,
  service: null,
  date: '',
  slot: null,
  client: INITIAL_CLIENT,
  isSubmitting: false,
  submitError: null,
  conflictError: null,
  isSuccess: false,
}

// ── Componente ────────────────────────────────────────────────

export default function Agendamento() {
  const [searchParams] = useSearchParams()
  const { services, state: servicesState } = useServices()
  const { settings, state: settingsState } = useClinicSettings()
  const [booking, setBooking] = useState<BookingState>(() => ({
    ...INITIAL_STATE,
    client: getCachedClientData(),
  }))

  // Pré-seleciona serviço via ?servico=ID (link vindo da Home)
  useEffect(() => {
    const paramId = searchParams.get('servico')
    if (!paramId || servicesState !== 'success') return
    const found = services.find((s) => s.id === paramId)
    if (found) {
      setBooking((prev) => ({ ...prev, service: found }))
    }
  }, [searchParams, services, servicesState])

  // ── Handlers de seleção (com resets em cascata) ───────────

  function selectService(service: Service) {
    setBooking((prev) => ({
      ...prev,
      service,
      date: '',
      slot: null,
      conflictError: null,
      submitError: null,
    }))
  }

  function selectDate(date: string) {
    setBooking((prev) => ({
      ...prev,
      date,
      slot: null,
      conflictError: null,
      submitError: null,
    }))
  }

  function selectSlot(slot: AvailableSlot) {
    setBooking((prev) => ({
      ...prev,
      slot,
      conflictError: null,
      submitError: null,
    }))
  }

  function updateClient(client: ClientData) {
    setBooking((prev) => ({ ...prev, client }))
    setCachedClientData(client)
  }

  // ── Navegação entre etapas ────────────────────────────────

  function goNext() {
    setBooking((prev) => ({ ...prev, step: prev.step + 1 }))
  }

  function goBack() {
    setBooking((prev) => ({
      ...prev,
      step: prev.step - 1,
      submitError: null,
    }))
  }

  function goToStep(step: number) {
    setBooking((prev) => ({
      ...prev,
      step,
      submitError: null,
    }))
  }

  // ── Submit ────────────────────────────────────────────────

  async function handleSubmit() {
    const { service, slot, client, isSubmitting } = booking
    if (!service || !slot || isSubmitting) return

    const trimmedName = client.name.trim()
    const trimmedPhone = client.phone.trim()
    const digitsOnlyPhone = trimmedPhone.replace(/\D/g, '')
    const trimmedEmail = client.email ? client.email.trim() : ''

    if (!trimmedName) {
      setBooking((prev) => ({
        ...prev,
        submitError: 'Por favor, preencha o seu nome.',
      }))
      return
    }

    if (!trimmedPhone || digitsOnlyPhone.length < 10) {
      setBooking((prev) => ({
        ...prev,
        submitError: 'Por favor, informe um telefone válido com DDD (mínimo 10 dígitos).',
      }))
      return
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setBooking((prev) => ({
        ...prev,
        submitError: 'Por favor, informe um e-mail válido ou deixe o campo em branco.',
      }))
      return
    }

    setBooking((prev) => ({
      ...prev,
      isSubmitting: true,
      submitError: null,
    }))

    try {
      await createPublicAppointment({
        p_name:       trimmedName.slice(0, 100),
        p_phone:      trimmedPhone.slice(0, 20),
        p_email:      trimmedEmail ? trimmedEmail.slice(0, 100) : undefined,
        p_service_id: service.id,
        p_start_at:   slot.start_at,
        p_notes:      client.notes?.trim() ? client.notes.trim().slice(0, 500) : undefined,
      })

      // Backend confirmou com sucesso: limpa o cache temporário
      clearCachedClientData()

      setBooking((prev) => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
      }))
    } catch (err) {
      // Se houver erro, os dados são PRESERVADOS no localStorage
      const friendly = getFriendlyError(err)
      const isConflict = friendly.toLowerCase().includes('horário')

      setBooking((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: friendly,
        // Se for conflito de horário, guarda para exibir em StepSlot ao voltar
        conflictError: isConflict ? friendly : prev.conflictError,
      }))
    }
  }

  // ── Booking desativado ────────────────────────────────────

  const bookingDisabled =
    settingsState === 'success' &&
    settings !== null &&
    settings.booking_enabled === false

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-16 sm:pt-20">

      {/* Banner da página */}
      <div className="bg-[#F5EFE8] py-10 sm:py-14 border-b border-[#E8E0D6]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4976A] mb-3 animate-hero-fade-up">
            LG Clinic
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl font-light text-[#18181B] animate-hero-fade-up"
            style={{ fontFamily: 'var(--font-display)', animationDelay: '100ms' }}
          >
            Agendamento
          </h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16">

        {/* Agendamento desativado */}
        {bookingDisabled && (
          <div className="py-16 text-center space-y-3 animate-step-fade">
            <p className="text-sm text-[#71717A]">
              Os agendamentos online estão temporariamente indisponíveis.
            </p>
            <p className="text-sm text-[#71717A]">
              Entre em contato diretamente para verificar disponibilidade.
            </p>
          </div>
        )}

        {/* Fluxo de agendamento */}
        {!bookingDisabled && !booking.isSuccess && (
          <>
            <BookingProgress currentStep={booking.step} />

            <div key={booking.step} className="animate-step-fade">
              {booking.step === 1 && (
                <StepService
                  services={services}
                  state={servicesState}
                  selected={booking.service}
                  onSelect={selectService}
                  onNext={goNext}
                />
              )}

              {booking.step === 2 && booking.service && (
                <StepDate
                  service={booking.service}
                  selectedDate={booking.date}
                  onDateChange={selectDate}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}

              {booking.step === 3 && booking.service && booking.date && (
                <StepSlot
                  service={booking.service}
                  date={booking.date}
                  selected={booking.slot}
                  onSelect={selectSlot}
                  onNext={goNext}
                  onBack={goBack}
                  conflictError={booking.conflictError}
                />
              )}

              {booking.step === 4 && (
                <StepForm
                  data={booking.client}
                  onChange={updateClient}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}

              {booking.step === 5 &&
                booking.service &&
                booking.slot &&
                booking.date && (
                  <StepReview
                    service={booking.service}
                    date={booking.date}
                    slot={booking.slot}
                    client={booking.client}
                    isSubmitting={booking.isSubmitting}
                    error={booking.submitError}
                    onConfirm={handleSubmit}
                    onBack={goBack}
                    onChangeSlot={() => goToStep(3)}
                  />
                )}
            </div>
          </>
        )}

        {/* Tela de sucesso */}
        {booking.isSuccess &&
          booking.service &&
          booking.slot &&
          booking.date && (
            <div className="animate-step-fade">
              <StepSuccess
                service={booking.service}
                date={booking.date}
                slot={booking.slot}
              />
            </div>
          )}
      </div>
    </div>
  )
}
