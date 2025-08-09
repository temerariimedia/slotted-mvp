import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: Toast[]
}

let toastId = 0

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = (++toastId).toString()
    const newToast: Toast = { id, title, description, variant }
    
    setState(prev => ({
      toasts: [...prev.toasts, newToast]
    }))

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setState(prev => ({
        toasts: prev.toasts.filter(t => t.id !== id)
      }))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setState(prev => ({
      toasts: prev.toasts.filter(t => t.id !== id)
    }))
  }, [])

  return {
    toast,
    dismiss,
    toasts: state.toasts
  }
}