import { ref } from 'vue'

export interface Toast {
    id: string
    title: string
    description?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = `toast-${toastId++}`
        const newToast: Toast = {
            id,
            duration: 5000,
            ...toast
        }

        toasts.value.push(newToast)

        // Auto remove after duration
        if (newToast.duration) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (title: string, description?: string) => {
        return addToast({ title, description, type: 'success' })
    }

    const error = (title: string, description?: string) => {
        return addToast({ title, description, type: 'error' })
    }

    const warning = (title: string, description?: string) => {
        return addToast({ title, description, type: 'warning' })
    }

    const info = (title: string, description?: string) => {
        return addToast({ title, description, type: 'info' })
    }

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    }
}
