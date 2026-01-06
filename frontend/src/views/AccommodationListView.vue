<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16 gap-8">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">bnb</h1>
          </div>
          
          <!-- Espace pour aligner avec la sidebar -->
          <div class="w-80 flex-shrink-0"></div>
          
          <!-- Barre de recherche alignée avec les cards -->
          <div class="flex-1 relative">
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par titre, description ou ville..."
                class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @focus="showHistoryDropdown = true"
                @blur="hideHistoryDropdown"
                @keyup.enter="handleSearch"
              />
              <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Dropdown historique de recherche -->
            <div 
              v-if="showHistoryDropdown && searchHistory.length > 0 && !searchQuery"
              class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              <div class="p-2">
                <div class="flex justify-between items-center px-3 py-2 mb-1">
                  <h3 class="text-sm font-medium text-gray-700">Recherches récentes</h3>
                  <button 
                    @mousedown.prevent="clearHistory"
                    class="text-xs text-gray-500 hover:text-gray-700"
                    type="button"
                  >
                    Tout effacer
                  </button>
                </div>
                <div
                  v-for="(item, index) in searchHistory"
                  :key="index"
                  @mousedown.prevent="selectHistoryItem(item)"
                  class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md group cursor-pointer"
                >
                  <div class="flex items-center space-x-2">
                    <Search class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-700">{{ item }}</span>
                  </div>
                  <button
                    @mousedown.prevent.stop="removeFromHistory(item)"
                    class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                    type="button"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <router-link
              to="/favorites"
              class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Mes favoris"
            >
              <Heart 
                class="w-5 h-5" 
                :class="{ 'fill-red-500 text-red-500': favoritesList && favoritesList.value && favoritesList.value.length > 0 }" 
              />
              <span 
                v-if="favoritesList && favoritesList.value && favoritesList.value.length > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
              >
                {{ favoritesList.value.length }}
              </span>
            </router-link>
            <button class="p-2 text-gray-600 hover:text-gray-900" type="button" title="Mon compte">
              <User class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar avec filtres -->
        <div class="w-80 flex-shrink-0">
          <FilterSidebar @filters-changed="handleFiltersChanged" />
        </div>

        <!-- Contenu principal -->
        <div class="flex-1">
          <!-- Messages d'erreur -->
          <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <!-- Résultats et tri -->
          <div class="mb-6">
            <div class="flex justify-end items-center mb-4">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">Trier par :</span>
                <select 
                  v-model="sortBy"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating-desc">Mieux notés</option>
                  <option value="title-asc">Nom A-Z</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Logements populaires (optionnel, seulement si beaucoup de logements) -->
          <PopularAccommodations
            v-if="!hasActiveFilters && !isLoading && allAccommodations.length > 12"
            :all-accommodations="allAccommodations"
            :location="currentFilters.locationRadius?.center"
            :location-name="searchQuery || undefined"
            :radius-km="currentFilters.locationRadius?.radiusKm || 50"
            :max-results="6"
            @accommodation-selected="goToDetail"
            class="mb-12"
          />

          <!-- Recommandations personnalisées (optionnel, seulement si beaucoup de logements) -->
          <RecommendationsAccommodations
            v-if="!hasActiveFilters && !isLoading && allAccommodations.length > 12 && userPreferences"
            :all-accommodations="allAccommodations"
            :user-preferences="userPreferences"
            :max-results="6"
            recommendation-type="personalized"
            @accommodation-selected="goToDetail"
            class="mb-12"
          />

          <!-- Titre de la section principale -->
          <div v-if="!isLoading && filteredAccommodations.length > 0" class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              <span v-if="hasActiveFilters">Résultats de votre recherche</span>
              <span v-else>Tous les logements</span>
            </h2>
          </div>

          <!-- Grille des logements -->
          <div v-if="!isLoading && filteredAccommodations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AccommodationCard 
              v-for="accommodation in paginatedAccommodations" 
              :key="accommodation.id"
              :accommodation="accommodation"
            />
          </div>

          <!-- Message si aucun résultat -->
          <div v-if="!isLoading && filteredAccommodations.length === 0" class="text-center py-12">
            <Home class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun logement trouvé</h3>
            <p class="text-gray-600">
              <span v-if="hasActiveFilters">Essayez de modifier vos critères de recherche</span>
              <span v-else>Les logements sont en cours de chargement ou la base de données est vide</span>
            </p>
          </div>

          <!-- Message si chargement -->
          <div v-if="isLoading" class="text-center py-12">
            <p class="text-gray-600">Chargement des logements...</p>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <nav class="flex space-x-2">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                ← Précédent
              </button>
              
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  page === currentPage 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
                type="button"
              >
                {{ page }}
              </button>
              
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                Suivant →
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, User, Home, X, Heart } from 'lucide-vue-next'
import AccommodationCard from '@/components/AccommodationCard.vue'
import FilterSidebar from '@/components/FilterSidebar.vue'
import { accommodations } from '@/data/fixtures'
import type { Accommodation, FilterOptions } from '@/types/accommodation'
import { useSearchHistory } from '@/composables/useSearchHistory'
import { useFavorites } from '@/composables/useFavorites'
import { getTagLabels } from '@/data/tags'
import { generatePreferencesFromHistory } from '@/utils/recommendations'
import type { UserPreferences } from '@/utils/recommendations'
import { calculateDistance } from '@/utils/geolocation'
import PopularAccommodations from '@/components/PopularAccommodations.vue'
import RecommendationsAccommodations from '@/components/RecommendationsAccommodations.vue'
import { logementService } from '@/services/logement.service'

