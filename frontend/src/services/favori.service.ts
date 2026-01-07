import apiClient from './api'
import type { Accommodation } from '@/types/accommodation'
import { transformBackendProperty } from './logement.service'

export interface FavoriteResponse {
    success: boolean
    data: {
        favorites: Accommodation[]
    }
}

export const favoriService = {
    /**
     * Récupérer tous les favoris de l'utilisateur
     */
    async getAll(): Promise<Accommodation[]> {
        const response = await apiClient.get<{ success: boolean; data: { favorites: any[] } }>('/favoris')
        return response.data.data.favorites.map(transformBackendProperty)
    },

    /**
     * Ajouter un logement aux favoris
     */
    async add(accommodationId: string): Promise<boolean> {
        const response = await apiClient.post('/favoris', { accommodationId })
        return response.data.success
    },

    /**
     * Retirer un logement des favoris
     */
    async remove(accommodationId: string): Promise<boolean> {
        const response = await apiClient.delete(`/favoris/${accommodationId}`)
        return response.data.success
    }
}
