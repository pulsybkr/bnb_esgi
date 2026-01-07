/**
 * Mapper pour convertir les données du backend (Logement) vers le frontend (Accommodation)
 */

import type { Logement } from '@/types/logement'
import type { Accommodation } from '@/types/accommodation'
import { PropertyType } from '@/types/accommodation'

/**
 * Convertit le type de propriété du backend vers le frontend
 */
function mapPropertyType(backendType: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
        'maison': PropertyType.HOUSE,
        'appartement': PropertyType.APARTMENT,
        'chambre': PropertyType.STUDIO, // Chambre → Studio (approximation)
        'hotel': PropertyType.APARTMENT, // Hotel → Apartment (approximation)
    }

    return typeMap[backendType] || PropertyType.APARTMENT
}

/**
 * Convertit un objet Logement (backend) en Accommodation (frontend)
 */
export function mapLogementToAccommodation(logement: Logement): Accommodation {
    // Extraire la photo principale ou la première photo
    const mainPhoto = logement.photos.find(p => p.isMain) || logement.photos[0]
    const images = logement.photos.map(p => p.url)

    // Convertir le prix de Decimal à number
    const price = typeof logement.pricePerNight === 'number'
        ? logement.pricePerNight
        : parseFloat(String(logement.pricePerNight))

    // Convertir les coordonnées si elles existent
    const coordinates = logement.latitude && logement.longitude ? {
        latitude: typeof logement.latitude === 'number'
            ? logement.latitude
            : parseFloat(String(logement.latitude)),
        longitude: typeof logement.longitude === 'number'
            ? logement.longitude
            : parseFloat(String(logement.longitude))
    } : undefined

    return {
        id: logement.id,
        title: logement.title,
        description: logement.description || '',
        price,
        location: {
            city: logement.city,
            country: logement.country,
            address: logement.address,
            coordinates
        },
        images: images.length > 0 ? images : ['/placeholder-property.jpg'],
        amenities: Array.isArray(logement.amenities)
            ? logement.amenities
            : (logement.amenities ? Object.values(logement.amenities) : []),
        maxGuests: logement.capacity,
        bedrooms: logement.roomCount,
        bathrooms: 1, // Valeur par défaut, le backend n'a pas ce champ
        rating: logement.averageRating || 0,
        reviewCount: logement._count?.reservations || 0, // Approximation
        host: {
            name: `${logement.owner.firstName} ${logement.owner.lastName}`,
            avatar: logement.owner.profilePhoto || '/placeholder-avatar.jpg',
            isSuperhost: false // Valeur par défaut, à implémenter plus tard
        },
        propertyType: mapPropertyType(logement.type),
        bookingMode: (logement as any).bookingMode || 'instant',
        availability: {
            checkIn: '15:00', // Valeur par défaut
            checkOut: '11:00',  // Valeur par défaut
            minNights: 1,
            maxNights: 30
        },
        pricing: {
            basePrice: price,
            cleaningFee: 0,
            serviceFee: 0
        }
    }
}

/**
 * Convertit un tableau de Logements en Accommodations
 */
export function mapLogementsToAccommodations(logements: Logement[]): Accommodation[] {
    return logements.map(mapLogementToAccommodation)
}