console.log('📋 AccommodationListView: Script setup chargé')

const router = useRouter()
const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()
const { favoritesList } = useFavorites()

// État réactif
const allAccommodations = ref<Accommodation[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
})

// Préférences utilisateur pour les recommandations
const userPreferences = computed<UserPreferences | undefined>(() => {
  try {
    // Générer des préférences basées sur l'historique de recherche
    // Dans une vraie app, cela pourrait venir d'un store utilisateur
    if (searchHistory.value.length > 0) {
      // Simuler des logements consultés basés sur l'historique
      const viewedAccommodations = allAccommodations.value.filter(acc =>
        searchHistory.value.some(query =>
          query.toLowerCase().includes(acc.location.city.toLowerCase()) ||
          acc.title.toLowerCase().includes(query.toLowerCase())
        )
      ).slice(0, 5) // Limiter à 5 pour la démo

      if (viewedAccommodations.length > 0) {
        return generatePreferencesFromHistory(searchHistory.value, viewedAccommodations)
      }
    }
    return undefined
  } catch (error) {
    console.error('Erreur lors de la génération des préférences:', error)
    return undefined
  }
})

const searchQuery = ref('')
const showHistoryDropdown = ref(false)
const currentFilters = ref<FilterOptions>({
  priceRange: [0, 1000],
  propertyType: [],
  amenities: [],
  tags: [],
  maxGuests: 0,
  bedrooms: 0,
  bathrooms: 0
})
const sortBy = ref('price-asc')
const currentPage = ref(1)
const itemsPerPage = 9

