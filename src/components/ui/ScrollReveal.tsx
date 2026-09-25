import React, { useEffect, useRef, useState } from 'react'

type RevealVariant = 'fade-up' | 'fade-down' | 'fade' | 'fade-left' | 'fade-right'

interface ScrollRevealProps {
  children: React.ReactNode
  variant?: RevealVariant
  delay?: number       // in milliseconds
  duration?: number    // in milliseconds
  className?: string
  as?: React.ElementType
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

const variantStyles: Record<RevealVariant, { hidden: string; visible: string }> = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-5',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    hidden: 'opacity-0 -translate-y-5',
    visible: 'opacity-100 translate-y-0',
  },
  'fade': {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  'fade-left': {
    hidden: 'opacity-0 translate-x-4',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    hidden: 'opacity-0 -translate-x-4',
    visible: 'opacity-100 translate-x-0',
  },
}

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  as: Component = 'div',
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Se o usuário preferir movimento reduzido, exibir imediatamente sem transição
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true)
      return
    }

    // Se IntersectionObserver não for suportado, exibir normalmente
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce && elementRef.current) {
            observer.unobserve(elementRef.current)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    const el = elementRef.current
    if (el) {
      observer.observe(el)
    }

    return () => {
      if (el) {
        observer.unobserve(el)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  const { hidden, visible } = variantStyles[variant]
  const stateClass = isVisible ? visible : hidden

  return (
    <Component
      ref={elementRef}
      className={`transition-all ${stateClass} ${className}`.trim()}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Component>
  )
}
