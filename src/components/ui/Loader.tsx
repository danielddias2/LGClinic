interface LoaderProps {
  label?: string
}

export default function Loader({ label = 'Carregando…' }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3 py-16 text-[#71717A]"
    >
      <span
        aria-hidden="true"
        className="w-8 h-8 border-2 border-[#C4976A] border-t-transparent rounded-full animate-spin"
      />
      <span className="text-sm font-body">{label}</span>
    </div>
  )
}
