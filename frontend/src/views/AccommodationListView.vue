<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-african-green flex items-center gap-2">
              <Home class="w-8 h-8" />
              <span>bnb</span>
            </h1>
          </div>
          
          <!-- Search bar -->
          <div class="flex-1 max-w-2xl mx-8 relative hidden md:block">
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher une destination..."
                class="w-full px-6 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-african-green focus:border-transparent transition-all shadow-sm hover:shadow-md"
                @focus="showHistoryDropdown = true"
                @blur="hideHistoryDropdown"
                @keyup.enter="handleSearch"
              />
              <Search class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
                :title="isAuthenticated ? 'Mon compte' : 'Se connecter'"
              >
                <X class="w-5 h-5" />
              </button>

              <!-- Menu déroulant -->
              <div 
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
              >
                <!-- Utilisateur connecté -->
                <template v-if="isAuthenticated && user">
                  <!-- Profil utilisateur -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-semibold text-gray-900">{{ fullName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                  </div>

            <!-- Search history dropdown -->
            <Transition name="dropdown">
              <div 
                v-if="showHistoryDropdown && searchHistory.length > 0 && !searchQuery"
                class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar animate-slide-down"
              >
                <div class="p-3">
                  <div class="flex justify-between items-center px-3 py-2 mb-1">
                    <h3 class="text-sm font-semibold text-gray-700">Recherches récentes</h3>
                    <button 
                      @mousedown.prevent="clearHistory"
                      class="text-xs text-african-green hover:text-african-green-dark font-medium"
                      type="button"
                    >
                      Tout effacer
                    </button>
                  </div>
                  <div
                    v-for="(item, index) in searchHistory"
                    :key="index"
                    @mousedown.prevent="selectHistoryItem(item)"
                    class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg group cursor-pointer transition-colors"
                  >
                    <div class="flex items-center space-x-3">
                      <Search class="w-4 h-4 text-gray-400" />
                      <span class="text-sm text-gray-700">{{ item }}</span>
                    </div>
                    <button
                      @mousedown.prevent.stop="removeFromHistory(item)"
                      class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                      type="button"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Controls bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <!-- Results count -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-1">
            {{ totalItems }} logement{{ totalItems > 1 ? 's' : '' }}
          </h2>
          <p class="text-sm text-gray-600">Trouvez votre logement idéal</p>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Filter button -->
          <button
            @click="openFilterModal"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-african-green hover:shadow-md transition-all font-medium text-gray-700"
            type="button"
          >
            <SlidersHorizontal class="w-5 h-5" />
            <span>Filtres</span>
            <span v-if="activeFiltersCount > 0" class="ml-1 px-2 py-0.5 bg-african-green text-white text-xs rounded-full">
              {{ activeFiltersCount }}
            </span>
          </button>

          <!-- Sort -->
          <div class="relative">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-african-green hover:shadow-md transition-all font-medium text-gray-700"
              type="button"
            >
              <ArrowUpDown class="w-5 h-5" />
              <span class="hidden sm:inline">Trier</span>
            </button>

            <!-- Sort dropdown -->
            <Transition name="dropdown">
              <div
                v-if="showSortDropdown"
                class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down"
              >
                <button
                  v-for="option in sortOptions"
                  :key="option.value"
                  @click="selectSort(option.value)"
                  class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  :class="{ 'bg-green-50 text-african-green': sortBy === option.value }"
                  type="button"
                >
                  <component :is="option.icon" class="w-4 h-4" />
                  <span class="text-sm font-medium">{{ option.label }}</span>
                  <Check v-if="sortBy === option.value" class="w-4 h-4 ml-auto" />
                </button>
              </div>
            </Transition>

            <!-- Backdrop for sort dropdown -->
            <div
              v-if="showSortDropdown"
              @click="showSortDropdown = false"
              class="fixed inset-0 z-40"
            ></div>
          </div>

          <!-- View toggle -->
          <ViewToggle v-model="currentView" />
        </div>
      </div>

      <!-- Popular accommodations (if no filters) -->
      <PopularAccommodations
        v-if="!hasActiveFilters"
        :all-accommodations="allAccommodations"
        :location="currentFilters.locationRadius?.center"
        :location-name="searchQuery || undefined"
        :radius-km="currentFilters.locationRadius?.radiusKm || 50"
        :max-results="6"
        @accommodation-selected="goToDetail"
        class="mb-12"
      />

      <!-- Recommendations (if no filters) -->
      <RecommendationsAccommodations
        v-if="!hasActiveFilters"
        :all-accommodations="allAccommodations"
        :user-preferences="userPreferences"
        :max-results="6"
        recommendation-type="personalized"
        @accommodation-selected="goToDetail"
        class="mb-12"
      />

      <!-- List view -->
      <div v-if="currentView === 'list'">
        <!-- Accommodations grid -->
        <div v-if="displayedAccommodations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AccommodationCard 
            v-for="accommodation in displayedAccommodations" 
            :key="accommodation.id"
            :accommodation="accommodation"
            class="animate-slide-up"
          />
        </div>

        <!-- No results -->
        <div v-else class="text-center py-20">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Home class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun logement trouvé</h3>
          <p class="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
          <button
            @click="clearAllFilters"
            class="px-6 py-3 bg-african-green text-white rounded-full hover:bg-african-green-dark transition-colors font-medium"
            type="button"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <nav class="flex items-center gap-2">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-african-green hover:text-african-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              type="button"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                page === currentPage 
                  ? 'text-white bg-african-green shadow-md' 
                  : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-african-green hover:text-african-green'
              ]"
              type="button"
            >
              {{ page }}
            </button>
            
            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-african-green hover:text-african-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              type="button"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

      <!-- Map view -->
      <div v-else class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-6">
          <Map class="w-12 h-12 text-african-green" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Vue carte</h3>
        <p class="text-gray-600 max-w-md mx-auto">
          La vue carte sera bientôt disponible. Elle vous permettra de visualiser tous les logements sur une carte interactive.
        </p>
      </div>
    </div>

    <!-- Filter Modal -->
    <FilterModal
      :is-open="isFilterModalOpen"
      :filters="currentFilters"
      @close="closeFilterModal"
      @filters-changed="handleFiltersChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, User, Home, X, SlidersHorizontal, ArrowUpDown, 
  ChevronLeft, ChevronRight, Map, Check,
  TrendingUp, TrendingDown, Star, ArrowDownAZ
} from 'lucide-vue-next'
import AccommodationCard from '@/components/accommodation/AccommodationCard.vue'
import FilterModal from '@/components/search/FilterModal.vue'
import ViewToggle from '@/components/ui/ViewToggle.vue'
import UserMenu from '@/components/auth/UserMenu.vue'
import type { Accommodation, FilterOptions } from '@/types/accommodation'
import { useSearchHistory } from '@/composables/useSearchHistory'
import { useFavorites } from '@/composables/useFavorites'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import { getTagLabels } from '@/data/tags'
import { generatePreferencesFromHistory } from '@/utils/recommendations'
import type { UserPreferences } from '@/utils/recommendations'
import { calculateDistance } from '@/utils/geolocation'
import PopularAccommodations from '@/components/accommodation/PopularAccommodations.vue'
import RecommendationsAccommodations from '@/components/accommodation/RecommendationsAccommodations.vue'
import { useLogements } from '@/composables/useLogements'
import { mapLogementsToAccommodations } from '@/utils/mappers/logementMapper'
import { buildBackendFilters } from '@/utils/mappers/filterMapper'
import { useDebounceFn } from '@vueuse/core'

