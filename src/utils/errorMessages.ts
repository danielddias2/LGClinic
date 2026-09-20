/**
 * Mapeia mensagens de erro do Supabase/PostgreSQL para mensagens amigáveis
 * exibidas ao usuário final.
 *
 * Erros técnicos são registrados no console em desenvolvimento.
 * A interface nunca exibe strings brutas do PostgreSQL.
 */

const ERROR_MAP: Record<string, string> = {
  'Horário indisponível': 'Esse horário acabou de ser ocupado. Por favor, escolha outro horário.',
  'slot not available': 'Esse horário não está mais disponível. Por favor, escolha outro horário.',
  'Serviço não encontrado ou inativo': 'Esse serviço não está disponível no momento.',
  'service not found': 'Esse serviço não está disponível no momento.',
  'Agendamentos estão temporariamente desativados': 'Os agendamentos online estão temporariamente indisponíveis.',
  'appointments disabled': 'Os agendamentos online estão temporariamente indisponíveis.',
  'acesso não autorizado': 'Acesso não autorizado. Sua sessão administrativa pode ter expirado.',
  'unauthorized': 'Acesso não autorizado. Sua sessão administrativa pode ter expirado.',
  'jwt': 'Sua sessão expirou. Por favor, faça login novamente.',
  'services_slug_key': 'Já existe um serviço cadastrado com este slug. Por favor, escolha outro.',
  'duplicate key': 'Já existe um registro com estes dados. Verifique se o slug já está em uso.',
  'duration_minutes': 'A duração do serviço deve ser maior que zero minutos.',
  'violates check constraint': 'Os valores informados para duração ou preço são inválidos.',
  'agendamento não encontrado': 'O agendamento selecionado não foi encontrado.',
  'status de agendamento inválido': 'O status informado para o agendamento é inválido.',
  'foreign key constraint': 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.',
  'violates foreign key': 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.',
  '23503': 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.',
  'não é possível excluir': 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.',
  'possui agendamentos': 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.',
  'cliente não encontrado': 'O cliente selecionado não foi encontrado.',
  'clients_phone_key': 'Já existe um cliente cadastrado com este número de telefone.',
}

export function getFriendlyError(error: unknown): string {
  let raw = ''

  if (error instanceof Error) {
    raw = error.message
  } else if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>
    const parts = [obj.message, obj.details, obj.hint, obj.code].filter(Boolean)
    raw = parts.join(' ')
  } else {
    raw = String(error)
  }

  // Tenta encontrar uma mensagem mapeada explicitamente
  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) {
      return friendly
    }
  }

  // Se o erro vier de um RAISE EXCEPTION customizado do Postgres (P0001)
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>
    if (obj.code === 'P0001' && typeof obj.message === 'string' && obj.message.trim()) {
      if (
        obj.message.toLowerCase().includes('agendamento') ||
        obj.message.toLowerCase().includes('excluir')
      ) {
        return 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.'
      }
      return obj.message.trim()
    }
  }

  // Log técnico apenas em desenvolvimento
  if (import.meta.env.DEV) {
    console.error('[LG Clinic] Erro não mapeado:', error)
  }

  return 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.'
}
