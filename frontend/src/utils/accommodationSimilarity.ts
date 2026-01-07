/**
 * Utilitaires pour trouver des logements similaires et populaires
 */

import type { Accommodation } from '@/types/accommodation'
import type { Coordinates } from '@/utils/geolocation'
import { calculateDistance, findPointsInRadius } from '@/utils/geolocation'

/**
 * Calcule un score de similarité entre deux logements
 */
function calculateSimilarityScore(
  accommodation1: Accommodation,
  accommodation2: Accommodation
): number {
  let score = 0
  let factors = 0

  // Type de propriété (poids: 30%)
  if (accommodation1.propertyType === accommodation2.propertyType) {
    score += 30
  }
  factors += 30

  // Prix (poids: 20%) - tolérance de 20%
  const priceDiff = Math.abs(accommodation1.price - accommodation2.price)
  const avgPrice = (accommodation1.price + accommodation2.price) / 2
  const priceSimilarity = Math.max(0, 20 - (priceDiff / avgPrice) * 20)
  score += priceSimilarity
  factors += 20

  // Nombre de chambres (poids: 15%)
  if (accommodation1.bedrooms === accommodation2.bedrooms) {
    score += 15
  } else if (Math.abs(accommodation1.bedrooms - accommodation2.bedrooms) === 1) {
    score += 7.5
  }
  factors += 15

  // Nombre de salles de bain (poids: 10%)
  if (accommodation1.bathrooms === accommodation2.bathrooms) {
    score += 10
  } else if (Math.abs(accommodation1.bathrooms - accommodation2.bathrooms) === 1) {
    score += 5
  }
  factors += 10

  // Équipements communs (poids: 15%)
  const commonAmenities = accommodation1.amenities.filter(amenity =>
    accommodation2.amenities.includes(amenity)
  )
  const amenityScore = (commonAmenities.length / Math.max(accommodation1.amenities.length, accommodation2.amenities.length)) * 15
  score += amenityScore
  factors += 15

  // Tags communs (poids: 10%)
  if (accommodation1.tags && accommodation2.tags) {
    const commonTags = accommodation1.tags.filter(tag =>
      accommodation2.tags!.includes(tag)
    )
    const tagScore = (commonTags.length / Math.max(accommodation1.tags.length, accommodation2.tags.length)) * 10
    score += tagScore
  }
  factors += 10

  // Distance géographique (si disponible, poids: bonus jusqu'à 10%)
  if (
    accommodation1.location.coordinates &&
    accommodation2.location.coordinates
  ) {
    const distance = calculateDistance(
      accommodation1.location.coordinates,
      accommodation2.location.coordinates
    )
    // Si à moins de 10km, bonus de 10%, puis diminue
    const distanceBonus = Math.max(0, 10 - distance / 10)
    score += distanceBonus
    // Ne pas ajouter aux factors car c'est un bonus optionnel
  }

  return Math.round((score / factors) * 100) / 100
}

/**
 * Trouve les logements similaires à un logement donné
 */
export function findSimilarAccommodations(
  accommodation: Accommodation,
  allAccommodations: Accommodation[],
  maxResults: number = 6
): Accommodation[] {
  // Exclure le logement actuel
  const otherAccommodations = allAccommodations.filter(
    acc => acc.id !== accommodation.id
  )

  // Calculer les scores de similarité
  const withScores = otherAccommodations.map(acc => ({
    accommodation: acc,
    similarity: calculateSimilarityScore(accommodation, acc)
  }))

  // Trier par score décroissant et prendre les meilleurs
  return withScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

/**
 * Trouve les logements populaires dans une zone donnée
 */
export function findPopularAccommodations(
  allAccommodations: Accommodation[],
  location?: Coordinates,
  radiusKm: number = 50,
  maxResults: number = 6
): Accommodation[] {
  let filtered = [...allAccommodations]

  // Filtrer par géolocalisation si une position est fournie
  if (location) {
    const withDistance = findPointsInRadius(
      allAccommodations.map(acc => ({
        ...acc,
        coordinates: acc.location.coordinates
      })),
      location,
      radiusKm
    )
    filtered = withDistance.map(({ distance, ...acc }) => acc as Accommodation)
  }

  // Calculer un score de popularité basé sur:
  // - Note (poids: 40%)
  // - Nombre d'avis (poids: 30%)
  // - Note du host (superhost: +30%)
  const withPopularity = filtered.map(acc => {
    const ratingScore = acc.rating * 40 // Max 200 (5*40)
    const reviewScore = Math.min(acc.reviewCount / 10, 30) // Max 30
    const hostBonus = acc.host.isSuperhost ? 30 : 0
    const popularity = ratingScore + reviewScore + hostBonus

    return {
      accommodation: acc,
      popularity
    }
  })

  // Trier par popularité décroissante
  return withPopularity
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

