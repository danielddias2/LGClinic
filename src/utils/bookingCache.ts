import type { ClientData } from '@/types'

export const BOOKING_CLIENT_CACHE_KEY = 'lg_clinic_client_draft'

/**
 * Minimização de dados (LGPD / Privacidade):
 * Apenas os dados básicos de identificação e contato são armazenados temporariamente
 * para conveniência do usuário (preenchimento automático ao retornar à página).
 * Nunca armazena senhas, tokens de autenticação, sessões ou dados clínicos.
 */
export function getCachedClientData(): ClientData {
  try {
    const raw = localStorage.getItem(BOOKING_CLIENT_CACHE_KEY)
    if (!raw) {
      return { name: '', phone: '', email: '', notes: '' }
    }

    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { name: '', phone: '', email: '', notes: '' }
    }

    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    }
  } catch {
    return { name: '', phone: '', email: '', notes: '' }
  }
}

/**
 * Salva temporariamente os dados digitados pelo cliente no localStorage.
 */
export function setCachedClientData(client: ClientData): void {
  try {
    const sanitized: ClientData = {
      name: client.name ? String(client.name).slice(0, 150) : '',
      phone: client.phone ? String(client.phone).slice(0, 30) : '',
      email: client.email ? String(client.email).slice(0, 150) : '',
      notes: client.notes ? String(client.notes).slice(0, 500) : '',
    }
    localStorage.setItem(BOOKING_CLIENT_CACHE_KEY, JSON.stringify(sanitized))
  } catch {
    // Trata graciosamente caso localStorage esteja indisponível ou cheio
  }
}

/**
 * Destrói o cache temporário.
 * DEVE ser chamado estritamente após o backend confirmar com sucesso o agendamento.
 */
export function clearCachedClientData(): void {
  try {
    localStorage.removeItem(BOOKING_CLIENT_CACHE_KEY)
  } catch {
    // Trata graciosamente
  }
}
