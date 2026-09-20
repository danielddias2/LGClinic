interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 py-12 text-center text-[#71717A]"
    >
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-[#C4976A] underline underline-offset-4 hover:text-[#18181B] transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
