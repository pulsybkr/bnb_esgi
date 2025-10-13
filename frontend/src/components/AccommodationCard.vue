<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="relative">
      <img 
        :src="accommodation.images[0]" 
        :alt="accommodation.title"
        class="w-full h-64 object-cover"
        @error="handleImageError"
      />
      <div class="absolute top-3 right-3">
        <button class="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
          <Heart class="w-5 h-5 text-gray-600" />
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
  </div>
</template>

<script setup lang="ts">
import { Heart, Star, Users, Bed, Bath } from 'lucide-vue-next'
import type { Accommodation } from '@/types/accommodation'

defineProps<{
  accommodation: Accommodation
}>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
}
</script>

