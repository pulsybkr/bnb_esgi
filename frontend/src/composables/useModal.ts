import { ref, onMounted, onUnmounted } from 'vue'

export function useModal() {
    const isOpen = ref(false)

    const open = () => {
        isOpen.value = true
        // Lock body scroll
        document.body.style.overflow = 'hidden'
    }

    const close = () => {
        isOpen.value = false
        // Unlock body scroll
        document.body.style.overflow = ''
    }

    const toggle = () => {
        if (isOpen.value) {
            close()
        } else {
            open()
        }
    }

    // Handle ESC key
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen.value) {
            close()
        }
    }

    onMounted(() => {
        document.addEventListener('keydown', handleEscape)
    })

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape)
        // Ensure body scroll is unlocked on unmount
        document.body.style.overflow = ''
    })

    return {
        isOpen,
        open,
        close,
        toggle
    }
}
