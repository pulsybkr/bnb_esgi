/**
 * Types pour les réservations (synchronisés avec le backend)
 */

export type ReservationStatus = 'en_attente' | 'confirmee' | 'annulee' | 'en_cours' | 'terminee'

export interface Tenant {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    profilePhoto?: string
}

export interface AccommodationSummary {
    id: string
    title: string
    address: string
    city: string
    country?: string
    type: string
    pricePerNight: number
    owner?: {
        id: string
        firstName: string
        lastName: string
        email?: string
        phone?: string
        profilePhoto?: string
    }
    photos?: Array<{
        id: string
        url: string
        thumbnailUrl?: string
        isMain: boolean
    }>
}

export interface Payment {
    id: string
    amount: number
    status: string
    paymentMethod?: string
    transactionId?: string
    createdAt: Date
}

export interface Reservation {
    id: string
    accommodationId: string
    tenantId: string
    startDate: Date
    endDate: Date
    guestCount: number
    totalAmount: number
    status: ReservationStatus
    negotiatedPrice?: number
    pricePerNight?: number
    tenantMessage?: string
    cancellationReason?: string
    cancellationDate?: Date
    createdAt: Date
    updatedAt: Date
    accommodation: AccommodationSummary
    tenant: Tenant
    payments?: Payment[]
}

export interface CreateReservationData {
    accommodationId: string
    startDate: Date
    endDate: Date
    guestCount: number
    tenantMessage?: string
}

export interface ReservationFilters {
    status?: ReservationStatus
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
    sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'totalAmount'
    sortOrder?: 'asc' | 'desc'
}

export interface ReservationStatistics {
    totalReservations: number
    pendingReservations: number
    confirmedReservations: number
    completedReservations: number
    cancelledReservations: number
    totalRevenue: string
}
