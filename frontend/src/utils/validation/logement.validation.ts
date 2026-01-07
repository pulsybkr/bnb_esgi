/**
 * Schémas de validation Zod pour les logements
 */

import { z } from 'zod'

export const createPropertySchema = z.object({
    title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200),
    description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(5000).optional(),
    address: z.string().min(1, 'L\'adresse est requise'),
    city: z.string().min(1, 'La ville est requise'),
    country: z.string().min(1, 'Le pays est requis'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    type: z.enum(['maison', 'appartement', 'chambre', 'hotel']),
    roomCount: z.number().int().min(1).max(50),
    capacity: z.number().int().min(1).max(100),
    pricePerNight: z.number().min(0),
    currency: z.string().default('XOF').optional(),
    amenities: z.any().optional(),
    houseRules: z.any().optional(),
    photos: z.array(z.object({
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        isMain: z.boolean().optional(),
        order: z.number().int().optional()
    })).optional()
})

export const updatePropertySchema = z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).max(5000).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    type: z.enum(['maison', 'appartement', 'chambre', 'hotel']).optional(),
    roomCount: z.number().int().min(1).max(50).optional(),
    capacity: z.number().int().min(1).max(100).optional(),
    pricePerNight: z.number().min(0).optional(),
    currency: z.string().optional(),
    amenities: z.any().optional(),
    houseRules: z.any().optional(),
    status: z.enum(['actif', 'suspendu', 'archive']).optional()
})

export const addPhotoSchema = z.object({
    url: z.string().url('URL invalide'),
    thumbnailUrl: z.string().url().optional(),
    isMain: z.boolean().optional(),
    order: z.number().int().optional()
})

export const propertyFiltersSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    type: z.enum(['maison', 'appartement', 'chambre', 'hotel']).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    minCapacity: z.number().int().min(1).optional(),
    status: z.enum(['actif', 'suspendu', 'archive']).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    sortBy: z.enum(['createdAt', 'pricePerNight', 'averageRating', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
})

export type CreatePropertyFormData = z.infer<typeof createPropertySchema>
export type UpdatePropertyFormData = z.infer<typeof updatePropertySchema>
export type AddPhotoFormData = z.infer<typeof addPhotoSchema>
export type PropertyFiltersFormData = z.infer<typeof propertyFiltersSchema>
