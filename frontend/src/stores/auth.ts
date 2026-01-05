import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    city?: string
    country?: string
    profilePhoto?: string
    userType: 'locataire' | 'proprietaire' | 'admin'
    emailVerified: boolean
    phoneVerified: boolean
    preferences?: unknown
    status: string
    registrationDate: string
    lastLogin?: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
}

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null)
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
    const fullName = computed(() => {
        if (!user.value) return ''
        return `${user.value.firstName} ${user.value.lastName}`
    })
    const isOwner = computed(() => user.value?.userType === 'proprietaire' || user.value?.userType === 'admin')
    const isAdmin = computed(() => user.value?.userType === 'admin')

    // Actions
    function setUser(userData: User | null) {
        user.value = userData
    }

    function setTokens(access: string | null, refresh: string | null) {
        accessToken.value = access
        refreshToken.value = refresh
    }

    function setError(errorMessage: string | null) {
        error.value = errorMessage
    }

    function setLoading(loading: boolean) {
        isLoading.value = loading
    }

    function clearAuth() {
        user.value = null
        accessToken.value = null
        refreshToken.value = null
        error.value = null
    }

    return {
        // State
        user,
        accessToken,
        refreshToken,
        isLoading,
        error,

        // Getters
        isAuthenticated,
        fullName,
        isOwner,
        isAdmin,

        // Actions
        setUser,
        setTokens,
        setError,
        setLoading,
        clearAuth,
    }
}, {
    persist: {
        key: 'bnb-auth',
        storage: localStorage,
        pick: ['user', 'accessToken', 'refreshToken']
    }
})
