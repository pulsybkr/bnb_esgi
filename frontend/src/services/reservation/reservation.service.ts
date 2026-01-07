/**
 * Service de gestion des réservations
 */

import apiClient from '../api/client'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    Reservation,
    CreateReservationData,
    ReservationFilters,
    ReservationStatistics
} from '@/types/reservation'

export class ReservationService {
    /**
     * Créer une nouvelle réservation
     */
    static async createReservation(data: CreateReservationData): Promise<Reservation> {
        try {
            const response = await apiClient.post<{
                success: boolean
                data: { reservation: Reservation }
            }>('/reservations', data)
            return response.data.data.reservation
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer une réservation par ID
     */
    static async getReservationById(id: string): Promise<Reservation> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { reservation: Reservation }
            }>(`/reservations/${id}`)
            return response.data.data.reservation
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les réservations de l'utilisateur (locataire)
     */
    static async getMyReservations(filters?: ReservationFilters): Promise<{
        reservations: Reservation[]
        total: number
        page: number
        limit: number
        totalPages: number
    }> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: {
                    reservations: Reservation[]
                    total: number
                    page: number
                    limit: number
                    totalPages: number
                }
            }>('/reservations/my', { params: filters })
            return response.data.data
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les réservations pour les logements du propriétaire
     */
    static async getOwnerReservations(filters?: ReservationFilters): Promise<{
        reservations: Reservation[]
        total: number
        page: number
        limit: number
        totalPages: number
    }> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: {
                    reservations: Reservation[]
                    total: number
                    page: number
                    limit: number
                    totalPages: number
                }
            }>('/reservations/owner', { params: filters })
            return response.data.data
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les réservations pour un logement spécifique
     */
    static async getPropertyReservations(
        propertyId: string,
        filters?: ReservationFilters
    ): Promise<Reservation[]> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { reservations: Reservation[] }
            }>(`/reservations/property/${propertyId}`, { params: filters })
            return response.data.data.reservations
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Accepter une réservation (propriétaire)
     */
    static async acceptReservation(id: string): Promise<Reservation> {
        try {
            const response = await apiClient.put<{
                success: boolean
                data: { reservation: Reservation }
            }>(`/reservations/${id}/accept`)
            return response.data.data.reservation
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Rejeter une réservation (propriétaire)
     */
    static async rejectReservation(id: string): Promise<Reservation> {
        try {
            const response = await apiClient.put<{
                success: boolean
                data: { reservation: Reservation }
            }>(`/reservations/${id}/reject`)
            return response.data.data.reservation
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Annuler une réservation
     */
    static async cancelReservation(id: string, cancellationReason: string): Promise<Reservation> {
        try {
            const response = await apiClient.put<{
                success: boolean
                data: { reservation: Reservation }
            }>(`/reservations/${id}/cancel`, { cancellationReason })
            return response.data.data.reservation
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Calculer le montant total d'une réservation
     */
    static async calculateTotalAmount(
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        try {
            const response = await apiClient.post<{
                success: boolean
                data: { totalAmount: number }
            }>('/reservations/calculate', {
                accommodationId,
                startDate,
                endDate
            })
            return response.data.data.totalAmount
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Vérifier la disponibilité pour des dates données
     */
    static async checkAvailability(
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<boolean> {
        try {
            const response = await apiClient.post<{
                success: boolean
                data: { available: boolean }
            }>('/reservations/check-availability', {
                accommodationId,
                startDate,
                endDate
            })
            return response.data.data.available
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Récupérer les statistiques des réservations (propriétaire)
     */
    static async getOwnerStatistics(): Promise<ReservationStatistics> {
        try {
            const response = await apiClient.get<{
                success: boolean
                data: { statistics: ReservationStatistics }
            }>('/reservations/owner/statistics')
            return response.data.data.statistics
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }

    /**
     * Mettre à jour le prix négocié d'une réservation
     */
    static async updateNegotiatedPrice(id: string, newPrice: number): Promise<Reservation> {
        try {
            const response = await apiClient.put<{
                success: boolean
                data: { reservation: Reservation }
            }>(`/reservations/${id}/price`, { newPrice })
            return response.data.data.reservation
        } catch (error) {
            throw ErrorHandler.handleError(error)
        }
    }
}
