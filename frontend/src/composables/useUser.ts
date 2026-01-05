/**
 * Composable pour la gestion du profil utilisateur
 */

import { ref, computed } from 'vue'
import { UserService } from '@/services/user'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type { User, UpdateUserData } from '@/types/user'

export function useUser() {
    const user = ref<User | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Charger un utilisateur par ID
     */
    const loadUserById = async (id: string): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            user.value = await UserService.getUserById(id)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Mettre à jour un utilisateur
     */
    const updateUser = async (id: string, data: UpdateUserData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            user.value = await UserService.updateUser(id, data)
            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Effacer l'erreur
     */
    const clearError = () => {
        error.value = null
    }

    return {
        // État
        user: computed(() => user.value),
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),

        // Actions
        loadUserById,
        updateUser,
        clearError
    }
}
