/**
 * Service de gestion des utilisateurs
 */

import apiClient from '../api/client'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type { User, UpdateUserData } from '@/types/user'

export class UserService {
    /**
     * Récupérer un utilisateur par ID
     */
    static async getUserById(id: string): Promise<User> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { user: User }
            }>(`/users/${id}`)
            return response.data.data.user
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Mettre à jour un utilisateur
     */
    static async updateUser(id: string, data: UpdateUserData): Promise<User> {
        try {
            const response = await apiClient.put<{
                success: boolean
                data: { user: User }
            }>(`/users/${id}`, data)
            return response.data.data.user
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }
}
