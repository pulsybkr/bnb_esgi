/**
 * Composable pour la gestion de l'authentification (avec cookies de session)
 */

import { ref, computed } from 'vue'
import { AuthService } from '@/services/auth'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    UserPayload,
    LoginData,
    RegisterData,
    ChangePasswordData,
    UpdateProfileData
} from '@/types/auth'

// État global partagé entre toutes les instances du composable
const user = ref<UserPayload | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
    const isAuthenticated = computed(() => !!user.value)
    const isOwner = computed(() => user.value?.userType === 'proprietaire' || user.value?.userType === 'admin')
    const isAdmin = computed(() => user.value?.userType === 'admin')
    const isTenant = computed(() => user.value?.userType === 'locataire')

    /**
     * Connexion
     * Le cookie de session est géré automatiquement par le navigateur
     */
    const login = async (credentials: LoginData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const response = await AuthService.login(credentials)
            user.value = response.user

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Inscription
     */
    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const response = await AuthService.register(userData)
            user.value = response.user

            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Déconnexion
     * Le cookie de session sera supprimé par le serveur
     */
    const logout = async (): Promise<void> => {
        try {
            isLoading.value = true
            await AuthService.logout()
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err)
        } finally {
            user.value = null
            isLoading.value = false
        }
    }

    /**
     * Charger le profil utilisateur
     * Utile au démarrage de l'app pour vérifier si l'utilisateur est déjà connecté
     */
    const loadProfile = async (): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            user.value = await AuthService.getProfile()
            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            user.value = null
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Mettre à jour le profil
     */
    const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            user.value = await AuthService.updateProfile(data)
            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Changer le mot de passe
     */
    const changePassword = async (data: ChangePasswordData): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await AuthService.changePassword(data)
            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Demander une réinitialisation de mot de passe
     */
    const requestPasswordReset = async (email: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await AuthService.requestPasswordReset({ email })
            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Réinitialiser le mot de passe
     */
    const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await AuthService.resetPassword({ token, newPassword })
            return true
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Vérifier l'email
     */
    const verifyEmail = async (token: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            await AuthService.verifyEmail(token)

            // Recharger le profil pour mettre à jour emailVerified
            if (user.value) {
                await loadProfile()
            }

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
        isAuthenticated,
        isOwner,
        isAdmin,
        isTenant,
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),

        // Actions
        login,
        register,
        logout,
        loadProfile,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        clearError
    }
}
