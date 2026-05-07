import { useToast } from '@/hooks/useToast'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg cursor-pointer
            ${t.variant === 'destructive'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-white border border-stone-200 text-stone-800'}`}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && <p className="text-xs text-stone-500 mt-0.5">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
