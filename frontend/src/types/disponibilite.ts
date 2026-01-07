/**
 * Types pour les disponibilités (synchronisés avec le backend)
 */

export type DisponibiliteStatus = 'disponible' | 'reserve' | 'bloque'

export interface Disponibilite {
    id: string
    accommodationId: string
    startDate: Date
    endDate: Date
    status: DisponibiliteStatus
    customPrice?: number
    minimumStay?: number
    note?: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateDisponibiliteData {
    accommodationId: string
    startDate: Date
    endDate: Date
    status: DisponibiliteStatus
    customPrice?: number
    minimumStay?: number
    note?: string
}

export interface UpdateDisponibiliteData {
    accommodationId?: string
    startDate?: Date
    endDate?: Date
    status?: DisponibiliteStatus
    customPrice?: number
    minimumStay?: number
    note?: string
}

export interface DisponibiliteFilters {
    accommodationId?: string
    status?: DisponibiliteStatus
    startDate?: Date
    endDate?: Date
}
