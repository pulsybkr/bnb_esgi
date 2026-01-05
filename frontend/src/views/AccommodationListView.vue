<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar avec filtres -->
        <div class="w-80 flex-shrink-0">
          <FilterSidebar @filters-changed="handleFiltersChanged" />
        </div>

        <!-- Contenu principal -->
        <div class="flex-1">
          <!-- Barre de recherche et tri -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">
                {{ filteredAccommodations.length }} logements trouvés
              </h2>
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

          <!-- Grille des logements -->
          <div v-if="filteredAccommodations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AccommodationCard 
              v-for="accommodation in paginatedAccommodations" 
              :key="accommodation.id"
              :accommodation="accommodation"
              @click="goToDetail(accommodation.id)"
              class="cursor-pointer"
            />
          </div>

          <!-- Message si aucun résultat -->
          <div v-else class="text-center py-12">
            <Home class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun logement trouvé</h3>
            <p class="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <nav class="flex space-x-2">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
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
              >
                {{ page }}
              </button>
              
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home } from 'lucide-vue-next'
import AccommodationCard from '@/components/AccommodationCard.vue'
import FilterSidebar from '@/components/FilterSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import { accommodations } from '@/data/fixtures'
import type { Accommodation, FilterOptions } from '@/types/accommodation'

const router = useRouter()

// État réactif
const allAccommodations = ref<Accommodation[]>(accommodations)
const currentFilters = ref<FilterOptions>({
  priceRange: [0, 1000],
  propertyType: [],
  amenities: [],
  maxGuests: 0,
  bedrooms: 0,
  bathrooms: 0
})
const sortBy = ref('price-asc')
const currentPage = ref(1)
const itemsPerPage = 9

// Filtrage des logements
const filteredAccommodations = computed(() => {
  let filtered = [...allAccommodations.value]

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
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredAccommodations.value.length / itemsPerPage))

const paginatedAccommodations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAccommodations.value.slice(start, end)
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

// Réinitialiser la page quand les filtres changent
const resetPagination = () => {
  currentPage.value = 1
}

onMounted(() => {
  // Initialiser avec tous les logements
})
</script>

