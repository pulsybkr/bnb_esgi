/**
 * Service de gestion des disponibilités
 */

import apiClient from '../api/client'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    Disponibilite,
    CreateDisponibiliteData,
    UpdateDisponibiliteData,
    DisponibiliteFilters
} from '@/types/disponibilite'

export class DisponibiliteService {
    /**
     * Créer une disponibilité pour un logement
     */
    static async createAvailability(
        accommodationId: string,
        data: CreateDisponibiliteData
    ): Promise<Disponibilite> {
        try {
            const response = await apiClient.post<{
                success: boolean
                data: { availability: Disponibilite }
            }>(`/logements/${accommodationId}/availabilities`, data)
            return response.data.data.availability
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer une disponibilité par ID
     */
    static async getDisponibiliteById(id: string): Promise<Disponibilite> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { disponibilite: Disponibilite }
            }>(`/disponibilites/${id}`)
            return response.data.data.disponibilite
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les disponibilités avec filtres
     */
    static async getDisponibilites(filters?: DisponibiliteFilters): Promise<Disponibilite[]> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { disponibilites: Disponibilite[] }
            }>('/disponibilites', { params: filters })
            return response.data.data.disponibilites
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les disponibilités pour un logement avec filtres
     */
    static async getPropertyAvailabilities(
        accommodationId: string,
        filters?: DisponibiliteFilters
    ): Promise<Disponibilite[]> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { availabilities: Disponibilite[] }
            }>(`/logements/${accommodationId}/availabilities`, { params: filters })
            return response.data.data.availabilities
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les dates disponibles pour un logement
     */
    static async getAvailableDates(
        accommodationId: string,
        startDate: string,
        endDate: string
    ): Promise<Disponibilite[]> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { availableDates: Disponibilite[] }
            }>(`/logements/${accommodationId}/available-dates`, {
                params: { startDate, endDate }
            })
            return response.data.data.availableDates
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Mettre à jour une disponibilité
     */
    static async updateDisponibilite(
        id: string,
        data: UpdateDisponibiliteData
    ): Promise<Disponibilite> {
        try {
            const response = await apiClient.put<{
                success: boolean
                data: { disponibilite: Disponibilite }
            }>(`/disponibilites/${id}`, data)
            return response.data.data.disponibilite
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Supprimer une disponibilité
     */
    static async deleteAvailability(id: string): Promise<void> {
        try {
            await apiClient.delete(`/availabilities/${id}`)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Créer plusieurs disponibilités en masse
     */
    static async bulkCreateAvailabilities(
        accommodationId: string,
        periods: CreateDisponibiliteData[]
    ): Promise<Disponibilite[]> {
        try {
            const response = await apiClient.post<{
                success: boolean
                data: { availabilities: Disponibilite[] }
            }>(`/logements/${accommodationId}/availabilities/bulk`, { periods })
            return response.data.data.availabilities
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    // Aliases pour compatibilité avec useDisponibilites.ts
    static async getPropertyDisponibilites(propertyId: string): Promise<Disponibilite[]> {
        return this.getPropertyAvailabilities(propertyId)
    }

    static async createDisponibilite(data: CreateDisponibiliteData & { logementId: string }): Promise<Disponibilite> {
        return this.createAvailability(data.logementId, data)
    }

    static async deleteDisponibilite(id: string): Promise<void> {
        return this.deleteAvailability(id)
    }
}
