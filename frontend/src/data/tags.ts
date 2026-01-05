/**
 * Tags prédéfinis pour catégoriser les logements
 */

export interface Tag {
  id: string
  label: string
  category: 'style' | 'location' | 'feature' | 'audience' | 'special'
  color?: string
}

export const availableTags: Tag[] = [
  // Style/Ambiance
  { id: 'romantic', label: 'Romantique', category: 'style' },
  { id: 'luxury', label: 'Luxe', category: 'style' },
  { id: 'cozy', label: 'Cosy', category: 'style' },
  { id: 'modern', label: 'Moderne', category: 'style' },
  { id: 'rustic', label: 'Rustique', category: 'style' },
  { id: 'minimalist', label: 'Minimaliste', category: 'style' },
  
  // Localisation
  { id: 'city-center', label: 'Centre-ville', category: 'location' },
  { id: 'sea-view', label: 'Vue mer', category: 'location' },
  { id: 'mountain-view', label: 'Vue montagne', category: 'location' },
  { id: 'quiet', label: 'Calme', category: 'location' },
  { id: 'beachfront', label: 'En bord de mer', category: 'location' },
  { id: 'countryside', label: 'Campagne', category: 'location' },
  
  // Caractéristiques
  { id: 'pool', label: 'Piscine', category: 'feature' },
  { id: 'garden', label: 'Jardin', category: 'feature' },
  { id: 'terrace', label: 'Terrasse', category: 'feature' },
  { id: 'fireplace', label: 'Cheminée', category: 'feature' },
  { id: 'parking', label: 'Parking', category: 'feature' },
  { id: 'balcony', label: 'Balcon', category: 'feature' },
  
  // Public cible
  { id: 'family-friendly', label: 'Familial', category: 'audience' },
  { id: 'business', label: 'Idéal pour le travail', category: 'audience' },
  { id: 'pet-friendly', label: 'Animaux acceptés', category: 'audience' },
  { id: 'accessible', label: 'Accessible PMR', category: 'audience' },
  { id: 'group', label: 'Pour groupes', category: 'audience' },
  
  // Spécial
  { id: 'new', label: 'Nouveau', category: 'special' },
  { id: 'popular', label: 'Populaire', category: 'special' },
  { id: 'eco-friendly', label: 'Éco-responsable', category: 'special' },
  { id: 'trending', label: 'Tendance', category: 'special' },
  { id: 'superhost', label: 'Superhost', category: 'special' },
]

export const tagsByCategory = {
  style: availableTags.filter(t => t.category === 'style'),
  location: availableTags.filter(t => t.category === 'location'),
  feature: availableTags.filter(t => t.category === 'feature'),
  audience: availableTags.filter(t => t.category === 'audience'),
  special: availableTags.filter(t => t.category === 'special'),
}

/**
 * Obtient un tag par son ID
 */
export function getTagById(id: string): Tag | undefined {
  return availableTags.find(tag => tag.id === id)
}

/**
 * Obtient les labels des tags à partir de leurs IDs
 */
export function getTagLabels(tagIds: string[]): string[] {
  return tagIds
    .map(id => getTagById(id)?.label)
    .filter((label): label is string => label !== undefined)
}

