/**
 * Service de gestion des logements
 */

import apiClient from '../api/client'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    Logement,
    CreatePropertyData,
    UpdatePropertyData,
    PropertyFilters,
    AddPhotoData,
    Photo,
    PropertyStatistics
} from '@/types/logement'

export class LogementService {
    /**
     * Créer un nouveau logement
     */
    static async createProperty(data: CreatePropertyData): Promise<Logement> {
        try {
            const response = await apiClient.post<{ success: boolean; data: { property: Logement } }>(
                '/logements',
                data
            )
            return response.data.data.property
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer tous les logements avec filtres et pagination
     */
    static async getAllProperties(filters?: PropertyFilters): Promise<{
        properties: Logement[]
        total: number
        page: number
        limit: number
        totalPages: number
    }> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: {
                    properties: Logement[]
                    total: number
                    page: number
                    limit: number
                    totalPages: number
                }
            }>('/logements', { params: filters })
            return response.data.data
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer un logement par ID
     */
    static async getPropertyById(id: string): Promise<Logement> {
        try {
            const response = await apiClient.get<{ success: boolean; data: { property: Logement } }>(
                `/logements/${id}`
            )
            return response.data.data.property
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les logements de l'utilisateur connecté
     */
    static async getMyProperties(filters?: Partial<PropertyFilters>): Promise<Logement[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: { properties: Logement[] } }>(
                '/logements/my',
                { params: filters }
            )
            return response.data.data.properties
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les statistiques des logements de l'utilisateur
     */
    static async getMyStatistics(): Promise<PropertyStatistics> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { statistics: PropertyStatistics }
            }>('/logements/my/statistics')
            return response.data.data.statistics
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Mettre à jour un logement
     */
    static async updateProperty(id: string, data: UpdatePropertyData): Promise<Logement> {
        try {
            const response = await apiClient.put<{ success: boolean; data: { property: Logement } }>(
                `/logements/${id}`,
                data
            )
            return response.data.data.property
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Supprimer un logement
     */
    static async deleteProperty(id: string): Promise<void> {
        try {
            await apiClient.delete(`/logements/${id}`)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Ajouter une photo à un logement
     */
    static async addPhoto(propertyId: string, data: AddPhotoData): Promise<Photo> {
        try {
            const response = await apiClient.post<{ success: boolean; data: { photo: Photo } }>(
                `/logements/${propertyId}/photos`,
                data
            )
            return response.data.data.photo
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Supprimer une photo d'un logement
     */
    static async deletePhoto(propertyId: string, photoId: string): Promise<void> {
        try {
            await apiClient.delete(`/logements/${propertyId}/photos/${photoId}`)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Définir une photo comme photo principale
     */
    static async setMainPhoto(propertyId: string, photoId: string): Promise<Photo> {
        try {
            const response = await apiClient.put<{ success: boolean; data: { photo: Photo } }>(
                `/logements/${propertyId}/photos/${photoId}/main`
            )
            return response.data.data.photo
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }
}