const router = useRouter()
const authStore = useAuthStore()
const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()
const { properties, isLoading: isLoadingProperties, error: apiError, loadProperties, pagination } = useLogements()

// State
const allAccommodations = ref<Accommodation[]>([])
const totalItems = ref(0)
const totalPages = ref(0)
const searchQuery = ref('')
const showHistoryDropdown = ref(false)
const currentFilters = ref<FilterOptions>({
  priceRange: [0, 1000000],
  propertyType: [],
  amenities: [],
  tags: [],
  maxGuests: 0,
  bedrooms: 0,
  bathrooms: 0
})
const sortBy = ref('price-asc')
const currentPage = ref(1)
const itemsPerPage = 20
const currentView = ref<'list' | 'map'>('list')
const isFilterModalOpen = ref(false)
const showSortDropdown = ref(false)

// Sort options with icons
const sortOptions = [
  { value: 'price-asc', label: 'Prix croissant', icon: TrendingUp },
  { value: 'price-desc', label: 'Prix décroissant', icon: TrendingDown },
  { value: 'rating-desc', label: 'Mieux notés', icon: Star },
  { value: 'title-asc', label: 'Nom A-Z', icon: ArrowDownAZ }
]

// User preferences for recommendations
const userPreferences = computed<UserPreferences | undefined>(() => {
  try {
    if (searchHistory.value.length > 0) {
      const viewedAccommodations = allAccommodations.value.filter(acc =>
        searchHistory.value.some(query =>
          query.toLowerCase().includes(acc.location.city.toLowerCase()) ||
          acc.title.toLowerCase().includes(query.toLowerCase())
        )
      ).slice(0, 5)

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

// Fonction pour charger les logements avec filtres depuis l'API
const loadAccommodationsWithFilters = async () => {
  try {
    const backendFilters = buildBackendFilters({
      searchQuery: searchQuery.value,
      priceRange: currentFilters.value.priceRange,
      propertyTypes: currentFilters.value.propertyType,
      maxGuests: currentFilters.value.maxGuests,
      page: currentPage.value,
      limit: itemsPerPage,
      sortBy: sortBy.value
    })
    
    await loadProperties(backendFilters)
    
    // Mapper les données du backend vers le format frontend
    if (properties.value && properties.value.length > 0) {
      allAccommodations.value = mapLogementsToAccommodations(properties.value)
    } else {
      allAccommodations.value = []
    }
    
    // Mettre à jour la pagination depuis la réponse API
    if (pagination.value) {
      totalPages.value = pagination.value.totalPages
      totalItems.value = pagination.value.total
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des logements:', error)
    allAccommodations.value = []
  }
}

// Debounced search pour éviter trop de requêtes
const debouncedLoadAccommodations = useDebounceFn(loadAccommodationsWithFilters, 500)

// Les accommodations affichées sont directement celles de l'API (pas de filtrage client)
const displayedAccommodations = computed(() => allAccommodations.value)

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (currentFilters.value.priceRange[0] > 0 || currentFilters.value.priceRange[1] < 1000000) count++
  if (currentFilters.value.propertyType.length > 0) count++
  if (currentFilters.value.amenities.length > 0) count++
  if (currentFilters.value.tags.length > 0) count++
  if (currentFilters.value.maxGuests > 0) count++
  if (currentFilters.value.bedrooms > 0) count++
  if (currentFilters.value.bathrooms > 0) count++
  if (currentFilters.value.locationRadius && currentFilters.value.locationRadius.radiusKm > 0) count++
  return count
})

// Check if filters are active
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    currentFilters.value.priceRange[0] > 0 ||
    currentFilters.value.priceRange[1] < 1000000 ||
    currentFilters.value.propertyType.length > 0 ||
    currentFilters.value.amenities.length > 0 ||
    currentFilters.value.tags.length > 0 ||
    currentFilters.value.maxGuests > 0 ||
    currentFilters.value.bedrooms > 0 ||
    currentFilters.value.bathrooms > 0 ||
    (currentFilters.value.locationRadius !== undefined && currentFilters.value.locationRadius?.radiusKm > 0)
  )
})

