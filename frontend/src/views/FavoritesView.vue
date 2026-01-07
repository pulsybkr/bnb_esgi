<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <SimpleHeader />

    <main class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <button
          @click="$router.back()"
          class="flex items-center text-gray-600 hover:text-african-green mb-4 transition-colors group"
          type="button"
        >
          <ArrowLeft class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Retour</span>
        </button>
        <div class="flex items-center gap-3">
          <Heart class="w-8 h-8 text-african-green fill-african-green" />
          <h1 class="text-3xl font-bold text-gray-900">Mes favoris</h1>
        </div>
        <p class="text-gray-600 mt-2">Retrouvez ici tous les logements que vous avez enregistrés.</p>
      </div>

      <!-- Grille des favoris -->
      <div v-if="!isLoading && favoriteAccommodations.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AccommodationCard 
          v-for="accommodation in favoriteAccommodations" 
          :key="accommodation.id"
          :accommodation="accommodation"
        />
      </div>

      <!-- Message si aucun favori -->
      <div v-if="!isLoading && favoriteAccommodations.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <Heart class="w-12 h-12 text-african-green" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Votre liste est vide</h3>
        <p class="text-gray-600 mb-8 max-w-md">Vous n'avez pas encore de favoris. Cliquez sur le cœur d'un logement pour l'ajouter à votre liste.</p>
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-african-green text-white rounded-xl hover:bg-african-green-dark transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Découvrir les lieux
        </router-link>
      </div>

      <!-- Message si chargement -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="bg-gray-200 aspect-[4/3] rounded-2xl mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Heart, ArrowLeft } from 'lucide-vue-next'
import SimpleHeader from '@/components/layout/SimpleHeader.vue'
import AccommodationCard from '@/components/accommodation/AccommodationCard.vue'
import { favoriService } from '@/services/favori.service'
import type { Accommodation } from '@/types/accommodation'

const favoriteAccommodations = ref<Accommodation[]>([])
const isLoading = ref(true)

// Charger les favoris directement depuis le backend
const loadFavorites = async () => {
  isLoading.value = true
  try {
    favoriteAccommodations.value = await favoriService.getAll()
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error)
    favoriteAccommodations.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFavorites()
})
</script>


