export interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  duration_minutes: number
  price: number | null
  image_url: string | null
  active: boolean
  created_at?: string
  is_active?: boolean
}

export interface CreateServicePayload {
  p_name: string
  p_slug: string
  p_duration_minutes: number
  p_price?: number | null
  p_description?: string | null
  p_image_url?: string | null
}

export interface UpdateServicePayload {
  p_service_id: string
  p_name?: string
  p_slug?: string
  p_duration_minutes?: number
  p_price?: number | null
  p_description?: string | null
  p_image_url?: string | null
}

// ── Horário disponível ────────────────────────────────────────
export interface AvailableSlot {
  start_at: string  // ISO 8601 timestamptz
  end_at: string    // ISO 8601 timestamptz
}

// ── Agendamento (criação pública) ────────────────────────────
export interface CreateAppointmentPayload {
  p_name: string
  p_phone: string
  p_email?: string
  p_service_id: string
  p_start_at: string  // ISO 8601 timestamptz
  p_notes?: string
}

// ── Configurações da clínica ─────────────────────────────────
export interface ClinicSettings {
  id?: string
  clinic_name: string | null
  professional_name?: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  instagram: string | null
  whatsapp: string | null
  booking_enabled: boolean
  [key: string]: unknown
}

export interface UpdateClinicSettingsPayload {
  p_clinic_name?: string
  clinic_name?: string
  [key: string]: unknown
}

// ── Dados do cliente (formulário de agendamento) ─────────────
export interface ClientData {
  name: string
  phone: string
  email: string
  notes: string
}

// ── Estado de carregamento ────────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ── Agendamentos Administrativos ──────────────────────────────
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface AdminAppointment {
  appointment_id: string
  start_at: string
  end_at: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  client_id: string
  client_name: string
  client_phone: string
  client_email: string | null
  service_id: string
  service_name: string
  duration_minutes: number
}

// ── Gestão Administrativa de Clientes ─────────────────────────
export interface AdminClient {
  id: string
  name: string
  phone: string
  email: string | null
  created_at: string
  updated_at?: string
}

export interface CreateClientPayload {
  p_name: string
  p_phone: string
  p_email?: string | null
}

export interface UpdateClientPayload {
  p_client_id: string
  p_name: string
  p_phone: string
  p_email?: string | null
}


