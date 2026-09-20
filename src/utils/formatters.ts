/**
 * Funções utilitárias de formatação usadas no fluxo de agendamento.
 * Sem dependências externas — apenas Intl nativo do browser.
 */

/**
 * Formata 'YYYY-MM-DD' para exibição longa em PT-BR.
 * Usa Date local (não UTC) para evitar problemas de fuso.
 */
export function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const result = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
  // Capitaliza apenas a primeira letra — evita capitalizar preposições ("De", "Da")
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Formata um timestamp ISO para HH:MM no fuso local.
 */
export function formatTimeDisplay(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/**
 * Retorna a data de hoje como 'YYYY-MM-DD' (data local).
 */
export function getTodayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Formata valor numérico como moeda BRL.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata duração em minutos para exibição legível.
 * Trata o valor estritamente como número inteiro em minutos.
 * Ex.: 90 → '1h 30min', 60 → '1h', 30 → '30min'
 */
export function formatDuration(minutes: number): string {
  const raw = Number(minutes)
  if (isNaN(raw) || raw <= 0) return ''

  // Trata como número inteiro em minutos e normaliza eventuais desvios de 1 minuto (ex.: 91min → 90min, 61min → 60min)
  const remainder = raw % 5
  const mInt = (remainder === 1 || remainder === 4)
    ? Math.round(raw / 5) * 5
    : Math.round(raw)

  if (mInt < 60) return `${mInt}min`
  const h = Math.floor(mInt / 60)
  const m = mInt % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/**
 * Gera um slug amigável a partir de uma string de texto.
 * Ex.: 'Limpeza de Pele Profunda' → 'limpeza-de-pele-profunda'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // substitui caracteres inválidos por hífen
    .replace(/^-+|-+$/g, '') // remove hífens do início e fim
}

/**
 * Valida se um slug segue o formato obrigatório (apenas letras minúsculas, números e hífens).
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
