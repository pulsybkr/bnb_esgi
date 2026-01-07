<template>
  <router-link
    :to="`/accommodation/${accommodation.id}`"
    class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div class="relative">
      <img 
        :src="currentImageUrl" 
        :alt="accommodation.title"
        class="w-full h-64 object-cover"
        @error="handleImageError"
        @load="handleImageLoad"
        v-show="imageLoaded"
        style="min-height: 256px;"
      />
      <div 
        v-show="!imageLoaded"
        class="w-full h-64 bg-gray-200 flex items-center justify-center absolute inset-0"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p class="text-xs text-gray-500">Chargement...</p>
        </div>
      </div>
      <div class="absolute top-3 right-3 z-10">
        <button 
          @click.prevent.stop="toggleFavorite"
          @mousedown.prevent.stop
          class="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          :class="{ 'bg-red-50': isFavorite }"
          type="button"
        >
          <Heart 
            class="w-5 h-5 transition-colors pointer-events-none" 
            :class="isFavorite ? 'text-red-600 fill-red-600' : 'text-gray-600'"
          />
        </button>
      </div>
    </div>
    
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">
          {{ accommodation.title }}
        </h3>
        <div class="flex items-center ml-2">
          <Star class="w-4 h-4 text-yellow-400 fill-current" />
          <span class="text-sm text-gray-600 ml-1">{{ accommodation.rating }}</span>
        </div>
      </div>
      
      <p class="text-sm text-gray-600 mb-3">
        {{ accommodation.location.city }}, {{ accommodation.location.country }}
      </p>

      <div v-if="accommodation.tags && accommodation.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
        <span
          v-for="tag in accommodation.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
        >
          {{ tag }}
        </span>
        <span
          v-if="accommodation.tags.length > 3"
          class="px-2 py-1 text-xs font-medium text-gray-500"
        >
          +{{ accommodation.tags.length - 3 }}
        </span>
      </div>
      
      <div class="space-y-1 mb-3">
        <div class="flex items-center text-sm text-gray-600">
          <Users class="w-4 h-4 mr-2" />
          <span>{{ accommodation.maxGuests }} voyageurs</span>
        </div>
        <div class="flex items-center text-sm text-gray-600">
          <Bed class="w-4 h-4 mr-2" />
          <span>{{ accommodation.bedrooms }} chambre{{ accommodation.bedrooms > 1 ? 's' : '' }}</span>
        </div>
        <div class="flex items-center text-sm text-gray-600">
          <Bath class="w-4 h-4 mr-2" />
          <span>{{ accommodation.bathrooms }} salle{{ accommodation.bathrooms > 1 ? 's' : '' }} de bain</span>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div>
          <span class="text-xl font-bold text-gray-900">€{{ accommodation.price }}</span>
          <span class="text-gray-600"> / nuit</span>
        </div>
        <div class="text-sm text-gray-600">
          {{ accommodation.reviewCount }} avis
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Heart, Star, Users, Bed, Bath } from 'lucide-vue-next'
import type { Accommodation } from '@/types/accommodation'
import { useFavorites } from '@/composables/useFavorites'

const props = defineProps<{
  accommodation: Accommodation
}>()

const { toggleFavorite: toggleFavoriteAction, isFavorite: isFavoriteFn } = useFavorites()

const isFavorite = computed(() => isFavoriteFn(props.accommodation.id))
const imageLoaded = ref(false)
const imageError = ref(false)
const currentImageUrl = ref<string>('')

// Construire l'URL de l'image correctement une seule fois
const buildImageUrl = (url: string): string => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
  }
  
  // Si l'URL commence déjà par http, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Si c'est un chemin relatif, construire l'URL complète
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'
  return url.startsWith('/') ? `${apiBaseUrl}${url}` : `${apiBaseUrl}/${url}`
}

let errorHandled = false

// Initialiser l'URL de l'image
const initializeImage = () => {
  errorHandled = false // Réinitialiser le flag d'erreur
  if (props.accommodation.images && props.accommodation.images.length > 0) {
    currentImageUrl.value = buildImageUrl(props.accommodation.images[0])
  } else {
    currentImageUrl.value = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
  }
  imageLoaded.value = false
  imageError.value = false
}

// Initialiser au montage
initializeImage()

const toggleFavorite = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  toggleFavoriteAction(props.accommodation.id)
}

const handleImageError = (event: Event) => {
  // Ne traiter l'erreur qu'une seule fois
  if (errorHandled || imageError.value) {
    imageLoaded.value = true // Forcer l'affichage pour éviter le clignotement
    return
  }
  
  errorHandled = true
  imageError.value = true
  const img = event.target as HTMLImageElement
  
  console.warn('Erreur de chargement d\'image:', img.src)
  
  // Utiliser une image de fallback seulement si ce n'est pas déjà l'image de fallback
  if (!img.src.includes('unsplash.com') && !img.src.includes('placeholder')) {
    currentImageUrl.value = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
    // Ne pas réinitialiser imageLoaded, utiliser directement le fallback
  }
  // Toujours marquer comme chargé pour arrêter le clignotement
  imageLoaded.value = true
}

const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

// Watcher pour réinitialiser quand l'accommodation change (uniquement si vraiment nécessaire)
watch(() => props.accommodation.id, () => {
  initializeImage()
})
</script>
