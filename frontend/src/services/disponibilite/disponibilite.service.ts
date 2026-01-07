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
    static async createDisponibilite(
        data: CreateDisponibiliteData
    ): Promise<Disponibilite> {
        try {
            const { accommodationId, ...rest } = data
            const response = await apiClient.post<{
                success: boolean
                data: { availability: Disponibilite }
            }>(`/logements/${accommodationId}/availabilities`, rest)
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
            }>(`/availabilities/${id}`)
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
            }>('/availabilities', { params: filters })
            return response.data.data.disponibilites
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les disponibilités pour un logement avec filtres
     */
    static async getPropertyDisponibilites(
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
            }>(`/availabilities/${id}`, data)
            return response.data.data.disponibilite
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Supprimer une disponibilité
     */
    static async deleteDisponibilite(id: string): Promise<void> {
        try {
            await apiClient.delete(`/availabilities/${id}`)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Créer plusieurs disponibilités en masse
     */
    static async bulkCreateDisponibilites(
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
}