// Filtrage des logements
const filteredAccommodations = computed(() => {
  try {
  let filtered = [...allAccommodations.value]

  // Filtre par recherche textuelle (titre et description)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(acc => 
      acc.title.toLowerCase().includes(query) || 
      acc.description.toLowerCase().includes(query) ||
      acc.location.city.toLowerCase().includes(query) ||
      acc.location.country.toLowerCase().includes(query)
    )
  }

  // Filtre par prix
  if (currentFilters.value.priceRange[0] > 0 || currentFilters.value.priceRange[1] < 1000) {
    filtered = filtered.filter(acc => 
      acc.price >= currentFilters.value.priceRange[0] && 
      acc.price <= currentFilters.value.priceRange[1]
    )
  }

  // Filtre par type de propriété
  if (currentFilters.value.propertyType.length > 0) {
    filtered = filtered.filter(acc => 
      currentFilters.value.propertyType.includes(acc.propertyType)
    )
  }

  // Filtre par nombre de voyageurs
  if (currentFilters.value.maxGuests > 0) {
    filtered = filtered.filter(acc => acc.maxGuests >= currentFilters.value.maxGuests)
  }

  // Filtre par nombre de chambres
  if (currentFilters.value.bedrooms > 0) {
    filtered = filtered.filter(acc => acc.bedrooms >= currentFilters.value.bedrooms)
  }

  // Filtre par nombre de salles de bain
  if (currentFilters.value.bathrooms > 0) {
    filtered = filtered.filter(acc => acc.bathrooms >= currentFilters.value.bathrooms)
  }

  // Filtre par équipements
  if (currentFilters.value.amenities.length > 0) {
    filtered = filtered.filter(acc => 
      currentFilters.value.amenities.every(amenity => 
        acc.amenities.includes(amenity)
      )
    )
  }

    // Filtre par tags (convertir les IDs en labels pour la comparaison)
    if (currentFilters.value.tags.length > 0) {
      const filterTagLabels = getTagLabels(currentFilters.value.tags)
      filtered = filtered.filter(acc => 
        acc.tags && 
        filterTagLabels.some(tagLabel => 
          acc.tags!.includes(tagLabel)
        )
      )
    }

    // Filtre géolocalisé (recherche par rayon)
    if (currentFilters.value.locationRadius && currentFilters.value.locationRadius.center && currentFilters.value.locationRadius.radiusKm > 0) {
      const { center, radiusKm } = currentFilters.value.locationRadius
      filtered = filtered.filter(acc => {
        if (!acc.location.coordinates) return false
        try {
          const distance = calculateDistance(acc.location.coordinates, center)
          return distance <= radiusKm
        } catch (error) {
          console.error('Erreur lors du calcul de distance:', error)
          return false
        }
      })
    }

  // Tri
  switch (sortBy.value) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating-desc':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'title-asc':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
  }

  return filtered
  } catch (error) {
    console.error('Erreur dans filteredAccommodations:', error)
    return []
  }
})

// Vérifier si des filtres sont actifs
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    currentFilters.value.priceRange[0] > 0 ||
    currentFilters.value.priceRange[1] < 1000 ||
    currentFilters.value.propertyType.length > 0 ||
    currentFilters.value.amenities.length > 0 ||
    currentFilters.value.tags.length > 0 ||
    currentFilters.value.maxGuests > 0 ||
    currentFilters.value.bedrooms > 0 ||
    currentFilters.value.bathrooms > 0 ||
    (currentFilters.value.locationRadius !== undefined && currentFilters.value.locationRadius?.radiusKm > 0)
  )
})

// Pagination - Utiliser les données de l'API directement (pas de pagination locale)
// car l'API gère déjà la pagination
const totalPages = computed(() => pagination.value.totalPages || 1)

const paginatedAccommodations = computed(() => {
  // Les données viennent déjà paginées de l'API, donc on les retourne telles quelles
  // après le filtrage local (qui peut réduire le nombre d'éléments affichés)
  const result = filteredAccommodations.value
  console.log('📄 Pagination:', {
    totalFromAPI: pagination.value.total,
    filteredLocal: filteredAccommodations.value.length,
    page: currentPage.value,
    totalPages: totalPages.value,
    displayed: result.length
  })
  return result
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Méthodes
const handleFiltersChanged = (filters: FilterOptions) => {
  currentFilters.value = filters
  currentPage.value = 1 // Reset à la première page
}

const goToDetail = (id: string) => {
  router.push(`/accommodation/${id}`)
}

// Gérer la recherche (ajout à l'historique)
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value)
    showHistoryDropdown.value = false
  }
}

// Sélectionner un élément de l'historique
const selectHistoryItem = (item: string) => {
  searchQuery.value = item
  showHistoryDropdown.value = false
}

