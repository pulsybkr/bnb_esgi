import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { favoriService } from '@/services/favori.service'

const FAVORITES_STORAGE_KEY = 'bnb_favorites'

// État réactif des favoris (Set d'IDs de logements)
const favorites = ref<Set<string>>(new Set())
const isLoading = ref(false)

// Charger les favoris depuis localStorage au démarrage
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      favorites.value = new Set(JSON.parse(stored))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des favoris locaux:', error)
  }
}

export function useFavorites() {
  const { isAuthenticated } = useAuth()

  // Charger les favoris depuis le backend
  const loadFavorites = async () => {
    if (!isAuthenticated.value) return

    isLoading.value = true
    try {
      const backendFavorites = await favoriService.getAll()
      // Fusionner avec les favoris locaux ou remplacer ?
      // Pour l'instant, on remplace par les favoris du serveur
      favorites.value = new Set(backendFavorites.map(acc => acc.id))
      saveLocalFavorites()
    } catch (error) {
      console.error('Erreur lors du chargement des favoris backend:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Sauvegarder dans localStorage (fallback/cache)
  const saveLocalFavorites = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites.value)))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris locaux:', error)
      }
    }
  }

  // Ajouter un favori
  const addFavorite = async (accommodationId: string) => {
    favorites.value.add(accommodationId)
    saveLocalFavorites()

    if (isAuthenticated.value) {
      try {
        await favoriService.add(accommodationId)
      } catch (error) {
        console.error('Erreur lors de l\'ajout au favoris backend:', error)
      }
    }
  }

  // Retirer un favori
  const removeFavorite = async (accommodationId: string) => {
    favorites.value.delete(accommodationId)
    saveLocalFavorites()

    if (isAuthenticated.value) {
      try {
        await favoriService.remove(accommodationId)
      } catch (error) {
        console.error('Erreur lors du retrait des favoris backend:', error)
      }
    }
  }

  // Toggle favori
  const toggleFavorite = async (accommodationId: string) => {
    if (isFavorite(accommodationId)) {
      await removeFavorite(accommodationId)
    } else {
      await addFavorite(accommodationId)
    }
  }

  // Vérifier si un logement est en favori
  const isFavorite = (accommodationId: string): boolean => {
    return favorites.value.has(accommodationId)
  }

  // Liste des favoris (computed)
  const favoritesList = computed(() => Array.from(favorites.value))

  // Charger les favoris au changement d'authentification
  watch(isAuthenticated, (newVal) => {
    if (newVal) {
      loadFavorites()
    } else {
      // Optionnel : Vider les favoris à la déconnexion ?
      // favorites.value = new Set()
      // saveLocalFavorites()
    }
  }, { immediate: true })

  return {
    favorites: computed(() => favorites.value),
    favoritesList,
    isLoading: computed(() => isLoading.value),
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loadFavorites
  }
}


