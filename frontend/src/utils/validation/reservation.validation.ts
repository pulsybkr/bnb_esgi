/**
 * Schémas de validation Zod pour les réservations
 */

import { z } from 'zod'

export const createReservationSchema = z.object({
    accommodationId: z.string().min(1, 'L\'ID du logement est requis'),
    startDate: z.date(),
    endDate: z.date(),
    guestCount: z.number().int().min(1, 'Le nombre de voyageurs doit être au moins 1'),
    tenantMessage: z.string().max(1000).optional()
}).refine((data) => data.endDate > data.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate']
})

export const reservationFiltersSchema = z.object({
    status: z.enum(['en_attente', 'confirmee', 'annulee', 'en_cours', 'terminee']).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'totalAmount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
})

export const cancelReservationSchema = z.object({
    cancellationReason: z.string().min(10, 'La raison de l\'annulation doit contenir au moins 10 caractères').max(500)
})

export type CreateReservationFormData = z.infer<typeof createReservationSchema>
export type ReservationFiltersFormData = z.infer<typeof reservationFiltersSchema>
export type CancelReservationFormData = z.infer<typeof cancelReservationSchema>
