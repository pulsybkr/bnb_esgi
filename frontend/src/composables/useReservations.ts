/**
 * Composable pour la gestion des réservations
 */

import { ref, computed } from 'vue'
import { ReservationService } from '@/services/reservation'
import { ErrorHandler } from '@/utils/api/errorHandler'
import type {
    Reservation,
    CreateReservationData,
    ReservationFilters,
    ReservationStatistics
} from '@/types/reservation'

export function useReservations() {
    const reservations = ref<Reservation[]>([])
    const currentReservation = ref<Reservation | null>(null)
    const statistics = ref<ReservationStatistics | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    })

    /**
     * Créer une réservation
     */
    const createReservation = async (data: CreateReservationData): Promise<Reservation | null> => {
        try {
            isLoading.value = true
            error.value = null

            const reservation = await ReservationService.createReservation(data)
            reservations.value.unshift(reservation)
            return reservation
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger une réservation par ID
     */
    const loadReservationById = async (id: string): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            currentReservation.value = await ReservationService.getReservationById(id)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger mes réservations (locataire)
     */
    const loadMyReservations = async (filters?: ReservationFilters): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            const response = await ReservationService.getMyReservations(filters)
            reservations.value = response.reservations
            pagination.value = {
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages
            }
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger les réservations du propriétaire
     */
    const loadOwnerReservations = async (filters?: ReservationFilters): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            const response = await ReservationService.getOwnerReservations(filters)
            reservations.value = response.reservations
            pagination.value = {
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages
            }
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger les réservations d'un logement
     */
    const loadPropertyReservations = async (
        propertyId: string,
        filters?: ReservationFilters
    ): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            reservations.value = await ReservationService.getPropertyReservations(propertyId, filters)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Accepter une réservation
     */
    const acceptReservation = async (id: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const updated = await ReservationService.acceptReservation(id)

            // Mettre à jour dans la liste
            const index = reservations.value.findIndex(r => r.id === id)
            if (index !== -1) {
                reservations.value[index] = updated
            }

            // Mettre à jour la réservation actuelle
            if (currentReservation.value?.id === id) {
                currentReservation.value = updated
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
     * Rejeter une réservation
     */
    const rejectReservation = async (id: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const updated = await ReservationService.rejectReservation(id)

            // Mettre à jour dans la liste
            const index = reservations.value.findIndex(r => r.id === id)
            if (index !== -1) {
                reservations.value[index] = updated
            }

            // Mettre à jour la réservation actuelle
            if (currentReservation.value?.id === id) {
                currentReservation.value = updated
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
     * Annuler une réservation
     */
    const cancelReservation = async (id: string, reason: string): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            const updated = await ReservationService.cancelReservation(id, reason)

            // Mettre à jour dans la liste
            const index = reservations.value.findIndex(r => r.id === id)
            if (index !== -1) {
                reservations.value[index] = updated
            }

            // Mettre à jour la réservation actuelle
            if (currentReservation.value?.id === id) {
                currentReservation.value = updated
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
     * Calculer le montant total
     */
    const calculateTotal = async (
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number | null> => {
        try {
            isLoading.value = true
            error.value = null

            return await ReservationService.calculateTotalAmount(accommodationId, startDate, endDate)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Vérifier la disponibilité
     */
    const checkAvailability = async (
        accommodationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<boolean> => {
        try {
            isLoading.value = true
            error.value = null

            return await ReservationService.checkAvailability(accommodationId, startDate, endDate)
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Charger les statistiques
     */
    const loadStatistics = async (): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            statistics.value = await ReservationService.getOwnerStatistics()
        } catch (err) {
            error.value = ErrorHandler.getErrorMessage(err)
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
        reservations: computed(() => reservations.value),
        currentReservation: computed(() => currentReservation.value),
        statistics: computed(() => statistics.value),
        pagination: computed(() => pagination.value),
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),

        // Actions
        createReservation,
        loadReservationById,
        loadMyReservations,
        loadOwnerReservations,
        loadPropertyReservations,
        acceptReservation,
        rejectReservation,
        cancelReservation,
        calculateTotal,
        checkAvailability,
        loadStatistics,
        clearError
    }
}
