import { useState, useEffect } from 'react'
import type { AdminClient, AdminAppointment, AppointmentStatus } from '@/types'
import { getClientAppointments } from '@/services/clinicService'
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDuration,
} from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import Loader from '@/components/ui/Loader'
import Button from '@/components/ui/Button'

interface ClientHistoryModalProps {
  isOpen: boolean
  client: AdminClient | null
  onClose: () => void
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: 'Pendente',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    badge: 'bg-[#FAF3EB] text-[#A26D3B] border-[#EAD7C3]',
    dot: 'bg-[#C4976A]',
  },
  completed: {
    label: 'Concluído',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dot: 'bg-zinc-400',
  },
}

function extractLocalDateString(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${fullNumber}`
}

export default function ClientHistoryModal({
  isOpen,
  client,
  onClose,
}: ClientHistoryModalProps) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !client) return

    let isMounted = true
    setLoading(true)
    setError(null)

    getClientAppointments(client.id)
      .then((data) => {
        if (isMounted) {
          // Ordena do mais recente para o mais antigo
          const sorted = [...data].sort(
            (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
          )
          setAppointments(sorted)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getFriendlyError(err))
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, client])

  if (!isOpen || !client) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#FAFAF8] border border-[#E8E0D6] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-[#E8E0D6] flex items-start justify-between shrink-0">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] font-medium block mb-1">
              Prontuário &amp; Histórico
            </span>
            <h2
              className="font-display text-2xl sm:text-3xl font-light text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {client.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-[#18181B] p-1.5 text-sm transition-colors"
            aria-label="Fechar histórico"
          >
            ✕
          </button>
        </div>

        {/* Ficha Resumo do Cliente */}
        <div className="px-6 sm:px-8 py-4 bg-white border-b border-[#E8E0D6] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
              Telefone
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[#18181B]">
              <span>{client.phone}</span>
              <a
                href={formatWhatsAppLink(client.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C4976A] hover:text-[#18181B] font-sans font-medium"
                title="Conversar no WhatsApp"
              >
                (WhatsApp)
              </a>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
              E-mail
            </span>
            <span className="text-[#18181B] truncate block">
              {client.email || <span className="text-[#A1A1AA]">Não informado</span>}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
              Cliente desde
            </span>
            <span className="text-[#18181B]">
              {formatDateDisplay(extractLocalDateString(client.created_at))}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#71717A] block mb-0.5">
              Total Agendamentos
            </span>
            <span className="text-sm font-medium text-[#18181B]">
              {loading ? '…' : appointments.length}
            </span>
          </div>
        </div>

        {/* Lista Rolável de Agendamentos */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#71717A] font-medium mb-3">
            Histórico de Procedimentos &amp; Consultas
          </h3>

          {loading && (
            <div className="py-12 flex justify-center">
              <Loader label="Carregando histórico do cliente…" />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-sm"
            >
              {error}
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <div className="p-8 text-center border border-dashed border-[#E8E0D6] bg-white space-y-2">
              <p className="text-sm text-[#71717A]">
                Nenhum agendamento encontrado para este paciente até o momento.
              </p>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="space-y-3">
              {appointments.map((app) => {
                const statusMeta = STATUS_CONFIG[app.status]
                const dateStr = extractLocalDateString(app.start_at)

                return (
                  <div
                    key={app.appointment_id}
                    className="p-4 bg-white border border-[#E8E0D6] hover:border-[#C4976A] transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm text-[#18181B] block">
                          {app.service_name}
                        </span>
                        <span className="text-xs text-[#71717A]">
                          Duração: {formatDuration(app.duration_minutes)}
                        </span>
                      </div>

                      <span
                        className={[
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full border shrink-0 w-fit',
                          statusMeta.badge,
                        ].join(' ')}
                      >
                        <span className={['w-1.5 h-1.5 rounded-full', statusMeta.dot].join(' ')} />
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#F5EFE8]">
                      <div className="text-[#18181B]">
                        <span className="text-[#71717A] mr-1">Data:</span>
                        <strong>{formatDateDisplay(dateStr)}</strong>
                      </div>
                      <div className="text-[#18181B] font-mono">
                        <span className="text-[#71717A] mr-1 font-sans">Horário:</span>
                        {formatTimeDisplay(app.start_at)} – {formatTimeDisplay(app.end_at)}
                      </div>
                    </div>

                    {app.notes && (
                      <div className="text-xs bg-[#FAF8F5] p-2.5 rounded border border-[#E8E0D6] italic text-[#18181B]">
                        "{app.notes}"
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 px-6 sm:px-8 border-t border-[#E8E0D6] bg-[#FAFAF8] flex justify-end shrink-0">
          <Button onClick={onClose} variant="secondary" size="sm">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
