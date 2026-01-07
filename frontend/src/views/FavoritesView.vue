<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-indigo-600 hover:text-indigo-700">
              bnb
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/favorites"
              class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Mes favoris"
            >
              <Heart class="w-5 h-5 fill-red-500 text-red-500" />
              <span 
                v-if="favoritesList.value && favoritesList.value.length > 0"
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
      <div class="mb-6">
        <button
          @click="$router.back()"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          type="button"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Retour
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Mes favoris</h1>
      </div>

      <!-- Grille des favoris -->
      <div v-if="!isLoading && favoriteAccommodations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AccommodationCard 
          v-for="accommodation in favoriteAccommodations" 
          :key="accommodation.id"
          :accommodation="accommodation"
        />
      </div>

      <!-- Message si aucun favori -->
      <div v-if="!isLoading && favoriteAccommodations.length === 0" class="text-center py-12">
        <Heart class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
        <p class="text-gray-600 mb-4">Vous n'avez pas encore ajouté de logements à vos favoris</p>
        <router-link
          to="/"
          class="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
        >
          Découvrir les logements
        </router-link>
      </div>

      <!-- Message si chargement -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">Chargement de vos favoris...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Heart, User, ArrowLeft } from 'lucide-vue-next'
import AccommodationCard from '@/components/AccommodationCard.vue'
import { useFavorites } from '@/composables/useFavorites'
import { logementService } from '@/services/logement.service'
import type { Accommodation } from '@/types/accommodation'

const { favoritesList } = useFavorites()

const allAccommodations = ref<Accommodation[]>([])
const isLoading = ref(true)

// Récupérer uniquement les logements favoris (réactif aux changements de favoritesList)
const favoriteAccommodations = computed(() => {
  if (!favoritesList.value || favoritesList.value.length === 0) {
    return []
  }
  return allAccommodations.value.filter(acc => 
    favoritesList.value.includes(acc.id)
  )
})

// Surveiller les changements de favoritesList pour recharger si nécessaire
watch(favoritesList, () => {
  // La liste se met à jour automatiquement grâce au computed
  // mais on peut forcer un rechargement si nécessaire
}, { deep: true })

// Charger tous les logements pour filtrer les favoris
const loadAccommodations = async () => {
  isLoading.value = true
  try {
    // Charger tous les logements (on pourrait optimiser en chargeant seulement les favoris)
    const response = await logementService.getAll({
      page: 1,
      limit: 100, // Charger beaucoup pour avoir tous les favoris
      status: 'actif',
    })
    allAccommodations.value = response.properties || []
  } catch (error) {
    console.error('Erreur lors du chargement des logements:', error)
    allAccommodations.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  try {
    loadAccommodations()
  } catch (error) {
    console.error('Erreur au montage du composant:', error)
    isLoading.value = false
  }
})
</script>

