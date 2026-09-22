import { Link } from 'react-router-dom'

interface QuickActionItem {
  label: string
  description: string
  to: string
  icon: React.ReactNode
  isExternalOrPublic?: boolean
}

export default function QuickActions() {
  const actions: QuickActionItem[] = [
    {
      label: 'Agenda do dia',
      description: 'Consultar atendimentos e gerenciar horários',
      to: '/admin/agenda',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Base de clientes',
      description: 'Cadastrar novos pacientes ou consultar histórico',
      to: '/admin/clientes',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Catálogo de serviços',
      description: 'Adicionar procedimentos, durações e valores',
      to: '/admin/servicos',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      label: 'Configurações da clínica',
      description: 'Ajustar identidade e status de agendamento online',
      to: '/admin/configuracoes',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      label: 'Novo agendamento',
      description: 'Acessar formulário de agendamento público',
      to: '/agendamento',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      isExternalOrPublic: true,
    },
  ]

  return (
    <div className="bg-white border border-[#E8E0D6] rounded p-5 sm:p-6 shadow-xs space-y-4">
      <div>
        <h3
          className="font-display text-lg font-normal text-[#18181B]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ações rápidas
        </h3>
        <p className="text-xs text-[#71717A] mt-0.5">
          Atalhos operacionais para as seções do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-1">
        {actions.map((act) => (
          <Link
            key={act.to}
            to={act.to}
            className="p-3 rounded border border-transparent hover:border-[#E8E0D6] hover:bg-[#FAFAF8] transition-all duration-150 flex items-center justify-between group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4976A]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-[#F5EFE8] text-[#C4976A] flex items-center justify-center shrink-0 group-hover:bg-[#18181B] group-hover:text-[#FAFAF8] transition-colors">
                {act.icon}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-[#18181B] block truncate group-hover:text-[#C4976A] transition-colors">
                  {act.label}
                </span>
                <span className="text-[11px] text-[#71717A] block truncate">
                  {act.description}
                </span>
              </div>
            </div>
            <span className="text-xs text-[#71717A] group-hover:translate-x-0.5 transition-transform pl-2" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
