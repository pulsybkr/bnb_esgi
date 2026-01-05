import { ref, computed } from 'vue'

const FAVORITES_STORAGE_KEY = 'bnb_favorites'

// État réactif des favoris
const favorites = ref<Set<string>>(new Set())

// Charger les favoris depuis localStorage au démarrage
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      favorites.value = new Set(JSON.parse(stored))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error)
  }
}

export function useFavorites() {
  // Sauvegarder dans localStorage
  const saveFavorites = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites.value)))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris:', error)
      }
    }
  }

  // Ajouter un favori
  const addFavorite = (accommodationId: string) => {
    favorites.value.add(accommodationId)
    saveFavorites()
  }

  // Retirer un favori
  const removeFavorite = (accommodationId: string) => {
    favorites.value.delete(accommodationId)
    saveFavorites()
  }

  // Toggle favori
  const toggleFavorite = (accommodationId: string) => {
    if (isFavorite(accommodationId)) {
      removeFavorite(accommodationId)
    } else {
      addFavorite(accommodationId)
    }
  }

  // Vérifier si un logement est en favori
  const isFavorite = (accommodationId: string): boolean => {
    return favorites.value.has(accommodationId)
  }

  // Liste des favoris (computed)
  const favoritesList = computed(() => Array.from(favorites.value))

  return {
    favorites: computed(() => favorites.value),
    favoritesList,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  }
}

