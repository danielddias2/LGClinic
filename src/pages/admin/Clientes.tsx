import { useState, useMemo, useCallback } from 'react'
import type { AdminClient } from '@/types'
import { useAdminClients } from '@/hooks/useAdminClients'
import { formatDateDisplay } from '@/utils/formatters'
import { getFriendlyError } from '@/utils/errorMessages'
import ClientModal from '@/components/admin/ClientModal'
import ClientHistoryModal from '@/components/admin/ClientHistoryModal'
import Button from '@/components/ui/Button'
import Loader from '@/components/ui/Loader'
import ErrorMessage from '@/components/ui/ErrorMessage'

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

export default function AdminClientes() {
  const { clients, state, error, refetch, deleteClient } = useAdminClients()

  // Estados de Modais
  const [modalOpen, setModalOpen]               = useState(false)
  const [editingClient, setEditingClient]       = useState<AdminClient | null>(null)
  const [historyClient, setHistoryClient]       = useState<AdminClient | null>(null)
  const [deletingClient, setDeletingClient]     = useState<AdminClient | null>(null)

  // Busca
  const [search, setSearch]                     = useState('')

  // Feedbacks
  const [isDeleting, setIsDeleting]             = useState(false)
  const [toastMessage, setToastMessage]         = useState<string | null>(null)
  const [actionError, setActionError]           = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 4000)
  }, [])

  // Abertura de Modais
  function handleNewClient() {
    setEditingClient(null)
    setModalOpen(true)
  }

  function handleEditClient(client: AdminClient) {
    setEditingClient(client)
    setModalOpen(true)
  }

  function handleOpenHistory(client: AdminClient) {
    setHistoryClient(client)
  }

  // Sucesso de criação/edição
  function handleModalSuccess(saved: AdminClient, isEdit: boolean) {
    if (isEdit) {
      showToast(`Cadastro de "${saved.name}" atualizado com sucesso.`)
    } else {
      showToast(`Cliente "${saved.name}" cadastrado com sucesso.`)
    }
    refetch()
  }

  // Exclusão com confirmação
  async function confirmDelete() {
    if (!deletingClient) return
    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteClient(deletingClient.id)
      showToast(`Cliente "${deletingClient.name}" removido com sucesso.`)
      setDeletingClient(null)
    } catch (err) {
      setActionError(getFriendlyError(err))
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtro de busca local
  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients

    const query = search.toLowerCase().trim()
    const queryDigits = search.replace(/\D/g, '')

    return clients.filter((c) => {
      const matchName = c.name.toLowerCase().includes(query)
      const matchEmail = (c.email || '').toLowerCase().includes(query)
      const matchPhone = queryDigits
        ? c.phone.replace(/\D/g, '').includes(queryDigits)
        : c.phone.toLowerCase().includes(query)

      return matchName || matchEmail || matchPhone
    })
  }, [clients, search])

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
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* Alerta de erro de ação (ex: falha ao excluir) */}
      {actionError && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-sm flex items-center justify-between"
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

      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E0D6]">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4976A] mb-1 font-medium">
            Painel Administrativo
          </p>
          <div className="flex items-baseline gap-3">
            <h1
              className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Clientes
            </h1>
            {state === 'success' && (
              <span className="text-xs text-[#71717A] font-medium bg-[#EAE8E3] px-2.5 py-0.5 rounded-full">
                {clients.length} {clients.length === 1 ? 'cadastrado' : 'cadastrados'}
              </span>
            )}
          </div>
          <p className="text-sm text-[#71717A] mt-1">
            Gerencie o cadastro de pacientes da clínica e acompanhe o histórico de atendimentos.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button onClick={handleNewClient} size="md">
            + Novo cliente
          </Button>
        </div>
      </div>

      {/* Estados de Carregamento e Erro Inicial */}
      {state === 'loading' && (
        <div className="py-24 flex justify-center">
          <Loader label="Carregando cadastro de clientes…" />
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

      {/* Conteúdo Principal */}
      {state === 'success' && (
        <>
          {clients.length === 0 ? (
            /* Estado Vazio Elegante (sem nenhum cliente cadastrado) */
            <div className="bg-[#FAFAF8] border border-[#E8E0D6] p-12 sm:p-16 text-center max-w-2xl mx-auto space-y-6">
              <div className="w-14 h-14 mx-auto border border-[#C4976A] flex items-center justify-center text-[#C4976A]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2
                  className="font-display text-2xl font-light text-[#18181B]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Nenhum cliente cadastrado ainda
                </h2>
                <p className="text-sm text-[#71717A] max-w-md mx-auto leading-relaxed">
                  Os clientes cadastrados manualmente ou através dos agendamentos online da clínica aparecerão listados aqui.
                </p>
              </div>
              <div className="pt-2">
                <Button onClick={handleNewClient} size="lg">
                  Cadastrar primeiro cliente
                </Button>
              </div>
            </div>
          ) : (
            /* Barra de Controles: Busca + Tabela / Cards */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Campo de Busca */}
                <div className="relative w-full sm:w-80">
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
                    placeholder="Buscar por nome, telefone ou e-mail…"
                    className="w-full pl-9 pr-8 py-2 text-xs border border-[#E8E0D6] bg-white text-[#18181B] focus:outline-none focus:border-[#C4976A] transition-colors rounded-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute inset-y-0 right-3 flex items-center text-xs text-[#A1A1AA] hover:text-[#18181B]"
                      aria-label="Limpar busca"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#71717A]">
                  Exibindo {filteredClients.length} de {clients.length}{' '}
                  {clients.length === 1 ? 'cliente' : 'clientes'}
                </div>
              </div>

              {/* Lista filtrada vazia */}
              {filteredClients.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-[#E8E0D6] bg-[#FAFAF8] space-y-3">
                  <p className="text-sm text-[#71717A]">
                    Nenhum cliente encontrado para os termos da busca "{search}".
                  </p>
                  <button
                    onClick={() => setSearch('')}
                    className="text-xs text-[#C4976A] underline underline-offset-4 hover:text-[#18181B]"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                <>
                  {/* Visualização em Tabela (Desktop) */}
                  <div className="hidden md:block bg-[#FAFAF8] border border-[#E8E0D6] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8E0D6] bg-[#F5EFE8] text-[10px] tracking-[0.15em] uppercase text-[#71717A]">
                          <th className="py-3.5 px-6 font-medium">Nome do Paciente</th>
                          <th className="py-3.5 px-6 font-medium">Telefone / WhatsApp</th>
                          <th className="py-3.5 px-6 font-medium">E-mail</th>
                          <th className="py-3.5 px-6 font-medium">Data de Cadastro</th>
                          <th className="py-3.5 px-6 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E0D6] text-sm">
                        {filteredClients.map((client) => {
                          const dateStr = extractLocalDateString(client.created_at)

                          return (
                            <tr
                              key={client.id}
                              className="hover:bg-[#F9F7F4] transition-colors group"
                            >
                              {/* Nome */}
                              <td className="py-4 px-6 font-medium text-[#18181B] group-hover:text-[#C4976A] transition-colors">
                                {client.name}
                              </td>

                              {/* Telefone com atalho WhatsApp */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-[#18181B]">
                                    {client.phone}
                                  </span>
                                  <a
                                    href={formatWhatsAppLink(client.phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-[#C4976A] hover:text-[#18181B] font-medium transition-colors"
                                    title="Conversar no WhatsApp"
                                  >
                                    WhatsApp ↗
                                  </a>
                                </div>
                              </td>

                              {/* E-mail */}
                              <td className="py-4 px-6 text-xs text-[#71717A]">
                                {client.email || <span className="text-[#A1A1AA]">Não informado</span>}
                              </td>

                              {/* Data de Cadastro */}
                              <td className="py-4 px-6 text-xs text-[#71717A]">
                                {formatDateDisplay(dateStr)}
                              </td>

                              {/* Ações */}
                              <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenHistory(client)}
                                  className="text-xs font-medium px-3 py-1 border border-[#E8E0D6] text-[#18181B] hover:border-[#C4976A] hover:text-[#C4976A] transition-colors rounded-sm"
                                  title="Ver agendamentos do cliente"
                                >
                                  Histórico
                                </button>
                                <button
                                  onClick={() => handleEditClient(client)}
                                  className="text-xs font-medium px-3 py-1 border border-[#18181B] text-[#18181B] hover:bg-[#18181B] hover:text-[#FAFAF8] transition-colors rounded-sm"
                                  title="Editar dados cadastrais"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionError(null)
                                    setDeletingClient(client)
                                  }}
                                  className="text-xs font-medium px-3 py-1 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-sm"
                                  title="Excluir cadastro"
                                >
                                  Excluir
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
                    {filteredClients.map((client) => {
                      const dateStr = extractLocalDateString(client.created_at)

                      return (
                        <div
                          key={client.id}
                          className="bg-[#FAFAF8] border border-[#E8E0D6] p-5 space-y-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-[#18181B] text-base">
                                {client.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-xs text-[#18181B]">
                                  {client.phone}
                                </span>
                                <a
                                  href={formatWhatsAppLink(client.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#C4976A] hover:underline"
                                >
                                  (WhatsApp)
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs pt-2 border-t border-[#E8E0D6]">
                            <div className="flex justify-between">
                              <span className="text-[#71717A]">E-mail:</span>
                              <span className="text-[#18181B] truncate max-w-[200px]">
                                {client.email || <span className="text-[#A1A1AA]">Não informado</span>}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#71717A]">Cadastrado em:</span>
                              <span className="text-[#18181B]">
                                {formatDateDisplay(dateStr)}
                              </span>
                            </div>
                          </div>

                          {/* Ações Mobile */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8E0D6]">
                            <button
                              onClick={() => handleOpenHistory(client)}
                              className="py-2 text-xs font-medium border border-[#E8E0D6] text-[#18181B] hover:bg-white text-center rounded-sm transition-colors"
                            >
                              Histórico
                            </button>
                            <button
                              onClick={() => handleEditClient(client)}
                              className="py-2 text-xs font-medium border border-[#18181B] text-[#18181B] hover:bg-[#18181B] hover:text-[#FAFAF8] text-center rounded-sm transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null)
                                setDeletingClient(client)
                              }}
                              className="py-2 text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 text-center rounded-sm transition-colors"
                            >
                              Excluir
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
      <ClientModal
        isOpen={modalOpen}
        client={editingClient}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de Histórico de Atendimentos */}
      <ClientHistoryModal
        isOpen={historyClient !== null}
        client={historyClient}
        onClose={() => setHistoryClient(null)}
      />

      {/* Modal de Confirmação de Exclusão */}
      {deletingClient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-[#FAFAF8] border border-[#E8E0D6] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3
                className="font-display text-2xl font-light text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Excluir cliente?
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Tem certeza de que deseja remover o cadastro de{' '}
                <strong className="text-[#18181B] font-medium">{deletingClient.name}</strong>?
                Essa ação é permanente.
              </p>
            </div>

            {/* Alerta de erro da exclusão dentro do próprio modal */}
            {actionError && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-sm text-center leading-relaxed"
              >
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingClient(null)
                  setActionError(null)
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium border border-[#E8E0D6] text-[#71717A] hover:text-[#18181B] hover:border-[#18181B] transition-colors rounded-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors rounded-sm disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo…' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
