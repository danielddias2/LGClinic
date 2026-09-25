import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToTarget } from '@/utils/navigation'

export default function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '')
      // Executa no animation frame para garantir que a renderização do React e o layout estão prontos
      const raf = requestAnimationFrame(() => {
        scrollToTarget(targetId)
      })
      return () => cancelAnimationFrame(raf)
    } else {
      // Se não há hash na rota atual, garante que a página comece no topo
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  return null
}
