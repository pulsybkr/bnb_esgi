<template>
  <router-link
    :to="`/accommodation/${accommodation.id}`"
    class="block bg-white rounded-xl overflow-hidden hover-lift cursor-pointer group"
  >
    <div class="relative overflow-hidden">
      <img 
        :src="accommodation.images[0]" 
        :alt="accommodation.title"
        class="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
        @error="handleImageError"
      />
      <div class="absolute top-4 right-4">
        <button 
          @click.stop="toggleFavorite"
          class="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
          :class="{ 'bg-red-50': isFavorite }"
        >
          <Heart 
            class="w-5 h-5 transition-colors" 
            :class="isFavorite ? 'text-red-600 fill-current' : 'text-gray-700'"
          />
        </button>
      </div>
      
      <!-- Rating badge -->
      <div class="absolute bottom-4 left-4">
        <div class="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
          <Star class="w-4 h-4 text-yellow-500 fill-current" />
          <span class="text-sm font-semibold text-gray-900">{{ accommodation.rating }}</span>
        </div>
      </div>
    </div>
    
    <div class="p-5">
      <div class="mb-2">
        <h3 class="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-african-green transition-colors">
          {{ accommodation.title }}
        </h3>
      </div>
      
      <p class="text-sm text-gray-600 mb-4 flex items-center">
        <MapPin class="w-4 h-4 mr-1 text-african-green" />
        {{ accommodation.location.city }}, {{ accommodation.location.country }}
      </p>
      
      <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span class="flex items-center gap-1">
          <Users class="w-4 h-4" />
          {{ accommodation.maxGuests }}
        </span>
        <span class="flex items-center gap-1">
          <Bed class="w-4 h-4" />
          {{ accommodation.bedrooms }}
        </span>
        <span class="flex items-center gap-1">
          <Bath class="w-4 h-4" />
          {{ accommodation.bathrooms }}
        </span>
      </div>
      
      <div class="flex justify-between items-end pt-4 border-t border-gray-100">
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-bold text-gray-900">€{{ accommodation.price }}</span>
            <span class="text-sm text-gray-600">/ nuit</span>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Heart, Star, Users, Bed, Bath, MapPin } from 'lucide-vue-next'
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