// Masquer le dropdown avec délai pour permettre les clics
const hideHistoryDropdown = () => {
  setTimeout(() => {
    showHistoryDropdown.value = false
  }, 200)
}

// Réinitialiser la page quand la recherche change
watch(searchQuery, () => {
  currentPage.value = 1
})

// Ajouter à l'historique quand on effectue une recherche
watch(searchQuery, (newValue, oldValue) => {
  if (newValue && newValue.trim().length >= 2 && newValue !== oldValue) {
    // Attendre un peu avant d'ajouter à l'historique (debounce)
    setTimeout(() => {
      if (searchQuery.value === newValue) {
        addToHistory(newValue)
      }
    }, 1000)
  }
})

// Charger les logements depuis l'API
const loadAccommodations = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Construire les filtres API depuis les filtres locaux
    const apiFilters: any = {
      page: currentPage.value,
      limit: itemsPerPage,
      status: 'actif',
    }
    
    // Ajouter les filtres
    if (currentFilters.value.priceRange[0] > 0) {
      apiFilters.minPrice = currentFilters.value.priceRange[0]
    }
    if (currentFilters.value.priceRange[1] < 1000) {
      apiFilters.maxPrice = currentFilters.value.priceRange[1]
    }
    
    if (currentFilters.value.propertyType.length > 0) {
      apiFilters.type = currentFilters.value.propertyType[0] // API supporte un seul type
    }
    
    if (currentFilters.value.maxGuests > 0) {
      apiFilters.minCapacity = currentFilters.value.maxGuests
    }
    
    // Recherche textuelle sur ville ou pays
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim()
      // Essayer d'abord la ville, puis le pays
      if (query.length > 2) {
        apiFilters.city = query
      }
    }
    
    // Mapping du tri
    const sortMapping: Record<string, { sortBy: string; sortOrder: string }> = {
      'price-asc': { sortBy: 'pricePerNight', sortOrder: 'asc' },
      'price-desc': { sortBy: 'pricePerNight', sortOrder: 'desc' },
      'rating-desc': { sortBy: 'averageRating', sortOrder: 'desc' },
      'date-desc': { sortBy: 'createdAt', sortOrder: 'desc' },
    }
    
    if (sortMapping[sortBy.value]) {
      Object.assign(apiFilters, sortMapping[sortBy.value])
    }
    
    const response = await logementService.getAll(apiFilters)
    console.log('📦 Réponse API:', response)
    console.log('📦 Propriétés transformées:', response.properties)
    console.log('📦 Pagination API:', {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages
    })
    
    // Si c'est la page 1 ou si on change de page, remplacer les données
    // Sinon, on pourrait append pour une pagination infinie
    if (currentPage.value === 1) {
      allAccommodations.value = response.properties
    } else {
      // Pour les pages suivantes, on remplace car on fait une nouvelle requête
      allAccommodations.value = response.properties
    }
    
    console.log('📦 allAccommodations après assignation:', allAccommodations.value.length, 'logements')
    pagination.value = {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
    }
  } catch (err: any) {
    console.error('Erreur lors du chargement des logements:', err)
    
    // Gérer les erreurs spécifiques
    if (err.response?.status === 503) {
      error.value = err.response?.data?.message || 'La base de données n\'est pas accessible. Veuillez démarrer PostgreSQL.'
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = err.message || 'Erreur lors du chargement des logements'
    }
    
    // En cas d'erreur, utiliser les données mockées comme fallback
    allAccommodations.value = accommodations
    pagination.value = {
      total: accommodations.length,
      page: 1,
      limit: itemsPerPage,
      totalPages: Math.ceil(accommodations.length / itemsPerPage),
    }
  } finally {
    isLoading.value = false
  }
}

// Watchers pour recharger les données
watch([currentPage, sortBy], () => {
  loadAccommodations()
})

watch([currentFilters, searchQuery], () => {
  currentPage.value = 1
  loadAccommodations()
}, { deep: true })

onMounted(() => {
  console.log('📋 AccommodationListView: Composant monté')
  loadAccommodations()
})
</script>
