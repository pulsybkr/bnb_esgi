import apiClient from './api'

export type BackendReservationStatus =
  | 'en_attente'
  | 'confirmee'
  | 'annulee'
  | 'terminee'
  | 'en_cours'

export interface BackendReservation {
  id: string
  accommodationId: string
  tenantId: string
  startDate: string
  endDate: string
  guestCount: number
  totalAmount: string | number
  currency: string
  status: BackendReservationStatus
  tenantMessage?: string | null
  cancellationReason?: string | null
  cancellationDate?: string | null
  createdAt: string
  updatedAt: string
  tenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    profilePhoto?: string | null
  }
}

export interface CreateReservationPayload {
  accommodationId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  guestCount: number
  tenantMessage?: string
}

export const reservationService = {
  /**
   * Réservations d'un logement (propriétaire uniquement)
   * Route backend: GET /reservations/logements/:id/reservations
   */
  async getPropertyReservations(propertyId: string, params?: { status?: BackendReservationStatus }) {
    const response = await apiClient.get(`/reservations/logements/${propertyId}/reservations`, { params })
    return (response.data?.data?.reservations || []) as BackendReservation[]
  },

  /**
   * Accepter une réservation (propriétaire)
   */
  async acceptReservation(reservationId: string) {
    const response = await apiClient.post(`/reservations/${reservationId}/accept`)
    return response.data?.data?.reservation
  },

  /**
   * Rejeter une réservation (propriétaire)
   */
  async rejectReservation(reservationId: string) {
    const response = await apiClient.post(`/reservations/${reservationId}/reject`)
    return response.data?.data?.reservation
  },

  /**
   * Annuler une réservation (locataire ou propriétaire selon règles backend)
   */
  async cancelReservation(reservationId: string, cancellationReason: string) {
    const response = await apiClient.post(`/reservations/${reservationId}/cancel`, { cancellationReason })
    return response.data?.data?.reservation
  },

  /**
   * Créer une demande de réservation (locataire)
   * Route backend: POST /reservations
   */
  async createReservation(payload: CreateReservationPayload) {
    const response = await apiClient.post(`/reservations`, payload)
    return response.data?.data?.reservation as BackendReservation
  },
}


