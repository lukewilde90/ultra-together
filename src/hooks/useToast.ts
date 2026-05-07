import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let globalToasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

function notify(toasts: Toast[]) {
  globalToasts = toasts
  listeners.forEach(l => l(toasts))
}

export function toast(t: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  const next = [...globalToasts, { ...t, id }]
  notify(next)
  setTimeout(() => notify(globalToasts.filter(x => x.id !== id)), 3500)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts)

  useState(() => {
    listeners.push(setToasts)
    return () => {
      const i = listeners.indexOf(setToasts)
      if (i > -1) listeners.splice(i, 1)
    }
  })

  const dismiss = useCallback((id: string) => {
    notify(globalToasts.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}
