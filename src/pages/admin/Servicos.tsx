import { useState, useMemo } from 'react'
import type { Service } from '@/types'
import { useAdminServices } from '@/hooks/useAdminServices'
import { setServiceActive } from '@/services/clinicService'
import { formatCurrency, formatDuration } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import ServiceModal from '@/components/admin/ServiceModal'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Button from '@/components/ui/Button'

type FilterStatus = 'all' | 'active' | 'inactive'

export default function AdminServicos() {
  const { services, state, error, refetch, setServices } = useAdminServices()

  // Estado do Modal
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Filtros
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState<FilterStatus>('all')

  // Feedback e Loading pontual de toggle
  const [togglingId, setTogglingId]         = useState<string | null>(null)
  const [toastMessage, setToastMessage]     = useState<string | null>(null)
  const [actionError, setActionError]       = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }

  // Abertura de modal
  function handleNewService() {
    setEditingService(null)
    setModalOpen(true)
  }

  function handleEditService(svc: Service) {
    setEditingService(svc)
    setModalOpen(true)
  }

  // Callback de sucesso do modal (criação ou edição)
  function handleModalSuccess(saved: Service, isEdit: boolean) {
    if (isEdit) {
      setServices((prev) =>
        prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s))
      )
      showToast(`Procedimento "${saved.name}" atualizado com sucesso.`)
    } else {
      setServices((prev) => [saved, ...prev])
      showToast(`Procedimento "${saved.name}" cadastrado com sucesso.`)
    }
    // Re-sincroniza com backend em background
    refetch()
  }

  // Alternar ativo/inativo
  async function handleToggleActive(svc: Service) {
    const nextState = !svc.active
    setTogglingId(svc.id)
    setActionError(null)

    try {
      await setServiceActive(svc.id, nextState)
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, active: nextState } : s))
      )
      showToast(
        `Procedimento "${svc.name}" ${nextState ? 'ativado' : 'desativado'} com sucesso.`
      )
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setTogglingId(null)
    }
  }

  // Contagens para os filtros
  const counts = useMemo(() => {
    const activeCount = services.filter((s) => s.active).length
    return {
      all: services.length,
      active: activeCount,
      inactive: services.length - activeCount,
    }
  }, [services])

  // Filtragem da lista
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      // Filtro de status
      if (statusFilter === 'active' && !svc.active) return false
      if (statusFilter === 'inactive' && svc.active) return false

      // Busca por nome ou slug
      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchName = svc.name.toLowerCase().includes(query)
        const matchSlug = (svc.slug || '').toLowerCase().includes(query)
        const matchDesc = (svc.description || '').toLowerCase().includes(query)
        if (!matchName && !matchSlug && !matchDesc) return false
      }

      return true
    })
  }, [services, statusFilter, search])

  return (
    <div className="p-6 sm:p-10 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Toast flutuante de sucesso */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-[#FAFAF8] px-5 py-3 rounded shadow-lg flex items-center gap-3 border border-[#C4976A] text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#C4976A]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#A1A1AA] hover:text-[#FAFAF8] ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Alerta de erro de ação (ex: falha no toggle) */}
      {actionError && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded flex items-center justify-between"
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-4 text-xs"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E0D6]">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] mb-1 font-medium">
            Painel Administrativo
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Procedimentos &amp; Serviços
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            Gerencie o catálogo de procedimentos oferecidos na clínica e disponíveis para agendamento online.
          </p>
        </div>
        <div className="shrink-0">
          <Button onClick={handleNewService} size="md">
            + Novo serviço
          </Button>
        </div>
      </div>

      {/* Estados de carregamento / erro inicial */}
      {state === 'loading' && (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando procedimentos cadastrados…" />
        </div>
      )}

      {state === 'error' && (
        <div className="py-12">
          <ErrorMessage
            message={getFriendlyError(error ?? '')}
            onRetry={refetch}
          />
        </div>
      )}

      {/* Conteúdo principal quando carregado */}
      {state === 'success' && (
        <>
          {services.length === 0 ? (
            /* Estado Vazio Elegante (sem nenhum serviço) */
            <div className="bg-[#FAFAF8] border border-[#E8E0D6] p-12 sm:p-16 text-center max-w-2xl mx-auto space-y-6">
              <div className="w-14 h-14 mx-auto border border-[#C4976A] flex items-center justify-center text-[#C4976A]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2
                  className="font-display text-2xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Nenhum serviço cadastrado ainda
                </h2>
                <p className="text-sm text-[#71717A] max-w-md mx-auto leading-relaxed">
                  Cadastre os procedimentos estéticos e consultas da Dra. Luana Gratão para que seus pacientes possam conhecê-los e agendá-los online.
                </p>
              </div>
              <div className="pt-2">
                <Button onClick={handleNewService} size="lg">
                  Cadastrar primeiro serviço
                </Button>
              </div>
            </div>
          ) : (
            /* Barra de Controles: Filtros de status + Busca */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Tabs de status */}
                <div className="flex items-center gap-1 bg-[#EAE8E3] p-1 rounded-sm w-fit">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={[
                      'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                      statusFilter === 'all'
                        ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                        : 'text-[#71717A] hover:text-[#18181B]',
                    ].join(' ')}
                  >
                    Todos ({counts.all})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={[
                      'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                      statusFilter === 'active'
                        ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                        : 'text-[#71717A] hover:text-[#18181B]',
                    ].join(' ')}
                  >
                    Ativos ({counts.active})
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={[
                      'px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all',
                      statusFilter === 'inactive'
                        ? 'bg-[#18181B] text-[#FAFAF8] shadow-sm'
                        : 'text-[#71717A] hover:text-[#18181B]',
                    ].join(' ')}
                  >
                    Inativos ({counts.inactive})
                  </button>
                </div>

                {/* Campo de busca */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#A1A1AA] pointer-events-none">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrar por nome ou slug…"
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E8E0D6] bg-white text-[#18181B] focus:outline-none focus:border-[#C4976A] transition-colors rounded-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute inset-y-0 right-3 flex items-center text-xs text-[#A1A1AA] hover:text-[#18181B]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Lista filtrada vazia */}
              {filteredServices.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-[#E8E0D6] bg-[#FAFAF8] space-y-3">
                  <p className="text-sm text-[#71717A]">
                    Nenhum procedimento encontrado com os filtros atuais.
                  </p>
                  <button
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('all')
                    }}
                    className="text-xs text-[#C4976A] underline underline-offset-4 hover:text-[#18181B]"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <>
                  {/* Visualização em Tabela (Desktop) */}
                  <div className="hidden md:block bg-[#FAFAF8] border border-[#E8E0D6] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8E0D6] bg-[#F5EFE8] text-[10px] tracking-[0.15em] uppercase text-[#71717A]">
                          <th className="py-3.5 px-6 font-medium">Procedimento</th>
                          <th className="py-3.5 px-6 font-medium">Slug</th>
                          <th className="py-3.5 px-6 font-medium">Duração</th>
                          <th className="py-3.5 px-6 font-medium">Preço</th>
                          <th className="py-3.5 px-6 font-medium">Status</th>
                          <th className="py-3.5 px-6 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E0D6] text-sm">
                        {filteredServices.map((svc) => {
                          const isToggling = togglingId === svc.id
                          return (
                            <tr
                              key={svc.id}
                              className="hover:bg-[#F9F7F4] transition-colors group"
                            >
                              {/* Nome + Descrição */}
                              <td className="py-4 px-6">
                                <div className="font-medium text-[#18181B] group-hover:text-[#C4976A] transition-colors">
                                  {svc.name}
                                </div>
                                {svc.description && (
                                  <div className="text-xs text-[#71717A] line-clamp-1 max-w-sm mt-0.5">
                                    {svc.description}
                                  </div>
                                )}
                              </td>

                              {/* Slug */}
                              <td className="py-4 px-6">
                                <span className="font-mono text-xs text-[#71717A] bg-[#F5EFE8] px-2 py-0.5 rounded border border-[#E8E0D6]">
                                  {svc.slug}
                                </span>
                              </td>

                              {/* Duração */}
                              <td className="py-4 px-6 text-[#18181B]">
                                {formatDuration(svc.duration_minutes)}
                              </td>

                              {/* Preço */}
                              <td className="py-4 px-6 font-medium text-[#18181B]">
                                {svc.price != null
                                  ? formatCurrency(svc.price)
                                  : <span className="text-[#A1A1AA] text-xs font-normal">A consultar</span>
                                }
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-6">
                                <span
                                  className={[
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-full',
                                    svc.active
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200',
                                  ].join(' ')}
                                >
                                  <span
                                    className={[
                                      'w-1.5 h-1.5 rounded-full',
                                      svc.active ? 'bg-emerald-600' : 'bg-zinc-400',
                                    ].join(' ')}
                                  />
                                  {svc.active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>

                              {/* Ações */}
                              <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleActive(svc)}
                                  disabled={isToggling}
                                  className={[
                                    'text-xs font-medium px-3 py-1 border transition-colors disabled:opacity-50',
                                    svc.active
                                      ? 'border-[#E8E0D6] text-[#71717A] hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                      : 'border-[#C4976A] text-[#C4976A] hover:bg-[#C4976A] hover:text-[#FAFAF8]',
                                  ].join(' ')}
                                  title={svc.active ? 'Desativar serviço' : 'Ativar serviço'}
                                >
                                  {isToggling ? 'Salvando…' : svc.active ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                  onClick={() => handleEditService(svc)}
                                  className="text-xs font-medium px-3 py-1 border border-[#18181B] text-[#18181B] hover:bg-[#18181B] hover:text-[#FAFAF8] transition-colors"
                                >
                                  Editar
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Visualização em Cards (Mobile) */}
                  <div className="md:hidden space-y-3">
                    {filteredServices.map((svc) => {
                      const isToggling = togglingId === svc.id
                      return (
                        <div
                          key={svc.id}
                          className="bg-[#FAFAF8] border border-[#E8E0D6] p-5 space-y-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-[#18181B] text-base">
                                {svc.name}
                              </h3>
                              <span className="font-mono text-[11px] text-[#71717A] bg-[#F5EFE8] px-1.5 py-0.5 rounded border border-[#E8E0D6] inline-block mt-1">
                                {svc.slug}
                              </span>
                            </div>
                            <span
                              className={[
                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full shrink-0',
                                svc.active
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200',
                              ].join(' ')}
                            >
                              <span
                                className={[
                                  'w-1.5 h-1.5 rounded-full',
                                  svc.active ? 'bg-emerald-600' : 'bg-zinc-400',
                                ].join(' ')}
                              />
                              {svc.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>

                          {svc.description && (
                            <p className="text-xs text-[#71717A] leading-relaxed">
                              {svc.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E0D6]">
                            <span className="text-[#71717A]">
                              Duração: <strong className="text-[#18181B] font-medium">{formatDuration(svc.duration_minutes)}</strong>
                            </span>
                            <span className="text-[#71717A]">
                              Valor: <strong className="text-[#18181B] font-medium">
                                {svc.price != null ? formatCurrency(svc.price) : 'A consultar'}
                              </strong>
                            </span>
                          </div>

                          {/* Ações Mobile */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={() => handleToggleActive(svc)}
                              disabled={isToggling}
                              className={[
                                'py-2 text-xs font-medium border text-center transition-colors disabled:opacity-50',
                                svc.active
                                  ? 'border-[#E8E0D6] text-[#71717A] hover:bg-red-50 hover:text-red-700'
                                  : 'border-[#C4976A] text-[#C4976A] hover:bg-[#C4976A] hover:text-[#FAFAF8]',
                              ].join(' ')}
                            >
                              {isToggling ? 'Salvando…' : svc.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleEditService(svc)}
                              className="py-2 text-xs font-medium border border-[#18181B] text-[#18181B] hover:bg-[#18181B] hover:text-[#FAFAF8] text-center transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de Criação / Edição */}
      <ServiceModal
        isOpen={modalOpen}
        service={editingService}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
