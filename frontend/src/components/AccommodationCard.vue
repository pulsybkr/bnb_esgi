<template>
  <router-link
    :to="`/accommodation/${accommodation.id}`"
    class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <div class="relative">
      <img 
        :src="accommodation.images[0]" 
        :alt="accommodation.title"
        class="w-full h-64 object-cover"
        @error="handleImageError"
      />
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
import { computed } from 'vue'
import { Heart, Star, Users, Bed, Bath } from 'lucide-vue-next'
import type { Accommodation } from '@/types/accommodation'
import { useFavorites } from '@/composables/useFavorites'

const props = defineProps<{
  accommodation: Accommodation
}>()

const { toggleFavorite: toggleFavoriteAction, isFavorite: isFavoriteFn } = useFavorites()

const isFavorite = computed(() => isFavoriteFn(props.accommodation.id))

const toggleFavorite = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  toggleFavoriteAction(props.accommodation.id)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
}
</script>
