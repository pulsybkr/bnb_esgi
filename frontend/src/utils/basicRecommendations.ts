/**
 * Algorithme de recommandations basiques et simples
 */

import type { Accommodation } from '@/types/accommodation'

/**
 * Recommandations basiques basées sur des critères simples
 */
export function getBasicRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  // Exclure les logements spécifiés
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Algorithme basique : trier par score simple
  // Score = rating * 0.6 + (reviewCount / 100) * 0.4
  const withScores = filtered.map(acc => {
    const ratingScore = acc.rating * 0.6 // Note sur 5, poids 60%
    const reviewScore = Math.min(acc.reviewCount / 100, 1) * 0.4 // Nombre d'avis, poids 40%
    const score = ratingScore + reviewScore

    return {
      accommodation: acc,
      score
    }
  })

  // Trier par score décroissant et prendre les meilleurs
  return withScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

/**
 * Recommandations basées sur le prix (meilleur rapport qualité-prix)
 */
export function getBudgetFriendlyRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Score valeur = (rating * reviewCount) / price
  const withValueScores = filtered.map(acc => {
    const valueScore = (acc.rating * acc.reviewCount) / acc.price
    return {
      accommodation: acc,
      valueScore
    }
  })

  return withValueScores
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

/**
 * Recommandations basées uniquement sur la note
 */
export function getTopRatedRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Trier par note décroissante, puis par nombre d'avis en cas d'égalité
  return filtered
    .sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating
      }
      return b.reviewCount - a.reviewCount
    })
    .slice(0, maxResults)
}

/**
 * Recommandations basées sur le nombre d'avis (popularité)
 */
export function getMostReviewedRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Trier par nombre d'avis décroissant
  return filtered
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, maxResults)
}

/**
 * Recommandations basées sur le prix (du moins cher au plus cher)
 */
export function getBudgetRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Trier par prix croissant, mais filtrer ceux avec une note minimale de 4.0
  return filtered
    .filter(acc => acc.rating >= 4.0) // Au moins 4 étoiles
    .sort((a, b) => a.price - b.price)
    .slice(0, maxResults)
}

/**
 * Recommandations basées sur le superhost
 */
export function getSuperhostRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id) && acc.host.isSuperhost
  )

  // Trier par note décroissante
  return filtered
    .sort((a, b) => b.rating - a.rating)
    .slice(0, maxResults)
}

/**
 * Recommandations aléatoires (pour découvrir de nouveaux logements)
 */
export function getRandomRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Mélanger et prendre les premiers
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, maxResults)
}

/**
 * Recommandations combinées : meilleur compromis entre note, avis et prix
 */
export function getBalancedRecommendations(
  allAccommodations: Accommodation[],
  excludeIds: string[] = [],
  maxResults: number = 6
): Accommodation[] {
  const filtered = allAccommodations.filter(
    acc => !excludeIds.includes(acc.id)
  )

  // Score équilibré : 50% note, 30% avis, 20% prix (inversé)
  const maxPrice = Math.max(...filtered.map(acc => acc.price))
  const maxReviews = Math.max(...filtered.map(acc => acc.reviewCount))

  const withScores = filtered.map(acc => {
    const ratingScore = (acc.rating / 5) * 50 // Note normalisée sur 50 points
    const reviewScore = (acc.reviewCount / maxReviews) * 30 // Avis normalisés sur 30 points
    const priceScore = (1 - acc.price / maxPrice) * 20 // Prix inversé (moins cher = mieux) sur 20 points
    const score = ratingScore + reviewScore + priceScore

    return {
      accommodation: acc,
      score
    }
  })

  return withScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.accommodation)
}

