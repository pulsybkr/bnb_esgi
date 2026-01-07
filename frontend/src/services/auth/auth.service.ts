/**
 * Service d'authentification (avec cookies de session)
 */

import apiClient from '../api/client'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    LoginData,
    RegisterData,
    AuthResponse,
    UserPayload,
    ChangePasswordData,
    UpdateProfileData,
    PasswordResetData,
    ResetPasswordData
} from '@/types/auth'

export class AuthService {
    /**
     * Connexion d'un utilisateur
     * Les cookies de session sont gérés automatiquement par le navigateur
     */
    static async login(credentials: LoginData): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
                '/auth/login',
                credentials
            )

            return response.data.data
        } catch (error) {
            console.log(error)
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    static async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
                '/auth/register',
                userData
            )

            return response.data.data
        } catch (error) {
            console.log('Registration error:', error)
            console.log('Error response:', (error as any).response?.data)
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Déconnexion
     * Le cookie de session sera supprimé par le serveur
     */
    static async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout')
        } catch (error) {
            // Ignorer les erreurs de déconnexion
            console.error('Erreur lors de la déconnexion:', error)
        }
    }

    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    static async getProfile(): Promise<UserPayload> {
        try {
            const response = await apiClient.get<{ success: boolean; data: { user: UserPayload } }>(
                '/auth/profile'
            )
            return response.data.data.user
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Mettre à jour le profil de l'utilisateur
     */
    static async updateProfile(data: UpdateProfileData): Promise<UserPayload> {
        try {
            const response = await apiClient.put<{ success: boolean; data: { user: UserPayload } }>(
                '/auth/profile',
                data
            )
            return response.data.data.user
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Changer le mot de passe
     */
    static async changePassword(data: ChangePasswordData): Promise<void> {
        try {
            await apiClient.put('/auth/password', data)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Demander une réinitialisation de mot de passe
     */
    static async requestPasswordReset(data: PasswordResetData): Promise<void> {
        try {
            await apiClient.post('/auth/password-reset/request', data)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Réinitialiser le mot de passe avec un token
     */
    static async resetPassword(data: ResetPasswordData): Promise<void> {
        try {
            await apiClient.post('/auth/password-reset/reset', data)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Vérifier l'email avec un token
     */
    static async verifyEmail(token: string): Promise<void> {
        try {
            await apiClient.post('/auth/verify-email', { token })
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    static async checkAuth(): Promise<{ authenticated: boolean; user: UserPayload | null }> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { authenticated: boolean; user: UserPayload }
            }>('/auth/check')
            return response.data.data
        } catch (error) {
            return { authenticated: false, user: null }
        }
    }

    /**
     * Vérifier si l'utilisateur est propriétaire
     */
    static async checkIsOwner(): Promise<{ isOwner: boolean; userType: string }> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { isOwner: boolean; userType: string }
            }>('/auth/check-owner')
            return response.data.data
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Vérifier si l'utilisateur est admin
     */
    static async checkIsAdmin(): Promise<{ isAdmin: boolean; userType: string }> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { isAdmin: boolean; userType: string }
            }>('/auth/check-admin')
            return response.data.data
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }
}
