import { ref, watch } from 'vue'

const STORAGE_KEY = 'bnb_search_history'
const MAX_HISTORY_ITEMS = 10

export function useSearchHistory() {
  const searchHistory = ref<string[]>([])

  // Charger l'historique depuis le localStorage
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        searchHistory.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
      searchHistory.value = []
    }
  }

  // Sauvegarder l'historique dans le localStorage
  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error)
    }
  }

  // Ajouter une recherche à l'historique
  const addToHistory = (query: string) => {
    if (!query || query.trim().length < 2) return

    const trimmedQuery = query.trim()
    
    // Supprimer la recherche si elle existe déjà (pour la remonter en premier)
    searchHistory.value = searchHistory.value.filter(item => item !== trimmedQuery)
    
    // Ajouter en première position
    searchHistory.value.unshift(trimmedQuery)
    
    // Limiter le nombre d'éléments
    if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
      searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
    }
    
    saveHistory()
  }

  // Supprimer une recherche de l'historique
  const removeFromHistory = (query: string) => {
    searchHistory.value = searchHistory.value.filter(item => item !== query)
    saveHistory()
  }

  // Effacer tout l'historique
  const clearHistory = () => {
    searchHistory.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // Charger l'historique au démarrage
  loadHistory()

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  }
}



