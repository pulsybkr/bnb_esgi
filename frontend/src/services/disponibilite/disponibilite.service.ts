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
     * Créer une nouvelle disponibilité
     */
    static async createDisponibilite(data: CreateDisponibiliteData): Promise<Disponibilite> {
        try {
            const response = await apiClient.post<{
                success: boolean
                data: { disponibilite: Disponibilite }
            }>('/disponibilites', data)
            return response.data.data.disponibilite
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
     * Récupérer les disponibilités pour un logement
     */
    static async getPropertyDisponibilites(propertyId: string): Promise<Disponibilite[]> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { disponibilites: Disponibilite[] }
            }>(`/disponibilites/property/${propertyId}`)
            return response.data.data.disponibilites
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
    static async deleteDisponibilite(id: string): Promise<void> {
        try {
            await apiClient.delete(`/disponibilites/${id}`)
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }
}
