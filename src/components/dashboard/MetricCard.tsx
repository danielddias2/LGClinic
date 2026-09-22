import { Link } from 'react-router-dom'

interface MetricCardProps {
  label: string
  value: number | string
  subtext?: string
  icon?: React.ReactNode
  href?: string
  highlight?: boolean
  isLoading?: boolean
  badgeText?: string
  badgeVariant?: 'amber' | 'emerald' | 'default'
}

export default function MetricCard({
  label,
  value,
  subtext,
  icon,
  href,
  highlight = false,
  isLoading = false,
  badgeText,
  badgeVariant = 'default',
}: MetricCardProps) {
  const badgeClasses = {
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    default: 'bg-[#FAF3EB] text-[#A26D3B] border border-[#EAD7C3]',
  }

  const content = (
    <div
      className={[
        'p-5 sm:p-6 bg-white border rounded shadow-xs flex flex-col justify-between transition-all duration-200 min-h-[142px]',
        highlight
          ? 'border-[#C4976A] ring-1 ring-[#C4976A]/30'
          : 'border-[#E8E0D6] hover:border-[#C4976A]',
        href ? 'group cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#71717A]">
          {label}
        </span>
        {icon && (
          <div
            className={[
              'w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors',
              highlight
                ? 'bg-[#F5EFE8] text-[#C4976A]'
                : 'bg-[#FAFAF8] text-[#71717A] group-hover:text-[#C4976A]',
            ].join(' ')}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-16 bg-[#E8E0D6]/60 rounded animate-pulse" />
            <div className="h-3 w-28 bg-[#E8E0D6]/40 rounded animate-pulse" />
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display text-3xl sm:text-4xl font-light text-[#18181B]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {value}
              </span>
              {badgeText && (
                <span
                  className={[
                    'text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded-full',
                    badgeClasses[badgeVariant],
                  ].join(' ')}
                >
                  {badgeText}
                </span>
              )}
            </div>
            {subtext && (
              <p className="text-xs text-[#71717A] mt-1 line-clamp-1">
                {subtext}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4976A] rounded">
        {content}
      </Link>
    )
  }

  return content
}
