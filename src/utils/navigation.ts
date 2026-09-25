/**
 * Utilitário centralizado de navegação e rolagem suave para a LG Clinic.
 *
 * Garante que âncoras internas (#sobre, #servicos, #contato) e links para o topo ('/')
 * funcionem de forma 100% determinística em:
 * - Desktop, Tablet e Mobile
 * - Navegação na mesma página (mesmo clicando repetidas vezes no mesmo link)
 * - Navegação entre rotas (/agendamento -> /#servicos)
 * - Carregamento inicial com hash na URL
 */

export function scrollToTarget(targetId: string): boolean {
  if (typeof window === 'undefined') return false

  // Se o destino for o topo / início
  if (!targetId || targetId === 'inicio') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname)
    }
    return true
  }

  // Busca o elemento com o ID especificado
  const element = document.getElementById(targetId)
  if (element) {
    // scrollIntoView respeita nativamente scroll-margin-top e scroll-padding-top
    element.scrollIntoView({ behavior: 'smooth' })
    window.history.pushState(null, '', `/#${targetId}`)
    return true
  }

  return false
}