// Pagination - visiblePages reste calculé côté client pour l'affichage
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const handleFiltersChanged = (filters: FilterOptions) => {
  currentFilters.value = filters
  currentPage.value = 1
}

const goToDetail = (id: string) => {
  router.push(`/accommodation/${id}`)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value)
    showHistoryDropdown.value = false
  }
}

const selectHistoryItem = (item: string) => {
  searchQuery.value = item
  showHistoryDropdown.value = false
}

const hideHistoryDropdown = () => {
  setTimeout(() => {
    showHistoryDropdown.value = false
  }, 200)
}

const openFilterModal = () => {
  isFilterModalOpen.value = true
}

const closeFilterModal = () => {
  isFilterModalOpen.value = false
}

const selectSort = (value: string) => {
  sortBy.value = value
  showSortDropdown.value = false
}

const clearAllFilters = () => {
  currentFilters.value = {
    priceRange: [0, 1000],
    propertyType: [],
    amenities: [],
    tags: [],
    maxGuests: 0,
    bedrooms: 0,
    bathrooms: 0
  }
  searchQuery.value = ''
}

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
})

watch(searchQuery, (newValue, oldValue) => {
  if (newValue && newValue.trim().length >= 2 && newValue !== oldValue) {
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
    console.log('Réponse API:', response)
    console.log('Propriétés transformées:', response.properties)
    console.log('Pagination API:', {
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
    
    console.log('allAccommodations après assignation:', allAccommodations.value.length, 'logements')
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

// Fermer le menu utilisateur si on clique ailleurs
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
}

// Recharger les données quand on revient sur la page
import { onActivated } from 'vue'

// Watchers pour recharger les données quand les filtres changent
watch([currentFilters, sortBy, currentPage], () => {
  loadAccommodationsWithFilters()
}, { deep: true })

// Watcher pour la recherche avec debounce
watch(searchQuery, () => {
  currentPage.value = 1 // Reset à la page 1 lors d'une nouvelle recherche
  debouncedLoadAccommodations()
})

// Watcher pour reset la page quand on change de filtre
watch(currentFilters, () => {
  currentPage.value = 1
}, { deep: true })

// Watcher pour reset la page quand on change le tri
watch(sortBy, () => {
  currentPage.value = 1
})

onMounted(async () => {
  console.log('📋 AccommodationListView: Composant monté')
  
  // Charger les logements avec les filtres initiaux
  await loadAccommodationsWithFilters()
  
  console.log(`✅ ${totalItems.value} logements trouvés`)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

